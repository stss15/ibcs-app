const INSTANT_API_ROOT = "https://api.instantdb.com/v1/app";
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
          preferredField: "email",
        });
      }

      if (route === "/s/login") {
        return await handleLogin(request, env, {
          collectionName: "students",
          role: "student",
          preferredField: "email",
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
      if (error instanceof Response) {
        return error;
      }
      console.error("Worker error", error);
      return jsonResponse({ error: "Internal Server Error" }, 500);
    }
  },
};

async function handleLogin(request, env, options) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST",
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  const identifierField =
    options.preferredField && body[options.preferredField]
      ? options.preferredField
      : body.email
      ? "email"
      : body.username
      ? "username"
      : null;

  const identifierValue = identifierField ? body[identifierField] : null;
  const password = body.password;

  if (!identifierField || !identifierValue || !password) {
    return jsonResponse(
      {
        error:
          "Missing login parameters. Provide email/username and password fields.",
      },
      400,
    );
  }

  const db = new InstantDBClient(env);

  const user = await db.findByField(
    options.collectionName,
    identifierField,
    identifierValue,
  );

  if (!user) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }

  const expected = user.passwordHash || user.password || null;

  if (!expected) {
    return jsonResponse({ error: "Credentials not configured" }, 500);
  }

  const providedHash = await hashPassword(password);

  const matches =
    timingSafeEqual(providedHash, expected) ||
    timingSafeEqual(password, expected);

  if (!matches) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }

  const token = await issueSessionToken(env.TOKEN_SECRET, {
    sub: String(user.id ?? user._id ?? identifierValue),
    role: options.role,
    collection: options.collectionName,
  });

  const responsePayload = {
    token,
    user: sanitizeUser(user),
  };

  await db.recordSession({
    token,
    userId: responsePayload.user.id ?? responsePayload.user._id ?? null,
    role: options.role,
    issuedAt: new Date().toISOString(),
    source: "login",
  });

  return jsonResponse(responsePayload, 200);
}

async function handleVerify(request, env) {
  const token = extractToken(request);

  if (!token) {
    return jsonResponse({ valid: false, error: "Missing token" }, 400);
  }

  const payload = await verifySessionToken(token, env.TOKEN_SECRET);

  if (!payload) {
    return jsonResponse({ valid: false }, 401);
  }

  return jsonResponse({ valid: true, payload }, 200);
}

async function handleTeacherDashboard(request, env) {
  const teacher = await requireTeacher(request, env);
  const db = new InstantDBClient(env);

  const [classes, enrollments, students, topics, unlocks] = await Promise.all([
    listCollectionSafe(db, "classes"),
    listCollectionSafe(db, "enrollments"),
    listCollectionSafe(db, "students"),
    listCollectionSafe(db, "topics"),
    listCollectionSafe(db, "topic_unlocks"),
  ]);

  const teacherClasses = classes
    .map(sanitizeDocument)
    .filter((doc) => matchesOwner(doc, teacher.sub));

  const teacherClassIds = new Set(
    teacherClasses
      .map((clazz) => clazz.classId || clazz.id || clazz._id)
      .filter(Boolean),
  );

  const roster = enrollments
    .map(sanitizeDocument)
    .filter(
      (enrollment) =>
        matchesOwner(enrollment, teacher.sub) ||
        (enrollment.classId && teacherClassIds.has(enrollment.classId)),
    );

  const studentLookup = new Map(
    students.map((student) => {
      const sanitized = sanitizeDocument(student);
      const id = sanitized.id || sanitized._id || sanitized.studentId;
      if (!id) {
        return [Math.random().toString(36).slice(2), sanitized];
      }
      return [String(id), sanitized];
    }),
  );

  const rosterWithStudents = roster.map((record) => ({
    ...record,
    student: record.studentId
      ? studentLookup.get(String(record.studentId)) || null
      : null,
  }));

  const topicUnlocks = unlocks
    .map(sanitizeDocument)
    .filter(
      (entry) =>
        matchesOwner(entry, teacher.sub) ||
        (entry.classId && teacherClassIds.has(entry.classId)),
    );

  const topicLookup = new Map(
    topics.map((topic) => {
      const sanitized = sanitizeDocument(topic);
      const id = sanitized.id || sanitized._id || sanitized.topicId;
      if (!id) {
        return [Math.random().toString(36).slice(2), sanitized];
      }
      return [String(id), sanitized];
    }),
  );

  const unlocksWithTopics = topicUnlocks.map((entry) => ({
    ...entry,
    topic: entry.topicId
      ? topicLookup.get(String(entry.topicId)) || null
      : null,
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
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST",
    });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (!name) {
    return jsonResponse({ error: "Class name is required" }, 400);
  }

  const now = new Date().toISOString();
  const db = new InstantDBClient(env);
  const payload = {
    name,
    description: typeof body.description === "string" ? body.description : "",
    teacherId: teacher.sub,
    createdAt: now,
    updatedAt: now,
    ...sanitizeMetadata(body.metadata),
  };

  const created = await db.createDocument("classes", payload);
  return jsonResponse(
    {
      ok: true,
      class: sanitizeDocument(created) || { ...payload },
    },
    201,
  );
}

async function handleAddStudent(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST",
    });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const classId = normalizeId(body?.classId);

  if (!classId) {
    return jsonResponse({ error: "classId is required" }, 400);
  }

  const db = new InstantDBClient(env);
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

    const createdStudent = await db.createDocument("students", studentPayload);
    studentRecord = sanitizeDocument(createdStudent) || sanitizeDocument(studentPayload);
    studentId =
      normalizeId(studentRecord.id) ||
      normalizeId(studentRecord._id) ||
      studentId;
  }

  if (!studentId) {
    return jsonResponse(
      { error: "Provide either studentId or student object" },
      400,
    );
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

  const enrollment = await db.createDocument("enrollments", enrollmentPayload);

  return jsonResponse(
    {
      ok: true,
      enrollment: sanitizeDocument(enrollment) || enrollmentPayload,
      student: studentRecord,
    },
    201,
  );
}

