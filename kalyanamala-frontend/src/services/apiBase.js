const DEFAULT_ORIGIN = 'https://kalyanamala-backend-production.up.railway.app';

export function resolveApiBase(raw) {
  const trimmed = String(raw || DEFAULT_ORIGIN).trim().replace(/\/+$/, '');
  const origin = trimmed.replace(/\/api$/i, '') || DEFAULT_ORIGIN;
  return {
    origin,
    api: `${origin}/api`
  };
}

const resolved = resolveApiBase(process.env.REACT_APP_API_BASE_URL);

export const API_ORIGIN = resolved.origin;
export const API_BASE_URL = resolved.api;
