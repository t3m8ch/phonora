import { env } from "@/lib/env";

type QueryPrimitive = string | number | boolean | null | undefined;
interface QueryDictionary {
  [key: string]: QueryValue;
}
type QueryValue = QueryPrimitive | QueryDictionary | QueryValue[];

const appendQueryValue = (
  params: URLSearchParams,
  key: string,
  value: QueryValue,
): void => {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryValue(params, key, entry));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value).forEach(([childKey, childValue]) => {
      appendQueryValue(params, `${key}[${childKey}]`, childValue);
    });
    return;
  }

  params.append(key, String(value));
};

const buildQueryString = (query?: Record<string, QueryValue>) => {
  const params = new URLSearchParams();

  Object.entries(query ?? {}).forEach(([key, value]) => {
    appendQueryValue(params, key, value);
  });

  const result = params.toString();
  return result ? `?${result}` : "";
};

export const publicFilter = (extra?: Record<string, QueryValue>) => ({
  filter: {
    _and: [
      { status: { _eq: env.publishedStatus } },
      { visibility: { _nnull: false, _eq: env.publishedVisibility } },
      ...(extra ? [extra] : []),
    ],
  },
});

export async function directusRequest<T>(
  path: string,
  query?: Record<string, QueryValue>,
): Promise<T | null> {
  const url = `${env.directusUrl}${path}${buildQueryString(query)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      next: { revalidate: 0 },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as { data?: T };
    return payload.data ?? null;
  } catch {
    return null;
  }
}