async function handleUnlockTopic(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST",
    });
  }

  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);

  const classId = normalizeId(body?.classId);
  const topicId = normalizeId(body?.topicId);

  if (!classId || !topicId) {
    return jsonResponse(
      { error: "classId and topicId are required" },
      400,
    );
  }

  const now = new Date().toISOString();
  const db = new InstantDBClient(env);
  const payload = {
    classId,
    topicId,
    teacherId: teacher.sub,
    unlockedAt: now,
    ...sanitizeMetadata(body.metadata),
  };

  const unlockRecord = await db.createDocument("topic_unlocks", payload);

  return jsonResponse(
    {
      ok: true,
      unlock: sanitizeDocument(unlockRecord) || payload,
    },
    201,
  );
}

async function handleSeed(request, env) {
  if (!env?.SEED_KEY) {
    return jsonResponse({ error: "Seed key not configured" }, 403);
  }

  const seedKey = request.headers.get("x-seed-key");
  if (!seedKey || seedKey !== env.SEED_KEY) {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }

  if (!body?.teacher || !body.teacher.username || !body.teacher.password) {
    return jsonResponse({ error: "Teacher username and password required" }, 400);
  }

  const db = new InstantDBClient(env);
  const now = new Date().toISOString();

  const teacherPayload = {
    username: body.teacher.username,
    passwordHash: await hashPassword(body.teacher.password),
    displayName: body.teacher.displayName || body.teacher.username,
    createdAt: now,
    updatedAt: now,
  };

  const teacherRecord = await db.createDocument("teachers", teacherPayload);
  const teacherId =
    normalizeId(teacherRecord?.id) ||
    normalizeId(teacherRecord?._id) ||
    normalizeId(teacherRecord?.teacherId);

  const classes = Array.isArray(body.classes) ? body.classes : [];
  let classCount = 0;
  let studentCount = 0;

  for (const classInput of classes) {
    if (!classInput?.name) {
      continue;
    }
    const classPayload = {
      name: classInput.name,
      teacherId,
      createdAt: now,
      updatedAt: now,
    };
    const classRecord = await db.createDocument("classes", classPayload);
    const classId =
      normalizeId(classRecord?.id) ||
      normalizeId(classRecord?._id) ||
      normalizeId(classRecord?.classId);
    classCount += 1;

    const students = Array.isArray(classInput.students) ? classInput.students : [];
    for (const studentInput of students) {
      if (!studentInput?.name || !studentInput?.password) {
        continue;
      }
      const studentPayload = {
        name: studentInput.name,
        passwordHash: await hashPassword(studentInput.password),
        classId,
        teacherId,
        createdAt: now,
        updatedAt: now,
      };
      await db.createDocument("students", studentPayload);
      studentCount += 1;
    }
  }

  return jsonResponse({
    ok: true,
    counts: {
      teachers: 1,
      classes: classCount,
      students: studentCount,
    },
  });
}

class InstantDBClient {
  constructor(env) {
    if (!env?.INSTANT_APP_ID) {
      throw new Error("Missing INSTANT_APP_ID binding");
    }
    if (!env?.TOKEN_SECRET) {
      throw new Error("Missing TOKEN_SECRET binding");
    }

    this.appId = env.INSTANT_APP_ID;
    this.secret = env.TOKEN_SECRET;
    this.baseUrl = `${INSTANT_API_ROOT}/${this.appId}`;
  }

