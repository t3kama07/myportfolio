const DEFAULT_SITE_URL = "https://manjula.live";

function normalizeSiteUrl(value) {
  if (typeof value !== "string") {
    return DEFAULT_SITE_URL;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_SITE_URL;
  }

  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return DEFAULT_SITE_URL;
    }
    return url.origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function getSiteUrl() {
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL);
}
