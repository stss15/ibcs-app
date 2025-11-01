var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-uHqFk4/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker.js
var INSTANT_API_ROOT = "https://api.instantdb.com/v1/app";
var encoder = new TextEncoder();
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const route = url.pathname;
    try {
      if (route === "/t/login") {
        return await handleLogin(request, env, {
          collectionName: "teachers",
          role: "teacher",
          preferredField: "email"
        });
      }
      if (route === "/s/login") {
        return await handleLogin(request, env, {
          collectionName: "students",
          role: "student",
          preferredField: "email"
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
      return jsonResponse({ error: "Not found" }, 404);
    } catch (error) {
      if (error instanceof Response) {
        return error;
      }
      console.error("Worker error", error);
      return jsonResponse({ error: "Internal Server Error" }, 500);
    }
  }
};
async function handleLogin(request, env, options) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST"
    });
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400);
  }
  const identifierField = options.preferredField && body[options.preferredField] ? options.preferredField : body.email ? "email" : body.username ? "username" : null;
  const identifierValue = identifierField ? body[identifierField] : null;
  const password = body.password;
  if (!identifierField || !identifierValue || !password) {
    return jsonResponse(
      {
        error: "Missing login parameters. Provide email/username and password fields."
      },
      400
    );
  }
  const db = new InstantDBClient(env);
  const user = await db.findByField(
    options.collectionName,
    identifierField,
    identifierValue
  );
  if (!user) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }
  const expected = user.passwordHash || user.password || null;
  if (!expected) {
    return jsonResponse({ error: "Credentials not configured" }, 500);
  }
  const providedHash = await hashPassword(password);
  const matches = timingSafeEqual(providedHash, expected) || timingSafeEqual(password, expected);
  if (!matches) {
    return jsonResponse({ error: "Invalid credentials" }, 401);
  }
  const token = await issueSessionToken(env.TOKEN_SECRET, {
    sub: String(user.id ?? user._id ?? identifierValue),
    role: options.role,
    collection: options.collectionName
  });
  const responsePayload = {
    token,
    user: sanitizeUser(user)
  };
  await db.recordSession({
    token,
    userId: responsePayload.user.id ?? responsePayload.user._id ?? null,
    role: options.role,
    issuedAt: (/* @__PURE__ */ new Date()).toISOString(),
    source: "login"
  });
  return jsonResponse(responsePayload, 200);
}
__name(handleLogin, "handleLogin");
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
__name(handleVerify, "handleVerify");
async function handleTeacherDashboard(request, env) {
  const teacher = await requireTeacher(request, env);
  const db = new InstantDBClient(env);
  const [classes, enrollments, students, topics, unlocks] = await Promise.all([
    listCollectionSafe(db, "classes"),
    listCollectionSafe(db, "enrollments"),
    listCollectionSafe(db, "students"),
    listCollectionSafe(db, "topics"),
    listCollectionSafe(db, "topic_unlocks")
  ]);
  const teacherClasses = classes.map(sanitizeDocument).filter((doc) => matchesOwner(doc, teacher.sub));
  const teacherClassIds = new Set(
    teacherClasses.map((clazz) => clazz.classId || clazz.id || clazz._id).filter(Boolean)
  );
  const roster = enrollments.map(sanitizeDocument).filter(
    (enrollment) => matchesOwner(enrollment, teacher.sub) || enrollment.classId && teacherClassIds.has(enrollment.classId)
  );
  const studentLookup = new Map(
    students.map((student) => {
      const sanitized = sanitizeDocument(student);
      const id = sanitized.id || sanitized._id || sanitized.studentId;
      if (!id) {
        return [Math.random().toString(36).slice(2), sanitized];
      }
      return [String(id), sanitized];
    })
  );
  const rosterWithStudents = roster.map((record) => ({
    ...record,
    student: record.studentId ? studentLookup.get(String(record.studentId)) || null : null
  }));
  const topicUnlocks = unlocks.map(sanitizeDocument).filter(
    (entry) => matchesOwner(entry, teacher.sub) || entry.classId && teacherClassIds.has(entry.classId)
  );
  const topicLookup = new Map(
    topics.map((topic) => {
      const sanitized = sanitizeDocument(topic);
      const id = sanitized.id || sanitized._id || sanitized.topicId;
      if (!id) {
        return [Math.random().toString(36).slice(2), sanitized];
      }
      return [String(id), sanitized];
    })
  );
  const unlocksWithTopics = topicUnlocks.map((entry) => ({
    ...entry,
    topic: entry.topicId ? topicLookup.get(String(entry.topicId)) || null : null
  }));
  return jsonResponse({
    teacherId: teacher.sub,
    classes: teacherClasses,
    roster: rosterWithStudents,
    unlocks: unlocksWithTopics
  });
}
__name(handleTeacherDashboard, "handleTeacherDashboard");
async function handleAddClass(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST"
    });
  }
  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  if (!name) {
    return jsonResponse({ error: "Class name is required" }, 400);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const db = new InstantDBClient(env);
  const payload = {
    name,
    description: typeof body.description === "string" ? body.description : "",
    teacherId: teacher.sub,
    createdAt: now,
    updatedAt: now,
    ...sanitizeMetadata(body.metadata)
  };
  const created = await db.createDocument("classes", payload);
  return jsonResponse(
    {
      ok: true,
      class: sanitizeDocument(created) || { ...payload }
    },
    201
  );
}
__name(handleAddClass, "handleAddClass");
async function handleAddStudent(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST"
    });
  }
  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const classId = normalizeId(body?.classId);
  if (!classId) {
    return jsonResponse({ error: "classId is required" }, 400);
  }
  const db = new InstantDBClient(env);
  const now = (/* @__PURE__ */ new Date()).toISOString();
  let studentId = normalizeId(body?.studentId);
  let studentRecord = null;
  if (body?.student && typeof body.student === "object") {
    const studentPayload = {
      ...body.student,
      createdAt: now,
      updatedAt: now,
      classId,
      teacherId: teacher.sub
    };
    const createdStudent = await db.createDocument("students", studentPayload);
    studentRecord = sanitizeDocument(createdStudent) || sanitizeDocument(studentPayload);
    studentId = normalizeId(studentRecord.id) || normalizeId(studentRecord._id) || studentId;
  }
  if (!studentId) {
    return jsonResponse(
      { error: "Provide either studentId or student object" },
      400
    );
  }
  const enrollmentPayload = {
    classId,
    studentId,
    teacherId: teacher.sub,
    createdAt: now,
    updatedAt: now,
    status: body?.status || "active",
    ...sanitizeMetadata(body.metadata)
  };
  const enrollment = await db.createDocument("enrollments", enrollmentPayload);
  return jsonResponse(
    {
      ok: true,
      enrollment: sanitizeDocument(enrollment) || enrollmentPayload,
      student: studentRecord
    },
    201
  );
}
__name(handleAddStudent, "handleAddStudent");
async function handleUnlockTopic(request, env) {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method Not Allowed" }, 405, {
      Allow: "POST"
    });
  }
  const teacher = await requireTeacher(request, env);
  const body = await readJsonBody(request);
  const classId = normalizeId(body?.classId);
  const topicId = normalizeId(body?.topicId);
  if (!classId || !topicId) {
    return jsonResponse(
      { error: "classId and topicId are required" },
      400
    );
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  const db = new InstantDBClient(env);
  const payload = {
    classId,
    topicId,
    teacherId: teacher.sub,
    unlockedAt: now,
    ...sanitizeMetadata(body.metadata)
  };
  const unlockRecord = await db.createDocument("topic_unlocks", payload);
  return jsonResponse(
    {
      ok: true,
      unlock: sanitizeDocument(unlockRecord) || payload
    },
    201
  );
}
__name(handleUnlockTopic, "handleUnlockTopic");
var InstantDBClient = class {
  static {
    __name(this, "InstantDBClient");
  }
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
      (doc) => doc?.[field] === value || doc?.fields?.[field] === value || doc?.data?.[field] === value
    );
  }
  async listCollection(collectionName) {
    const url = `${this.baseUrl}/collection/${collectionName}`;
    const headers = await this.buildHeaders();
    const response = await fetch(url, { method: "GET", headers });
    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(
        `InstantDB listCollection failed (${response.status}): ${message}`
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
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const message = await safeReadText(response);
      throw new Error(
        `InstantDB createDocument failed (${response.status}): ${message}`
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
      authorization: `Bearer ${serviceToken}`
    };
  }
  async buildServiceToken() {
    const timestamp = Math.floor(Date.now() / 1e3);
    const signature = await signHmac(`${this.appId}:${timestamp}`, this.secret);
    return `${timestamp}.${signature}`;
  }
};
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
__name(extractDocuments, "extractDocuments");
function sanitizeUser(user) {
  if (!user || typeof user !== "object") {
    return {};
  }
  const { password, passwordHash, ...rest } = flattenDocument(user);
  return rest;
}
__name(sanitizeUser, "sanitizeUser");
function flattenDocument(document) {
  if (document?.fields && typeof document.fields === "object") {
    return { ...document, ...document.fields };
  }
  if (document?.data && typeof document.data === "object") {
    return { ...document, ...document.data };
  }
  return { ...document };
}
__name(flattenDocument, "flattenDocument");
async function hashPassword(input) {
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(input));
  return toHex(hashBuffer);
}
__name(hashPassword, "hashPassword");
function toHex(buffer) {
  const bytes = new Uint8Array(buffer);
  let result = "";
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, "0");
  }
  return result;
}
__name(toHex, "toHex");
async function issueSessionToken(secret, payload) {
  const now = Math.floor(Date.now() / 1e3);
  const header = { alg: "HS256", typ: "JWT" };
  const body = {
    iat: now,
    exp: now + 60 * 60,
    ...payload
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(body));
  const signature = await signHmac(`${encodedHeader}.${encodedPayload}`, secret);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}
