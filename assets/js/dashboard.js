import { createProvince } from "./api/province.js";
import { createCropYear } from "./api/cropYear.js";
import { alertError, alertSuccess } from "./ui/alerts.js";

function requireAuth() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alertError("دسترسی غیرمجاز", "ابتدا وارد شوید.");
    setTimeout(() => {
      window.location.href = "./login.html";
    }, 800);
    return false;
  }
  return true;
}

if (!requireAuth()) {
  // جلو ادامه اجرا رو می‌گیریم
  throw new Error("No token");
}

// ثبت استان
const provinceForm = document.getElementById("provinceForm");
const provinceInput = document.getElementById("provinceName");

provinceForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (provinceInput.value || "").trim();
  if (!name) return alertError("خطا", "نام استان را وارد کنید.");

  try {
    await createProvince(name);
    alertSuccess("ثبت شد", "استان با موفقیت ثبت شد.");
    provinceInput.value = "";
  } catch (err) {
    alertError("خطا در ثبت استان", err.message || "خطای ناشناخته");
  }
});

// ثبت سال زراعی
const cropYearForm = document.getElementById("cropYearForm");
const cropYearInput = document.getElementById("cropYearName");

cropYearForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = (cropYearInput.value || "").trim();
  if (!name) return alertError("خطا", "نام سال زراعی را وارد کنید.");

  try {
    await createCropYear(name);
    alertSuccess("ثبت شد", "سال زراعی با موفقیت ثبت شد.");
    cropYearInput.value = "";
  } catch (err) {
    alertError("خطا در ثبت سال زراعی", err.message || "خطای ناشناخته");
  }
});
