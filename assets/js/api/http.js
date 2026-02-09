const BASE_URL = "https://edu-api.havirkesht.ir"; // طبق پروژه

function getToken() {
  return localStorage.getItem("access_token") || "";
}

export async function httpRequest(path, { method = "GET", headers = {}, body = null, auth = false } = {}) {
  const finalHeaders = { ...headers };

  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: finalHeaders,
    body,
  });

  let data = null;
  const contentType = res.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => null);
  }

  if (!res.ok) {
    const message =
      (data && (data.detail || data.message)) ||
      (typeof data === "string" && data) ||
      `خطای سرور (HTTP ${res.status})`;
    throw new Error(message);
  }

  return data;
}
