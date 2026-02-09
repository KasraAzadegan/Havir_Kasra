import { httpRequest } from "./http.js";

// GET /crop-year/?page=1&size=50&search=
export async function getCropYears({ page = 1, size = 50, search = "" } = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("size", String(size));
  if (search) params.set("search", search);

  return await httpRequest(`/crop-year/?${params.toString()}`, {
    method: "GET",
    auth: true,
  });
}

// POST /crop-year/   body: { crop_year_name: "1404" }
export async function createCropYear(cropYearName) {
  return await httpRequest("/crop-year/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ crop_year_name: cropYearName }),
    auth: true,
  });
}

// DELETE /crop-year/{crop_year_name}
export async function deleteCropYear(cropYearName) {
  const safe = encodeURIComponent(cropYearName);
  return await httpRequest(`/crop-year/${safe}`, {
    method: "DELETE",
    auth: true,
  });
}
