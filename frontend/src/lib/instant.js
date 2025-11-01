const CONFIG_URL = `${import.meta.env.BASE_URL}app-config.json`;

let configPromise;

async function loadConfig() {
  if (!configPromise) {
    configPromise = fetch(CONFIG_URL, { mode: "cors" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load app configuration");
        }
        return response.json();
      })
      .then((data) => {
        if (!data?.APP_ID || !data?.INSTANT_ADMIN_TOKEN) {
          throw new Error("Invalid app configuration" );
        }
        return {
          appId: data.APP_ID,
          token: data.INSTANT_ADMIN_TOKEN,
        };
      });
  }
  return configPromise;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function flatten(doc) {
  if (!doc || typeof doc !== "object") {
    return {};
  }
  const base = { ...doc };
  if (doc.fields && typeof doc.fields === "object") {
    Object.assign(base, doc.fields);
  }
  if (doc.data && typeof doc.data === "object") {
    Object.assign(base, doc.data);
  }
  if (!base.id && base._id) {
    base.id = base._id;
  }
  delete base.fields;
  delete base.data;
  return base;
}

function normaliseCollection(payload) {
  if (Array.isArray(payload)) {
    return payload.map(flatten);
  }
  if (payload && typeof payload === "object") {
    for (const key of ["items", "documents", "results", "data"]) {
      if (Array.isArray(payload[key])) {
        return payload[key].map(flatten);
      }
    }
  }
  return [];
}

async function instantFetch(path, options = {}, attempt = 0) {
  const { appId, token } = await loadConfig();
  const url = `https://api.instantdb.com/v1/app/${appId}${path}`;
  const isJsonBody = options.body !== undefined;
  const headers = {
    authorization: `Bearer ${token}`,
    ...(isJsonBody ? { "content-type": "application/json" } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    mode: "cors",
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status >= 500 && attempt < 2) {
      await sleep(200 * (attempt + 1));
      return instantFetch(path, options, attempt + 1);
    }
    let message = `InstantDB request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.error) {
        message = body.error;
      }
    } catch (err) {
      // ignore JSON errors
    }
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function list(collection) {
  const payload = await instantFetch(`/collection/${collection}`, { method: "GET" });
  return normaliseCollection(payload);
}

export async function create(collection, data) {
  const payload = await instantFetch(`/collection/${collection}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (payload && typeof payload === "object" && payload.document) {
    return flatten(payload.document);
  }
  return flatten(payload);
}

export async function findOneByField(collection, field, value) {
  const docs = await list(collection);
  return docs.find((doc) => doc?.[field] === value);
}

export async function ensureDemoTeacher(hashPassword) {
  try {
    const existing = await findOneByField("teachers", "username", "MrStewart");
    if (!existing) {
      const password = await hashPassword("Dragon-S25052");
      await create("teachers", {
        username: "MrStewart",
        password,
        createdAt: new Date().toISOString(),
      });
      return true;
    }
  } catch (error) {
    console.warn("Demo teacher seed failed", error);
  }
  return false;
}
