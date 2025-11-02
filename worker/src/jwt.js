// I will add helpers for signing and verifying JWT tokens using the Web Crypto API.
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function base64UrlEncode(input) {
  const bytes = typeof input === 'string' ? encoder.encode(input) : new Uint8Array(input);
  let binary = '';
  bytes.forEach((byte) => (binary += String.fromCharCode(byte)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlDecode(input) {
  let normalized = input.replace(/-/g, '+').replace(/_/g, '/');
  while (normalized.length % 4) normalized += '=';
  const binary = atob(normalized);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sign(data, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return base64UrlEncode(signature);
}

export async function createToken(payload, secret, expiresInHours = 8) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const body = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + expiresInHours * 60 * 60,
  };

  const headerSegment = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadSegment = base64UrlEncode(JSON.stringify(body));
  const signature = await sign(`${headerSegment}.${payloadSegment}`, secret);

  return `${headerSegment}.${payloadSegment}.${signature}`;
}

export async function verifyToken(token, secret) {
  const [headerSegment, payloadSegment, signature] = token.split('.');
  if (!headerSegment || !payloadSegment || !signature) {
    throw new Error('Malformed token');
  }

  const expectedSignature = await sign(`${headerSegment}.${payloadSegment}`, secret);
  if (expectedSignature !== signature) {
    throw new Error('Invalid signature');
  }

  const payload = JSON.parse(decoder.decode(base64UrlDecode(payloadSegment)));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }

  return payload;
}
