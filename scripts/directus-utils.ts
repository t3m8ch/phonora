const directusUrl = (process.env.DIRECTUS_URL ?? "http://localhost:8055").replace(/\/$/, "");
const adminEmail = process.env.DIRECTUS_ADMIN_EMAIL ?? "admin@example.com";
const adminPassword = process.env.DIRECTUS_ADMIN_PASSWORD ?? "directus";

export type JsonObject = Record<string, unknown>;

export async function getAdminToken() {
  if (process.env.DIRECTUS_ADMIN_TOKEN) {
    return process.env.DIRECTUS_ADMIN_TOKEN;
  }

  const response = await fetch(`${directusUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Directus login failed: ${response.status} ${error}`);
  }

  const payload = (await response.json()) as {
    data?: { access_token?: string };
  };
  const token = payload.data?.access_token;

  if (!token) {
    throw new Error("Directus login succeeded but no access token was returned.");
  }

  return token;
}

export async function directusRequest<T>(
  token: string,
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${directusUrl}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`${init.method ?? "GET"} ${path} failed: ${response.status} ${await response.text()}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function directusUpload(
  token: string,
  filePath: string,
  title: string,
) {
  const form = new FormData();
  form.set("title", title);
  form.set("file", Bun.file(filePath));

  const response = await fetch(`${directusUrl}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    body: form,
  });

  if (!response.ok) {
    throw new Error(`POST /files failed: ${response.status} ${await response.text()}`);
  }

  return (await response.json()) as { data: { id: string } };
}

export async function readItems<T>(
  token: string,
  collection: string,
  query: string,
) {
  return directusRequest<{ data: T[] }>(token, `/items/${collection}${query}`);
}

export async function createItem<T extends JsonObject>(
  token: string,
  collection: string,
  payload: T,
) {
  return directusRequest<{ data: T & { id: string } }>(token, `/items/${collection}`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateItem<T extends JsonObject>(
  token: string,
  collection: string,
  primaryKey: string,
  payload: Partial<T>,
) {
  return directusRequest<{ data: T & { id: string } }>(
    token,
    `/items/${collection}/${primaryKey}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export async function upsertByUnique<T extends JsonObject>(
  token: string,
  collection: string,
  uniqueField: string,
  uniqueValue: string,
  payload: T,
) {
  const encodedQuery = new URLSearchParams({
    filter: JSON.stringify({ [uniqueField]: { _eq: uniqueValue } }),
    limit: "1",
  }).toString();

  const existing = await readItems<T & { id: string }>(
    token,
    collection,
    `?${encodedQuery}`,
  );

  const current = existing.data[0];
  if (!current) {
    return createItem(token, collection, payload);
  }

  return updateItem(token, collection, current.id, payload);
}

export async function delay(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export { directusUrl };
