import { httpRequest } from "./http.js";

export async function login(username, password) {
  // طبق openapi.json باید x-www-form-urlencoded باشه
  const form = new URLSearchParams();
  form.append("username", username);
  form.append("password", password);

  // grant_type اختیاریه؛ لازم نیست
  return await httpRequest("/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
    auth: false,
  });
}
