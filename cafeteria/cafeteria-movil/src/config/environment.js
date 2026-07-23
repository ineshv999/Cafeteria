const rawApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? '';
const rawTimeout = process.env.EXPO_PUBLIC_API_TIMEOUT_MS?.trim() ?? '';

const DEFAULT_TIMEOUT_MS = 15000;

function normalizeApiUrl(value) {
  return value.replace(/\/+$/, '');
}

function parseTimeout(value) {
  if (!value) return DEFAULT_TIMEOUT_MS;

  const timeout = Number(value);
  return Number.isFinite(timeout) && timeout > 0 ? timeout : DEFAULT_TIMEOUT_MS;
}

function getConfigurationError(apiUrl) {
  if (!apiUrl) {
    return 'Falta EXPO_PUBLIC_API_URL. Copia .env.example a .env.local y configura la URL de la API.';
  }

  if (!/^https?:\/\//i.test(apiUrl)) {
    return 'EXPO_PUBLIC_API_URL debe comenzar con http:// o https://.';
  }

  return null;
}

const apiUrl = normalizeApiUrl(rawApiUrl);
const configurationError = getConfigurationError(apiUrl);

export const environment = Object.freeze({
  apiUrl,
  apiTimeoutMs: parseTimeout(rawTimeout),
  isConfigured: configurationError === null,
  configurationError,
});

export function requireApiUrl() {
  if (configurationError) {
    throw new Error(configurationError);
  }

  return apiUrl;
}

export function resolveApiUrl(path = '') {
  const baseUrl = requireApiUrl();

  if (!path) return baseUrl;
  if (/^https?:\/\//i.test(path)) return path;

  return `${baseUrl}/${String(path).replace(/^\/+/, '')}`;
}

export default environment;
