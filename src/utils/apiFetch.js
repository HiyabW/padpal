import Cookies from 'js-cookie';

const API_BASE = 'https://palpal-api.onrender.com';

async function refreshAccessToken() {
    try {
        const res = await fetch(`${API_BASE}/auth/refreshToken`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!res.ok) throw new Error('Refresh failed');
        const data = await res.json();
        const inOneHour = new Date(new Date().getTime() + 60 * 60 * 1000);
        Cookies.set('isLoggedIn', data.accessToken, { expires: inOneHour });
        return data.accessToken;
    } catch {
        Cookies.remove('isLoggedIn');
        Cookies.remove('id');
        window.location = '/';
        return null;
    }
}

export async function apiFetch(path, options = {}) {
    const token = Cookies.get('isLoggedIn');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) return res;
        res = await fetch(`${API_BASE}${path}`, {
            ...options,
            credentials: 'include',
            headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
    }

    return res;
}
