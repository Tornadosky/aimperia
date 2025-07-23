const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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