import { login } from "./api/auth.js";
import { alertError, alertSuccess } from "./ui/alerts.js";

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = (usernameInput.value || "").trim();
  const password = (passwordInput.value || "").trim();

  if (!username || !password) {
    alertError("خطا", "نام کاربری و رمز عبور را وارد کنید.");
    return;
  }

  try {
    const data = await login(username, password);

    // ذخیره توکن‌ها
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    localStorage.setItem("token_type", data.token_type);

    alertSuccess("ورود موفق", "در حال انتقال به داشبورد...");

    setTimeout(() => {
      // اسم فایل داشبورد رو دقیقاً همین می‌ذاریم
      window.location.href = "./dashboard.html";
    }, 800);
  } catch (err) {
    alertError("ورود ناموفق", err.message || "خطای ناشناخته");
  }
});
