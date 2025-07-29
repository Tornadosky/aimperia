const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get current board snapshot
export async function getBoardSnapshot(lessonId) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to get board snapshot");
    return await res.json();
}

// Manually save board snapshot
export async function saveBoardSnapshot(lessonId, snapshot) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/snapshot`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ snapshot }),
    });
    if (!res.ok) throw new Error("Failed to save board snapshot");
    return await res.json();
}

// Upload assets for board
export async function uploadBoardAsset(lessonId, fileName, dataUrl) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/assets`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileName, dataUrl }),
    });
    if (!res.ok) throw new Error("Failed to upload board asset");
    return await res.json();
}

// Upload board screenshot/highlight (teacher only)
export async function uploadBoardHighlight(lessonId, dataUrl, description) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/highlight`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataUrl, description }),
    });
    if (!res.ok) throw new Error("Failed to upload board highlight");
    return await res.json();
}