const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const defaultHeaders = {
    "Content-Type": "application/json",
};

export async function fetchLessons({ status, limit = 10, offset = 0 }) {
    const query = new URLSearchParams({ status, limit, offset });
    const res = await fetch(`${API_BASE_URL}/api/lessons?${query}`, {
        credentials: "include",
    });
    return await res.json();
}

export async function fetchLessonById(id) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
        credentials: "include",
    });
    return await res.json();
}

export async function createLesson(data) {
    const res = await fetch(`${API_BASE_URL}/api/lessons`, {
        method: "POST",
        headers: defaultHeaders,
        body: JSON.stringify(data),
        credentials: "include",
    });
    return await res.json();
}

export async function updateLesson(id, data) {
    const res = await fetch(`${API_BASE_URL}/api/lessons/${id}`, {
        method: "PATCH",
        headers: defaultHeaders,
        body: JSON.stringify(data),
        credentials: "include",
    });
    return await res.json();
}

export async function closeLesson(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${id}/close`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return await res.json();
}

export async function attendLesson(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${id}/attend`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return await res.json();
}

export async function getLessonSummary(id) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${id}/summary`, {
    credentials: 'include',
  });
  return await res.json();
}

export async function createLessonSummary(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${id}/summary`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return await res.json();
}

export async function updateLessonSummary(id, data) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${id}/summary`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(data),
    credentials: 'include',
  });
  return await res.json();
}
export async function generateAgoraToken({ lessonId }) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/agora/token`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ lessonId }),
    credentials: "include",
  });
  return await res.json();
}

export async function joinLesson(inviteCode) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/join`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ inviteCode }),
    credentials: "include",
  });
  return await res.json();
}

export async function uploadLessonSummaryImage(lessonId, { fileName, dataUrl }) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/summary/image`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ fileName, dataUrl }),
    credentials: "include",
  });
  return await res.json();
}

export async function uploadBoardHighlight(lessonId, { dataUrl, description }) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/highlight`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ dataUrl, description }),
    credentials: "include",
  });
  return await res.json();
}


export async function fetchBoardHighlights(lessonId) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/highlights`, {
    credentials: "include",
  });
  return await res.json();
}

export async function deleteBoardHighlight(lessonId, highlightId) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board/highlights/${highlightId}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (res.status === 204) return { success: true };
  return await res.json();
}

export async function fetchBoardSnapshot(lessonId) {
  const res = await fetch(`${API_BASE_URL}/api/lessons/${lessonId}/board`, {
    credentials: "include",
  });
  return await res.json();
}