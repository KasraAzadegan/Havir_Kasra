import { getProvinces, createProvince, deleteProvince } from "./api/province.js";
import { alertError, alertSuccess } from "./ui/alerts.js";

function requireAuth() {
  const token = localStorage.getItem("access_token");
  if (!token) {
    alertError("دسترسی غیرمجاز", "ابتدا وارد شوید.");
    setTimeout(() => (window.location.href = "./login.html"), 800);
    return false;
  }
  return true;
}

if (!requireAuth()) {
  throw new Error("No token");
}

// ===== Helpers =====
function toFaDigits(str) {
  const map = { "0":"۰","1":"۱","2":"۲","3":"۳","4":"۴","5":"۵","6":"۶","7":"۷","8":"۸","9":"۹" };
  return String(str).replace(/[0-9]/g, (d) => map[d]);
}

function formatCreatedAt(createdAt) {
  // اگر ISO بود، فقط بخش تاریخ را نمایش می‌دهیم
  // مثال: 2025-01-20T10:20:30 -> 2025-01-20
  if (!createdAt) return "-";
  const s = String(createdAt);
  return s.includes("T") ? s.split("T")[0] : s;
}

// ===== Elements =====
const tbody = document.getElementById("tbody");
const countLabel = document.getElementById("countLabel");
const searchInput = document.getElementById("searchInput");

const pageLabel = document.getElementById("pageLabel");
const pagesLabel = document.getElementById("pagesLabel");
const pagePill = document.getElementById("pagePill");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnAddProvince = document.getElementById("btnAddProvince");

// ===== State =====
let page = 1;
const pageSize = 5;
let totalPages = 1;
let currentSearch = "";

// ===== Render =====
function renderRows(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="px-4 py-6 text-slate-200/70" colspan="3">داده‌ای یافت نشد.</td>`;
    tbody.appendChild(tr);
    return;
  }

  items.forEach((row) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-white/5";
    tr.innerHTML = `
      <td class="px-4 py-4">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/15">+</span>
          <span class="text-indigo-200 font-semibold">${row.province}</span>
        </div>
      </td>

      <td class="px-4 py-4 text-indigo-200">${formatCreatedAt(row.created_at)}</td>

      <td class="px-4 py-4">
        <button class="btnTrash inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
                type="button"
                data-province="${row.province}"
                aria-label="حذف">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-slate-200/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 6h18"/>
            <path d="M8 6V4h8v2"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
          </svg>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // delete handlers
  tbody.querySelectorAll(".btnTrash").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const provinceName = btn.getAttribute("data-province");
      await handleDelete(provinceName);
    });
  });
}

function renderPagination() {
  pageLabel.textContent = toFaDigits(page);
  pagesLabel.textContent = toFaDigits(totalPages);
  pagePill.textContent = toFaDigits(page);

  btnPrev.disabled = page <= 1;
  btnNext.disabled = page >= totalPages;
}

// ===== API Load =====
async function load() {
  try {
    const data = await getProvinces({ page, size: pageSize, search: currentSearch });

    // data: { total, size, pages, items: [...] }
    totalPages = Math.max(1, Number(data.pages || 1));
    countLabel.textContent = toFaDigits(Number(data.total || 0));

    renderRows(data.items || []);
    renderPagination();
  } catch (err) {
    alertError("خطا", err.message || "خطا در دریافت لیست استان‌ها");
  }
}

// ===== Add =====
btnAddProvince.addEventListener("click", async () => {
  const res = await Swal.fire({
    title: "ثبت استان جدید",
    input: "text",
    inputLabel: "نام استان",
    inputPlaceholder: "مثلاً: خراسان رضوی",
    showCancelButton: true,
    confirmButtonText: "ثبت",
    cancelButtonText: "لغو",
    inputValidator: (value) => {
      if (!value || !value.trim()) return "نام استان را وارد کنید";
      return null;
    },
  });

  if (!res.isConfirmed) return;

  const name = res.value.trim();

  try {
    await createProvince(name);
    alertSuccess("ثبت شد", "استان با موفقیت ثبت شد.");
    page = 1;
    await load();
  } catch (err) {
    alertError("خطا در ثبت استان", err.message || "خطای ناشناخته");
  }
});

// ===== Delete =====
async function handleDelete(provinceName) {
  const res = await Swal.fire({
    icon: "warning",
    title: "حذف استان",
    text: `آیا از حذف «${provinceName}» مطمئن هستید؟`,
    showCancelButton: true,
    confirmButtonText: "بله، حذف کن",
    cancelButtonText: "لغو",
  });

  if (!res.isConfirmed) return;

  try {
    await deleteProvince(provinceName);
    alertSuccess("حذف شد", "استان با موفقیت حذف شد.");
    // اگر صفحه خالی شد، یک صفحه عقب برگرد
    if (page > 1) page = page; // فعلاً نگه
    await load();
  } catch (err) {
    alertError("خطا در حذف استان", err.message || "خطای ناشناخته");
  }
}

// ===== Search + Pagination =====
let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentSearch = (searchInput.value || "").trim();
    page = 1;
    load();
  }, 350);
});

btnPrev.addEventListener("click", () => {
  page = Math.max(1, page - 1);
  load();
});

btnNext.addEventListener("click", () => {
  page = Math.min(totalPages, page + 1);
  load();
});

// init
load();
