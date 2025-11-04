#!/usr/bin/env node

import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const logDir = path.join(projectRoot, 'logs', 'worker');

await fs.promises.mkdir(logDir, { recursive: true });

function parseArgs(argv) {
  const args = {};
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue;
    const [key, value] = arg.slice(2).split('=');
    args[key] = value ?? true;
  }
  return args;
}

async function detectWorkerName(explicitName) {
  if (explicitName) return explicitName;

  const wranglerPath = path.join(projectRoot, 'worker', 'wrangler.toml');
  try {
    const contents = await fs.promises.readFile(wranglerPath, 'utf8');
    const match = contents.match(/^name\s*=\s*"([^"]+)"/m);
    if (match) {
      return match[1];
    }
  } catch (error) {
    console.warn('⚠️  Unable to read worker/wrangler.toml:', error.message);
  }

  return null;
}

const cliArgs = parseArgs(process.argv.slice(2));
const workerName = await detectWorkerName(cliArgs.name);

if (!workerName) {
  console.error('❌ Could not determine Worker name. Pass --name=<worker-name> or ensure worker/wrangler.toml has name = "...".');
  process.exit(1);
}

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, '-')
  .replace('T', '_')
  .replace('Z', '');
const logFilePath = path.join(logDir, `worker-tail-${timestamp}.ndjson`);
const logFile = fs.createWriteStream(logFilePath, { flags: 'a' });

console.log(`📡 Tailing worker logs for "${workerName}" (writing raw output to ${logFilePath})`);
console.log('🔐 Make sure you are logged in: npx wrangler whoami');
console.log('───────────────────────────────────────────────────────────────');

const tail = spawn('npx', ['wrangler', 'tail', workerName, '--format=json'], {
  cwd: projectRoot,
  stdio: ['inherit', 'pipe', 'pipe'],
});

tail.on('error', (error) => {
  console.error('Failed to start wrangler tail:', error);
  process.exitCode = 1;
});

tail.stderr.on('data', (chunk) => {
  process.stderr.write(chunk);
});

tail.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    handleLine(line);
  }
});

tail.on('close', (code) => {
  logFile.end();
  if (code !== 0) {
    console.warn(`wrangler tail exited with code ${code}`);
  }
});

process.on('SIGINT', () => {
  console.log('\nStopping tail...');
  tail.kill('SIGINT');
});

function handleLine(line) {
  logFile.write(`${line}\n`);

  let payload;
  try {
    payload = JSON.parse(line);
  } catch (error) {
    console.log(line);
    return;
  }

  if (payload.type === 'log' && Array.isArray(payload.logs)) {
    for (const logEntry of payload.logs) {
      const raw = Array.isArray(logEntry.message) ? logEntry.message.join(' ') : logEntry.message;
      if (typeof raw !== 'string') {
        continue;
      }
      try {
        const record = JSON.parse(raw);
        printSummarized(record);
      } catch {
        console.log(raw);
      }
    }
    return;
  }

  console.log(line);
}

function printSummarized(entry) {
  const ts = entry.ts || new Date().toISOString();
  const requestId = entry.requestId || '-';
  const level = (entry.level || 'info').toUpperCase();
  const event = entry.event || 'log';
  const method = entry.method || '';
  const pathLabel = entry.path || '';
  const route = entry.route ? `route=${entry.route}` : '';
  const status = entry.status !== undefined ? `status=${entry.status}` : '';
  const duration = entry.durationMs !== undefined ? `duration=${entry.durationMs}ms` : '';

  const parts = [route, status, duration].filter(Boolean);

  const header = `[${ts}] ${level.padEnd(5)} ${event.padEnd(22)} req=${requestId}`;
  const context = [method && pathLabel ? `${method} ${pathLabel}` : null, parts.length ? parts.join(' ') : null]
    .filter(Boolean)
    .join(' | ');

  if (context) {
    console.log(`${header} :: ${context}`);
  } else {
    console.log(header);
  }

  if (entry.body) {
    console.log(`  body: ${JSON.stringify(entry.body)}`);
  }
  if (entry.details) {
    console.log(`  details: ${JSON.stringify(entry.details)}`);
  }
  if (entry.error) {
    console.log(`  error: ${JSON.stringify(entry.error)}`);
  }
}

