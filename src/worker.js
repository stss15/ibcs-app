import { init as instantInit, id as instantId } from "@instantdb/admin";

const encoder = new TextEncoder();

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = url.pathname;

    try {
      if (route === "/t/login") {
        return await handleLogin(request, env, {
          collectionName: "teachers",
          role: "teacher",
          preferredField: "username",
        });
      }

      if (route === "/s/login") {
        return await handleLogin(request, env, {
          collectionName: "students",
          role: "student",
          preferredField: "username",
        });
      }

      if (route === "/verify") {
        return await handleVerify(request, env);
      }

      if (route === "/t/dashboard" && request.method === "GET") {
        return await handleTeacherDashboard(request, env);
      }

      if (route === "/t/add-class") {
        return await handleAddClass(request, env);
      }

      if (route === "/t/add-student") {
        return await handleAddStudent(request, env);
      }

      if (route === "/t/unlock-topic") {
        return await handleUnlockTopic(request, env);
      }

      if (route === "/setup/seed" && request.method === "POST") {
        return await handleSeed(request, env);
      }

      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof Response) return error;
      console.error("Worker error", error);
      return jsonResponse({ error: "Internal Server Error" }, 500);
    }
  },
};

/* ---------- Instant Admin SDK wrapper ---------- */

function getAdminDB(env) {
  if (!env?.INSTANT_APP_ID) throw new Error("Missing INSTANT_APP_ID binding");
  if (!env?.INSTANT_ADMIN_TOKEN) throw new Error("Missing INSTANT_ADMIN_TOKEN binding");
  return instantInit({
    appId: env.INSTANT_APP_ID,
    adminToken: env.INSTANT_ADMIN_TOKEN,
  });
}

async function queryOne(db, collection, where) {
  const q = { [collection]: { $: { where, limit: 1 } } };
  const res = await db.query(q);
  const arr = res?.[collection] || [];
  return arr[0] || null;
}

async function queryAll(db, collection) {
  const res = await db.query({ [collection]: {} });
  return res?.[collection] || [];
}

async function createDoc(db, collection, payload) {
  const newId = instantId();
  await db.transact([db.tx[collection][newId].update(payload)]);
  return { id: newId, ...payload };
}

/* ---------- Routes ---------- */

async function handleLogin(request, env, options) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
  }

  const body = await readJsonBody(request);
  const identifierField = options.preferredField || "username";
  const identifierValue = body?.[identifierField];
  const password = body?.password;

  if (!identifierValue || !password) {
    return jsonResponse(
      { error: `Missing login parameters. Provide ${identifierField} and password.` },
      400,
    );
  }

  const db = getAdminDB(env);
  const user = await queryOne(db, options.collectionName, { [identifierField]: identifierValue });

  if (!user) return jsonResponse({ error: "Invalid credentials" }, 401);

  const expected = user.passwordHash || user.password || null;
  if (!expected) return jsonResponse({ error: "Credentials not configured" }, 500);

  const providedHash = await hashPassword(password);
  const matches = timingSafeEqual(providedHash, expected) || timingSafeEqual(password, expected);
  if (!matches) return jsonResponse({ error: "Invalid credentials" }, 401);

  const token = await issueSessionToken(env.TOKEN_SECRET, {
    sub: String(user.id ?? user._id ?? identifierValue),
    role: options.role,
    collection: options.collectionName,
  });

  const responsePayload = { token, user: sanitizeUser(user) };

  try {
    await createDoc(db, "sessions", {
      token,
      userId: responsePayload.user.id ?? responsePayload.user._id ?? null,
      role: options.role,
      issuedAt: new Date().toISOString(),
      source: "login",
    });
  } catch (e) {
    console.warn("Failed to persist session record", e);
  }

  return jsonResponse(responsePayload, 200);
}

async function handleVerify(request, env) {
  const token = extractToken(request);
  if (!token) return jsonResponse({ valid: false, error: "Missing token" }, 400);

  const payload = await verifySessionToken(token, env.TOKEN_SECRET);
  if (!payload) return jsonResponse({ valid: false }, 401);

  return jsonResponse({ valid: true, payload }, 200);
}