  async findByField(collectionName, field, value) {
    const documents = await this.listCollection(collectionName);
    return documents.find(
      (doc) =>
        doc?.[field] === value ||
        doc?.fields?.[field] === value ||
        doc?.data?.[field] === value,
    );
  }

  async listCollection(collectionName) {
    const url = `${this.baseUrl}/collection/${collectionName}`;
    const headers = await this.buildHeaders();
    const response = await fetch(url, { method: "GET", headers });

    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(
        `InstantDB listCollection failed (${response.status}): ${message}`,
      );
    }

    const body = await response.json().catch(() => null);

    if (!body) {
      throw new Error("InstantDB returned invalid JSON");
    }

    return extractDocuments(body);
  }

  async createDocument(collectionName, payload) {
    const url = `${this.baseUrl}/collection/${collectionName}`;
    const headers = await this.buildHeaders();
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(
        `InstantDB createDocument failed (${response.status}): ${message}`,
      );
    }

    return response.json().catch(() => ({}));
  }

  async recordSession(payload) {
    try {
      await this.createDocument("sessions", payload);
    } catch (error) {
      console.warn("Failed to persist session record", error);
    }
  }

  async buildHeaders() {
    const serviceToken = await this.buildServiceToken();
    return {
      "content-type": "application/json",
      authorization: `Bearer ${serviceToken}`,
    };
  }

  async buildServiceToken() {
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await signHmac(`${this.appId}:${timestamp}`, this.secret);
    return `${timestamp}.${signature}`;
  }
}

function extractDocuments(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload?.items && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (payload?.documents && Array.isArray(payload.documents)) {
    return payload.documents;
  }

  if (payload?.results && Array.isArray(payload.results)) {
    return payload.results;
  }

  if (payload?.data && Array.isArray(payload.data)) {
    return payload.data;
  }

  return [];
}

function sanitizeUser(user) {
  if (!user || typeof user !== "object") {
    return {};
  }

  const { password, passwordHash, ...rest } = flattenDocument(user);
  return rest;
}

function flattenDocument(document) {
  if (document?.fields && typeof document.fields === "object") {
    return { ...document, ...document.fields };
  }

  if (document?.data && typeof document.data === "object") {
    return { ...document, ...document.data };
  }

  return { ...document };
}

async function hashPassword(input) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(hashBuffer);
}

function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }
  return result;
}

async function issueSessionToken(secret, payload) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iat: now,
    exp: now + 60 * 60,
    ...payload,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = await signHmac(`${encodedHeader}.${encodedPayload}`, secret);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function verifySessionToken(token, secret) {
  const segments = token?.split(".");
  if (!segments || segments.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = segments;
  const expectedSignature = await signHmac(
    `${encodedHeader}.${encodedPayload}`,
    secret,
  );

  if (!timingSafeEqual(signature, expectedSignature)) {
    return null;
  }

  let payload;
  try {
    const buffer = base64UrlDecode(encodedPayload);
    payload = JSON.parse(new TextDecoder().decode(buffer));
  } catch {
    return null;
  }

  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}

function base64UrlEncode(input) {
  const bytes =
    typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(input) {
  let base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) {
    base64 = base64.padEnd(base64.length + (4 - pad), "=");
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
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

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message),
  );

  return base64UrlEncode(signature);
}

function extractToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const url = new URL(request.url);
  return url.searchParams.get("token");
}

function timingSafeEqual(a, b) {
  const bufA = encoder.encode(String(a));
  const bufB = encoder.encode(String(b));

  if (bufA.length !== bufB.length) {
    return false;
  }

  let diff = 0;
  for (let i = 0; i < bufA.length; i += 1) {
    diff |= bufA[i] ^ bufB[i];
  }
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

async function listCollectionSafe(db, collectionName) {
  try {
    return await db.listCollection(collectionName);
  } catch (error) {
    console.warn(`Failed to list collection ${collectionName}:`, error);
    return [];
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

function matchesOwner(document, ownerId) {
  if (!document) {
    return false;
  }
  const candidate = [
    document.teacherId,
    document.ownerId,
    document.userId,
    document.createdBy,
    document.teacher_id,
  ]
    .map(normalizeId)
    .find((value) => value);

  return candidate ? String(candidate) === String(ownerId) : false;
}

function normalizeId(value) {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return String(value);
}

function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...headers,
    },
  });
}

async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "Failed to read response";
  }
}
