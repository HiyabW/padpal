import Cookies from 'js-cookie';
import { updateChatSocketAuth } from './socket';

export const baseURL =
  typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
    ? process.env.REACT_APP_API_URL
    : 'http://localhost:3007';

const AUTH_PATHS_NO_REFRESH = ['/auth/login', '/auth/register', '/auth/refreshToken'];

export class ApiError extends Error {
  constructor(message, { status, statusText, body, path } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.path = path;
  }
}

function normalizePath(path) {
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.split('?')[0];
}

function isPublicAuthPath(path) {
  return AUTH_PATHS_NO_REFRESH.includes(normalizePath(path));
}

async function parseErrorBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function throwIfNotOk(response, path) {
  if (response.ok || isPublicAuthPath(path)) {
    return response;
  }

  const body = await parseErrorBody(response);
  const message =
    body?.error?.message ||
    body?.message ||
    `Request failed with status ${response.status}`;

  throw new ApiError(message, {
    status: response.status,
    statusText: response.statusText,
    body,
    path: normalizePath(path),
  });
}

async function refreshAccessToken() {
  try {
    const res = await fetch(`${baseURL}/auth/refreshToken`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
    Cookies.set('isLoggedIn', data.accessToken, { expires: inOneHour });
    updateChatSocketAuth();
    return data.accessToken;
  } catch {
    Cookies.remove('isLoggedIn');
    Cookies.remove('id');
    window.location = '/';
    return null;
  }
}

export async function apiFetch(path, options = {}) {
  const normalizedPath = normalizePath(path);
  const hadSession = Boolean(Cookies.get('isLoggedIn'));
  const sendAuth = hadSession && !isPublicAuthPath(normalizedPath);
  const token = sendAuth ? Cookies.get('isLoggedIn') : null;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(`${baseURL}${normalizedPath}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  const canRetryWithRefresh =
    res.status === 401 && hadSession && !isPublicAuthPath(normalizedPath);

  if (canRetryWithRefresh) {
    const newToken = await refreshAccessToken();
    if (!newToken) return res;
    res = await fetch(`${baseURL}${normalizedPath}`, {
      ...options,
      credentials: 'include',
      headers: { ...headers, Authorization: `Bearer ${newToken}` },
    });
  }

  return throwIfNotOk(res, normalizedPath);
}

export default apiFetch;
