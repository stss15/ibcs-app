import bcrypt from "bcryptjs";

const INSTANT_BASE = "https://api.instantdb.com/v1/app";
const BCRYPT_ROUNDS = 8;

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return withCORS(new Response(null, { status: 204 }), request, env);
    }
    try {
      const url = new URL(request.url);
      const path = url.pathname;

      if (path === "/auth/login" && request.method === "POST") {
        return withCORS(handleLogin(request, env), request, env);
      }
      if (path === "/auth/verify" && request.method === "POST") {
        return withCORS(handleVerify(request, env), request, env);
      }
      if (path === "/teacher/dashboard" && request.method === "GET") {
        return requireTeacher(request, env, handleTeacherDashboard);
      }
      if (path === "/teacher/classes" && request.method === "POST") {
        return requireTeacher(request, env, handleCreateClass);
      }
      if (path === "/teacher/students" && request.method === "POST") {
        return requireTeacher(request, env, handleCreateStudent);
      }
      if (path === "/setup/seed" && request.method === "POST") {
        return withCORS(handleSeed(request, env), request, env);
      }

      return withCORS(json({ error: "Not found" }, 404), request, env);
    } catch (err) {
      console.error("worker error", err);
      return withCORS(json({ error: "Internal Server Error" }, 500), request, env);
    }
  },
};

/* --------------------------- request handlers -------------------------- */

async function handleLogin(request, env) {
  const body = await readJson(request);
  const role = String(body.role || "teacher").toLowerCase();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!username || !password) return json({ error: "Username and password are required." }, 400);
  if (!["teacher","student"].includes(role)) return json({ error: "Role must be 'teacher' or 'student'." }, 400);

  const collection = role === "teacher" ? "teachers" : "students";
  const user = await findOneByField(env, collection, "username", username);
  if (!user?.password) return json({ error: "Invalid credentials" }, 401);

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return json({ error: "Invalid credentials" }, 401);

  const token = await signJwt({ sub: String(user.id ?? user._id ?? username), username, role }, env.TOKEN_SECRET);
  return json({ token });
}

async function handleVerify(request, env) {
  const body = await readJson(request);
  const token = body.token;
  if (!token) return json({ valid:false, error:"Token missing" }, 400);
  try {
    const payload = await verifyJwt(token, env.TOKEN_SECRET);
    return json({ valid:true, role: payload.role, username: payload.username });
  } catch {
    return json({ valid:false }, 401);
  }
}

async function handleTeacherDashboard(request, env, session) {
  const classes = await listCollection(env, "classes");
  const myClasses = classes.filter(c => c.teacherUsername === session.username);
  const classIds = new Set(myClasses.map(c => String(c.id ?? c.classId ?? "")));
  const students = (await listCollection(env, "students")).filter(s => classIds.has(String(s.classId ?? "")));
  return withCORS(json({ classes: myClasses, students }), request, env);
}

async function handleCreateClass(request, env, session) {
  const body = await readJson(request);
  const className = String(body.className || "").trim();
  const description = String(body.description || "").trim();
  if (!className) return json({ error:"className is required." }, 400);

  const created = await createDocument(env, "classes", {
    className,
    description: description || undefined,
    teacherUsername: session.username,
    createdAt: new Date().toISOString(),
  });
  return withCORS(json(created, 201), request, env);
}

async function handleCreateStudent(request, env, session) {
  const body = await readJson(request);
  const classId = String(body.classId || "").trim();
  const studentName = String(body.studentName || "").trim();
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!classId || !studentName || !password) {
    return json({ error: "classId, studentName, and password are required." }, 400);
  }

  const classDoc = await getDocument(env, "classes", classId);
  if (!classDoc || classDoc.teacherUsername !== session.username) {
    return json({ error: "Not authorised for this class." }, 403);
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const created = await createDocument(env, "students", {
    name: studentName,
    username: username || undefined,
    password: passwordHash,
    classId,
    teacherUsername: session.username,
    createdAt: new Date().toISOString(),
  });
  return withCORS(json(created, 201), request, env);
}

async function handleSeed(request, env) {
  if (!env.SEED_KEY) return json({ error:"Seed key not configured" }, 403);
  const key = request.headers.get("x-seed-key");
  if (!key || key !== env.SEED_KEY) return json({ error:"Forbidden" }, 403);

  const body = await readJson(request);
  if (!body?.teacher?.username || !body?.teacher?.password) {
    return json({ error:"teacher.username and teacher.password required" }, 400);
  }
  const exists = await findOneByField(env, "teachers", "username", body.teacher.username);
  if (exists?.id || exists?._id) return json({ ok:true, seeded:false, reason:"teacher exists" });

  const hash = await bcrypt.hash(String(body.teacher.password), BCRYPT_ROUNDS);
  const created = await createDocument(env, "teachers", {
    username: String(body.teacher.username),
    password: hash,
    displayName: String(body.teacher.displayName || body.teacher.username),
    createdAt: new Date().toISOString(),
  });
  return json({ ok:true, seeded:true, teacher: flatten(created) }, 201);
}

