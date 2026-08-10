const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (configuredApiUrl || 'http://127.0.0.1:8000').replace(/\/$/, '');

export function apiUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_URL}${normalizedPath}`;
}
