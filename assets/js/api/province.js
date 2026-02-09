import { httpRequest } from "./http.js";

export async function createProvince(provinceName) {
  return await httpRequest("/province/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ province: provinceName }),
    auth: true,
  });
}

export async function getProvinces({ page = 1, size = 5, search = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (search) params.set("search", search);

  return await httpRequest(`/province/?${params.toString()}`, {
    method: "GET",
    auth: true,
  });
}

export async function deleteProvince(provinceName) {
  const safe = encodeURIComponent(provinceName);
  return await httpRequest(`/province/${safe}`, {
    method: "DELETE",
    auth: true,
  });
}