/* ------------------------------ middleware ----------------------------- */

async function requireTeacher(request, env, handler) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) return withCORS(json({ error:"Missing authorization" }, 401), request, env);
  try {
    const session = await verifyJwt(auth.slice(7), env.TOKEN_SECRET);
    if (session.role !== "teacher") return withCORS(json({ error:"Teacher role required" }, 403), request, env);
    return handler(request, env, session);
  } catch {
    return withCORS(json({ error:"Invalid or expired token" }, 401), request, env);
  }
}

/* ----------------------------- InstantDB ops --------------------------- */

async function listCollection(env, collection) {
  const resp = await instant(env, `/collection/${collection}`, { method: "GET" });
  return normalise(resp);
}
async function getDocument(env, collection, id) {
  try {
    const resp = await instant(env, `/collection/${collection}/${id}`, { method: "GET" });
    return flatten(resp);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}
async function createDocument(env, collection, data) {
  const resp = await instant(env, `/collection/${collection}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return flatten(resp.document ?? resp);
}
async function findOneByField(env, collection, field, value) {
  const docs = await listCollection(env, collection);
  return docs.find((d) => d?.[field] === value) || null;
}
async function instant(env, path, init) {
  const url = `${INSTANT_BASE}/${env.INSTANT_APP_ID}${path}`;
  const headers = {
    authorization: `Bearer ${env.INSTANT_ADMIN_TOKEN}`,
    ...(init.body ? { "content-type": "application/json" } : {}),
    ...(init.headers || {}),
  };
  const resp = await fetch(url, { ...init, headers });
  if (!resp.ok) {
    const message = await safeText(resp);
    const error = new Error(message || `InstantDB request failed (${resp.status})`);
    error.status = resp.status;
    throw error;
  }
  if (resp.status === 204) return null;
  return resp.json();
}
async function safeText(response) { try { return await response.text(); } catch { return ""; } }
function flatten(doc) {
  if (!doc || typeof doc !== "object") return {};
  const base = { ...doc };
  if (doc.fields && typeof doc.fields === "object") Object.assign(base, doc.fields);
  if (doc.data && typeof doc.data === "object") Object.assign(base, doc.data);
  if (!base.id && base._id) base.id = base._id;
  delete base.fields; delete base.data;
  return base;
}
function normalise(payload) {
  if (Array.isArray(payload)) return payload.map(flatten);
  if (payload && typeof payload === "object") {
    for (const key of ["items","documents","results","data"]) {
      if (Array.isArray(payload[key])) return payload[key].map(flatten);
    }
  }
  return [];
}

/* -------------------------------- JWT --------------------------------- */

async function signJwt(payload, secret) {
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + 60*60*8 };
  const head = base64UrlEncode(JSON.stringify({ alg:"HS256", typ:"JWT" }));
  const body = base64UrlEncode(JSON.stringify(full));
  const sig = await hmacSign(`${head}.${body}`, secret);
  return `${head}.${body}.${sig}`;
}
async function verifyJwt(token, secret) {
  const [h, p, s] = token.split(".");
  if (!h || !p || !s) throw new Error("invalid token");
  const expected = await hmacSign(`${h}.${p}`, secret);
  if (expected !== s) throw new Error("signature mismatch");
  const data = JSON.parse(new TextDecoder().decode(base64UrlDecode(p)));
  if (data.exp && data.exp < Math.floor(Date.now()/1000)) throw new Error("expired");
  return data;
}
async function hmacSign(input, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name:"HMAC", hash:"SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(input));
  return base64UrlEncode(sig);
}
function base64UrlEncode(data) {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let bin = ""; bytes.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
function base64UrlDecode(input) {
  let b64 = input.replace(/-/g,"+").replace(/_/g,"/"); while (b64.length % 4) b64 += "=";
  const raw = atob(b64); const out = new Uint8Array(raw.length);
  for (let i=0;i<raw.length;i++) out[i] = raw.charCodeAt(i);
  return out;
}

/* -------------------------- JSON + CORS helpers ------------------------ */

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "content-type":"application/json" } });
}
async function withCORS(resP, request, env) {
  const allowed = (env.CORS_ALLOWED_ORIGINS || "https://stss15.github.io").split(",").map(s => s.trim());
  const origin = request.headers.get("origin");
  const res = await resP;
  const headers = new Headers(res.headers);
  if (origin && (allowed.includes("*") || allowed.includes(origin))) {
    headers.set("Access-Control-Allow-Origin", origin);
  }
  headers.set("Vary", "Origin");
  headers.set("Access-Control-Allow-Headers", "content-type,authorization");
  headers.set("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  headers.set("Access-Control-Allow-Credentials", "true");
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}
async function readJson(request) { try { return await request.json(); } catch { return {}; } }
