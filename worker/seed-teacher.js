#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function seedTeacher() {
  console.log('============================================');
  console.log('  Seed Initial Teacher Account');
  console.log('============================================\n');

  const workerUrl = await question('Enter your Cloudflare Worker URL: ');
  const seedKey = await question('Enter your SEED_KEY: ');
  const username = await question('Teacher username [MrStewart]: ') || 'MrStewart';
  const password = await question('Teacher password: ');
  const displayName = await question('Display name [Mr. Stewart]: ') || 'Mr. Stewart';

  rl.close();

  if (!workerUrl || !seedKey || !password) {
    console.error('\n❌ Error: Worker URL, seed key, and password are required.');
    process.exit(1);
  }

  const url = `${workerUrl.replace(/\/$/, '')}/setup/seed`;
  
  console.log('\n📡 Sending request to:', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-seed-key': seedKey
      },
      body: JSON.stringify({
        teacher: {
          username,
          password,
          displayName
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('\n✅ Success!');
      console.log(JSON.stringify(data, null, 2));
      console.log('\n🎉 Teacher account created!');
      console.log(`\nLogin credentials:\n  Username: ${username}\n  Password: ${password}\n  Role: Teacher`);
    } else {
      console.error('\n❌ Error:', response.status);
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('\n❌ Failed to seed teacher:', error.message);
    process.exit(1);
  }
}

seedTeacher();