__name(issueSessionToken, "issueSessionToken");
async function verifySessionToken(token, secret) {
  const segments = token?.split(".");
  if (!segments || segments.length !== 3) {
    return null;
  }
  const [encodedHeader, encodedPayload, signature] = segments;
  const expectedSignature = await signHmac(
    `${encodedHeader}.${encodedPayload}`,
    secret
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
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1e3)) {
    return null;
  }
  return payload;
}
__name(verifySessionToken, "verifySessionToken");
function base64UrlEncode(input) {
  const bytes = typeof input === "string" ? encoder.encode(input) : new Uint8Array(input);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
__name(base64UrlEncode, "base64UrlEncode");
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
__name(base64UrlDecode, "base64UrlDecode");
async function signHmac(message, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(message)
  );
  return base64UrlEncode(signature);
}
__name(signHmac, "signHmac");
function extractToken(request) {
  const authHeader = request.headers.get("authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const url = new URL(request.url);
  return url.searchParams.get("token");
}
__name(extractToken, "extractToken");
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
__name(timingSafeEqual, "timingSafeEqual");
async function requireTeacher(request, env) {
  const token = extractToken(request);
  if (!token) {
    throw new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }
  const payload = await verifySessionToken(token, env.TOKEN_SECRET);
  if (!payload || payload.role !== "teacher") {
    throw new Response(JSON.stringify({ error: "Not authorized" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }
  return payload;
}
__name(requireTeacher, "requireTeacher");
async function readJsonBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
__name(readJsonBody, "readJsonBody");
async function listCollectionSafe(db, collectionName) {
  try {
    return await db.listCollection(collectionName);
  } catch (error) {
    console.warn(`Failed to list collection ${collectionName}:`, error);
    return [];
  }
}
__name(listCollectionSafe, "listCollectionSafe");
function sanitizeDocument(document) {
  const flattened = flattenDocument(document);
  delete flattened.password;
  delete flattened.passwordHash;
  delete flattened.secret;
  delete flattened.token;
  return flattened;
}
__name(sanitizeDocument, "sanitizeDocument");
function matchesOwner(document, ownerId) {
  if (!document) {
    return false;
  }
  const candidate = [
    document.teacherId,
    document.ownerId,
    document.userId,
    document.createdBy,
    document.teacher_id
  ].map(normalizeId).find((value) => value);
  return candidate ? String(candidate) === String(ownerId) : false;
}
__name(matchesOwner, "matchesOwner");
function normalizeId(value) {
  if (value === null || value === void 0 || typeof value === "string" && value.trim() === "") {
    return null;
  }
  if (typeof value === "string") {
    return value.trim();
  }
  return String(value);
}
__name(normalizeId, "normalizeId");
function sanitizeMetadata(metadata) {
  if (!metadata || typeof metadata !== "object") {
    return {};
  }
  const cleaned = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value !== void 0) {
      cleaned[key] = value;
    }
  }
  return cleaned;
}
__name(sanitizeMetadata, "sanitizeMetadata");
function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      ...headers
    }
  });
}
__name(jsonResponse, "jsonResponse");
async function safeReadText(response) {
  try {
    return await response.text();
  } catch {
    return "Failed to read response";
  }
}
__name(safeReadText, "safeReadText");

// ../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-uHqFk4/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../.npm/_npx/32026684e21afda6/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-uHqFk4/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
