const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

const ABSOLUTE_URL_REGEX = /^(?:https?:)?\/\//i;

export function resolveImageUrl(path) {
  if (!path) return null;

  if (ABSOLUTE_URL_REGEX.test(path) || path.startsWith("data:")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