async function handleTeacherDashboard(request, env) {
  const teacher = await requireTeacher(request, env);
  const db = getAdminDB(env);

  const [classes, enrollments, students, topics, unlocks] = await Promise.all([
    queryAll(db, "classes"),
    queryAll(db, "enrollments"),
    queryAll(db, "students"),
    queryAll(db, "topics"),
    queryAll(db, "topic_unlocks"),
  ]);

  const teacherClasses = classes.map(sanitizeDocument).filter((d) => matchesOwner(d, teacher.sub));
  const teacherClassIds = new Set(
    teacherClasses.map((c) => c.classId || c.id || c._id).filter(Boolean),
  );

  const roster = enrollments
    .map(sanitizeDocument)
    .filter(
      (e) =>
        matchesOwner(e, teacher.sub) || (e.classId && teacherClassIds.has(e.classId)),
    );

  const studentLookup = new Map(
    students.map((s) => {
      const z = sanitizeDocument(s);
      const sid = z.id || z._id || z.studentId || instantId();
      return [String(sid), z];
    }),
  );

  const rosterWithStudents = roster.map((rec) => ({
    ...rec,
    student: rec.studentId ? studentLookup.get(String(rec.studentId)) || null : null,
  }));

  const topicUnlocks = unlocks
    .map(sanitizeDocument)
    .filter(
      (u) =>
        matchesOwner(u, teacher.sub) || (u.classId && teacherClassIds.has(u.classId)),
    );

  const topicLookup = new Map(
    topics.map((t) => {
      const z = sanitizeDocument(t);
      const tid = z.id || z._id || z.topicId || instantId();
      return [String(tid), z];
    }),
  );

  const unlocksWithTopics = topicUnlocks.map((u) => ({
    ...u,
    topic: u.topicId ? topicLookup.get(String(u.topicId)) || null : null,
  }));

  return jsonResponse({
    teacherId: teacher.sub,
    classes: teacherClasses,
    roster: rosterWithStudents,
    unlocks: unlocksWithTopics,
  });
}

async function handleAddClass(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) return jsonResponse({ error: "Class name is required" }, 400);

  const now = new Date().toISOString();
  const db = getAdminDB(env);
  const payload = {
    name,
    description: typeof body.description === "string" ? body.description : "",
    teacherId: teacher.sub,
    createdAt: now,
    updatedAt: now,
    ...sanitizeMetadata(body.metadata),
  };

  const created = await createDoc(db, "classes", payload);
  return jsonResponse({ ok: true, class: sanitizeDocument(created) }, 201);
}

async function handleAddStudent(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const classId = normalizeId(body?.classId);
  if (!classId) return jsonResponse({ error: "classId is required" }, 400);

  const db = getAdminDB(env);
  const now = new Date().toISOString();

  let studentId = normalizeId(body?.studentId);
  let studentRecord = null;

  if (body?.student && typeof body.student === "object") {
    const studentPayload = {
      ...body.student,
      createdAt: now,
      updatedAt: now,
      classId,
      teacherId: teacher.sub,
    };
    if (studentPayload.password) {
      studentPayload.passwordHash = await hashPassword(studentPayload.password);
      delete studentPayload.password;
    }
    const createdStudent = await createDoc(db, "students", studentPayload);
    studentRecord = sanitizeDocument(createdStudent);
    studentId = normalizeId(studentRecord.id) || normalizeId(studentRecord._id) || studentId;
  }

  if (!studentId) {
    return jsonResponse({ error: "Provide either studentId or student object" }, 400);
  }

  const enrollmentPayload = {
    classId,
    studentId,
    teacherId: teacher.sub,
    createdAt: now,
    updatedAt: now,
    status: body?.status || "active",
    ...sanitizeMetadata(body.metadata),
  };

  const enrollment = await createDoc(db, "enrollments", enrollmentPayload);

  return jsonResponse(
    { ok: true, enrollment: sanitizeDocument(enrollment), student: studentRecord },
    201,
  );
}

async function handleUnlockTopic(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, { Allow: "POST" });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);

  const classId = normalizeId(body?.classId);
  const topicId = normalizeId(body?.topicId);
  if (!classId || !topicId) {
    return jsonResponse({ error: "classId and topicId are required" }, 400);
  }

  const now = new Date().toISOString();
  const db = getAdminDB(env);
  const payload = {
    classId,
    topicId,
    teacherId: teacher.sub,
    unlockedAt: now,
    ...sanitizeMetadata(body.metadata),
  };

  const unlockRecord = await createDoc(db, "topic_unlocks", payload);
  return jsonResponse({ ok: true, unlock: sanitizeDocument(unlockRecord) }, 201);
}

