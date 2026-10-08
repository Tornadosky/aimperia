const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.aimperia.org";

export async function subscribeToNewsletter(email) {
    const res = await fetch(`${API_BASE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
    });
    return await res.json();
}

export async function submitContactRequest({ name, email, phone, message }) {
    const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, message }),
    });
    return await res.json();
}

