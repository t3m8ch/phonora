const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

export const env = {
  directusUrl: trimTrailingSlash(
    process.env.DIRECTUS_URL ?? "http://localhost:8055",
  ),
  assetsBaseUrl: trimTrailingSlash(
    process.env.DIRECTUS_ASSETS_BASE_URL ??
      process.env.DIRECTUS_URL ??
      "http://localhost:8055",
  ),
  publishedStatus: process.env.DIRECTUS_PUBLIC_STATUS ?? "published",
  publishedVisibility: process.env.DIRECTUS_PUBLIC_VISIBILITY ?? "visible",
};

export const assetUrl = (fileId?: string | null) => {
  if (!fileId) {
    return "";
  }

  if (env.assetsBaseUrl.endsWith("/assets")) {
    return `${env.assetsBaseUrl}/${fileId}`;
  }

  return `${env.assetsBaseUrl}/assets/${fileId}`;
};