async function handleSeed(request, env) {
  if (!env?.SEED_KEY) return jsonResponse({ error: "Seed key not configured" }, 403);
  const seedKey = request.headers.get("x-seed-key");
  if (!seedKey || seedKey !== env.SEED_KEY) return jsonResponse({ error: "Forbidden" }, 403);

  const body = await readJsonBody(request);
  if (!body?.teacher || !body.teacher.username || !body.teacher.password) {
    return jsonResponse({ error: "Teacher username and password required" }, 400);
  }

  const db = getAdminDB(env);
  const now = new Date().toISOString();

  const teacherPayload = {
    username: body.teacher.username,
    passwordHash: await hashPassword(body.teacher.password),
    displayName: body.teacher.displayName || body.teacher.username,
    createdAt: now,
    updatedAt: now,
  };
  const teacherDoc = await createDoc(db, "teachers", teacherPayload);
  const teacherId = normalizeId(teacherDoc.id) || normalizeId(teacherDoc._id);

  const classes = Array.isArray(body.classes) ? body.classes : [];
  let classCount = 0;
  let studentCount = 0;

  for (const c of classes) {
    if (!c?.name) continue;
    const classDoc = await createDoc(db, "classes", {
      name: c.name,
      teacherId,
      createdAt: now,
      updatedAt: now,
    });
    classCount += 1;
    const classId = normalizeId(classDoc.id) || normalizeId(classDoc._id);

    const students = Array.isArray(c.students) ? c.students : [];
    for (const s of students) {
      if (!s?.name || !s?.password) continue;
      await createDoc(db, "students", {
        name: s.name,
        passwordHash: await hashPassword(s.password),
        classId,
        teacherId,
        createdAt: now,
        updatedAt: now,
      });
      studentCount += 1;
    }
  }

  return jsonResponse({
    ok: true,
    counts: { teachers: 1, classes: classCount, students: studentCount },
  });
}

/* ---------- helpers ---------- */

async function hashPassword(input) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(hashBuffer);
}

function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (const byte of bytes) result += byte.toString(16).padStart(2, "0");
  return result;
}

async function issueSessionToken(secret, payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = { iat: now, exp: now + 60 * 60, ...payload };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = await signHmac(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifySessionToken(token, secret) {
  const parts = token?.split(".");
  if (!parts || parts.length !== 3) return null;
  const [h, p, sig] = parts;
  const expected = await signHmac(`${h}.${p}`, secret);
  if (!timingSafeEqual(sig, expected)) return null;

  try {
    const buf = base64UrlDecode(p);
    const payload = JSON.parse(new TextDecoder().decode(buf));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function base64UrlEncode(input) {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 = base64.padEnd(base64.length + (4 - pad), "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function signHmac(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return base64UrlEncode(signature);
}

function extractToken(request) {
  const auth = request.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  const url = new URL(request.url);
  return url.searchParams.get("token");
}

function timingSafeEqual(a, b) {
  const A = encoder.encode(String(a));
  const B = encoder.encode(String(b));
  if (A.length !== B.length) return false;
  let diff = 0;
  for (let i = 0; i < A.length; i += 1) diff |= A[i] ^ B[i];
  return diff === 0;
}

async function requireTeacher(request, env) {
  const token = extractToken(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const payload = await verifySessionToken(token, env.TOKEN_SECRET);
  if (!payload || payload.role !== "teacher") {
    throw new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return payload;
}

async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function sanitizeDocument(document) {
  const flattened = flattenDocument(document);
  delete flattened.password;
  delete flattened.passwordHash;
  delete flattened.secret;
  delete flattened.token;
  return flattened;
}

function flattenDocument(document) {
  if (document?.fields && typeof document.fields === "object") return { ...document, ...document.fields };
  if (document?.data && typeof document.data === "object") return { ...document, ...document.data };
  return { ...document };
}

function matchesOwner(document, ownerId) {
  if (!document) return false;
  const candidate = [document.teacherId, document.ownerId, document.userId, document.createdBy, document.teacher_id]
    .map(normalizeId)
    .find((v) => v);
  return candidate ? String(candidate) === String(ownerId) : false;
}

function normalizeId(value) {
  if (value === null || value === undefined || (typeof value === "string" && value.trim() === "")) return null;
  if (typeof value === "string") return value.trim();
  return String(value);
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") return {};
  const cleaned = {};
  for (const [k, v] of Object.entries(metadata)) if (v !== undefined) cleaned[k] = v;
  return cleaned;
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}
