const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
// const API_BASE_URL = "https://api.aimperia.org";

export async function login(email, password) {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
    });
    return await res.json();
}

export async function signup(data) {
    const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    });
    return await res.json();
}

export async function getCurrentUser() {
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, { credentials: 'include' });
    return await res.json();
}

export async function logout() {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    return await res.json();
}

export async function handleCallback(access_token, expires_in) {
    const params = new URLSearchParams();
    params.append('access_token', access_token);
    if (expires_in) params.append('expires_in', expires_in);

    const res = await fetch(`${API_BASE_URL}/api/auth/callback?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
    });
    return await res.json();
}

export async function updateProfile(data) {
    const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
    });
    return await res.json();
}

export async function setCookie(token, expires_in) {
    const res = await fetch(`${API_BASE_URL}/api/auth/cookie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, expires_in }),
        credentials: 'include',
    });
    return await res.json();
}