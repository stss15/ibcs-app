import { init, id, tx } from '@instantdb/admin';

const cache = new Map();

export function getDb(env) {
  const appId = env?.INSTANT_APP_ID;
  const adminToken = env?.INSTANT_ADMIN_TOKEN;

  if (!appId || !adminToken) {
    throw new Error('Missing INSTANT_APP_ID or INSTANT_ADMIN_TOKEN');
  }

  const key = `${appId}:${adminToken}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      init({
        appId,
        adminToken,
      }),
    );
  }

  return cache.get(key);
}

export { id, tx };
