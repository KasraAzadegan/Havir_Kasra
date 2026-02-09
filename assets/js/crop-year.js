// =====================
//  Crop Year Page Logic
//  (No import / No module) => works 100% on Live Server
// =====================

const API_BASE = "https://edu-api.havirkesht.ir";

function getToken() {
  // سازگار با هر حالتی که لاگین ذخیره کرده
  return (
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    localStorage.getItem("jwt") ||
    ""
  );
}

async function apiFetch(path, options = {}) {
  const token = getToken();

  const res = await fetch(API_BASE + path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && (data.detail || data.message)) ||
      (typeof data === "string" ? data : "") ||
      `خطا (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// SweetAlerts
function alertError(title, text) {
  return Swal.fire({ icon: "error", title, text, confirmButtonText: "باشه" });
}
function alertSuccess(title, text) {
  return Swal.fire({ icon: "success", title, text, confirmButtonText: "باشه" });
}

// Persian digits
function toFaDigits(str) {
  const map = { "0":"۰","1":"۱","2":"۲","3":"۳","4":"۴","5":"۵","6":"۶","7":"۷","8":"۸","9":"۹" };
  return String(str).replace(/[0-9]/g, (d) => map[d]);
}

// Selected year storage
function setSelectedYear(row) {
  localStorage.setItem("selected_crop_year_id", String(row.id));
  localStorage.setItem("selected_crop_year_name", String(row.crop_year_name));
  syncSelectedYearUI();
}
function getSelectedYearId() {
  const v = localStorage.getItem("selected_crop_year_id");
  return v ? Number(v) : null;
}
function getSelectedYearName() {
  return localStorage.getItem("selected_crop_year_name") || "";
}
function syncSelectedYearUI() {
  const name = getSelectedYearName();
  document.getElementById("selectedYearLabel").textContent = name ? toFaDigits(name) : "-";
  document.getElementById("sideSelectedYear").textContent = name ? toFaDigits(name) : "-";
}

// Modal system (HTML modal مثل عکس)
const modalOverlay = document.getElementById("modalOverlay");
function openModal(templateId, onMount) {
  modalOverlay.innerHTML = "";
  modalOverlay.classList.remove("hidden");
  modalOverlay.classList.add("flex");

  const tpl = document.getElementById(templateId);
  modalOverlay.appendChild(tpl.content.cloneNode(true));

  modalOverlay.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", closeModal));

  modalOverlay.addEventListener(
    "click",
    (e) => {
      if (e.target === modalOverlay) closeModal();
    },
    { once: true }
  );

  if (typeof onMount === "function") onMount(modalOverlay);
}
function closeModal() {
  modalOverlay.classList.add("hidden");
  modalOverlay.classList.remove("flex");
  modalOverlay.innerHTML = "";
}

// Elements
const tbody = document.getElementById("tbody");
const btnCreateYear = document.getElementById("btnCreateYear");
const yearSelect = document.getElementById("yearSelect");
const searchInput = document.getElementById("searchInput");

const pageLabel = document.getElementById("pageLabel");
const pagesLabel = document.getElementById("pagesLabel");
const pagePill = document.getElementById("pagePill");
const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");

// State
let page = 1;
let size = 50;
let pages = 1;
let search = "";
let itemsCache = [];

// API calls
async function fetchCropYears() {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("size", String(size));
  if (search) qs.set("search", search);

  return await apiFetch(`/crop-year/?${qs.toString()}`, { method: "GET" });
}

async function createCropYear(name) {
  return await apiFetch(`/crop-year/`, {
    method: "POST",
    body: JSON.stringify({ crop_year_name: name }),
  });
}

async function removeCropYear(name) {
  const safe = encodeURIComponent(name);
  return await apiFetch(`/crop-year/${safe}`, { method: "DELETE" });
}

// Render
function renderPagination() {
  pageLabel.textContent = toFaDigits(page);
  pagesLabel.textContent = toFaDigits(pages);
  pagePill.textContent = toFaDigits(page);

  btnPrev.disabled = page <= 1;
  btnNext.disabled = page >= pages;
}

function fillSelect(items) {
  const selectedId = getSelectedYearId();

  yearSelect.innerHTML = `<option value="">انتخاب کنید</option>`;
  items.forEach((row) => {
    const opt = document.createElement("option");
    opt.value = String(row.id);
    opt.textContent = toFaDigits(row.crop_year_name);
    yearSelect.appendChild(opt);
  });

  if (selectedId) yearSelect.value = String(selectedId);
}

function renderRows(items) {
  tbody.innerHTML = "";

  if (!items || items.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td class="px-4 py-6 text-slate-200/70" colspan="3">داده‌ای یافت نشد.</td>`;
    tbody.appendChild(tr);
    return;
  }

  const selectedName = getSelectedYearName();

  items.forEach((row) => {
    const isSelected = selectedName && row.crop_year_name === selectedName;

    const tr = document.createElement("tr");
    tr.className = `hover:bg-white/5 ${isSelected ? "bg-white/5" : ""}`;

    tr.innerHTML = `
      <td class="px-4 py-4">
        <div class="flex items-center justify-end gap-3">
          <span class="font-semibold text-indigo-200">${toFaDigits(row.crop_year_name)}</span>

          <button
            class="btnPick inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            type="button"
            title="انتخاب"
            data-id="${row.id}"
          >
            +
          </button>
        </div>
      </td>

      <td class="px-4 py-4 text-indigo-200">
        ${row.created_at ? toFaDigits(String(row.created_at).split("T")[0]) : "-"}
      </td>

      <td class="px-4 py-4">
        <button
          class="btnTrash inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
          type="button"
          title="حذف"
          data-name="${row.crop_year_name}"
        >
          🗑
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Pick handlers
  tbody.querySelectorAll(".btnPick").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = Number(btn.getAttribute("data-id"));
      const row = itemsCache.find((x) => x.id === id);
      if (!row) return;
      setSelectedYear(row);
      yearSelect.value = String(row.id);
      renderRows(itemsCache);
    });
  });

  // Delete handlers
  tbody.querySelectorAll(".btnTrash").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const name = btn.getAttribute("data-name");

      const res = await Swal.fire({
        icon: "warning",
        title: "حذف سال زراعی",
        text: `آیا از حذف «${name}» مطمئن هستید؟`,
        showCancelButton: true,
        confirmButtonText: "بله، حذف کن",
        cancelButtonText: "لغو",
      });
      if (!res.isConfirmed) return;

      try {
        await removeCropYear(name);

        if (getSelectedYearName() === name) {
          localStorage.removeItem("selected_crop_year_id");
          localStorage.removeItem("selected_crop_year_name");
          yearSelect.value = "";
          syncSelectedYearUI();
        }

        await alertSuccess("حذف شد", "سال زراعی با موفقیت حذف شد.");
        await load();
      } catch (e) {
        alertError("خطا", e.message || "حذف انجام نشد");
      }
    });
  });
}

// Load
async function load() {
  try {
    const token = getToken();
    if (!token) {
      await alertError("دسترسی غیرمجاز", "ابتدا وارد شوید.");
      window.location.href = "./login.html";
      return;
    }

    const data = await fetchCropYears();
    pages = Math.max(1, Number(data.pages || 1));
    itemsCache = data.items || [];

    fillSelect(itemsCache);
    renderRows(itemsCache);
    renderPagination();
    syncSelectedYearUI();
  } catch (e) {
    alertError("خطا", e.message || "دریافت اطلاعات انجام نشد");
  }
}

// Events
btnCreateYear.addEventListener("click", () => {
  // این همون “صفحه/مودال” هست که گفتی باید بالا بیاد
  openModal("tplCreateYearModal", (root) => {
    const input = root.querySelector("#inputCropYear");
    const submit = root.querySelector("#btnSubmitCropYear");

    setTimeout(() => input.focus(), 0);

    async function submitHandler() {
      const value = (input.value || "").trim();
      if (!value) {
        alertError("خطا", "سال زراعی را وارد کنید.");
        input.focus();
        return;
      }

      try {
        await createCropYear(value);
        closeModal();
        await alertSuccess("ثبت شد", "سال زراعی جدید ایجاد شد.");
        page = 1;
        await load();
      } catch (e) {
        alertError("خطا", e.message || "ثبت انجام نشد");
      }
    }

    submit.addEventListener("click", submitHandler);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitHandler();
      if (e.key === "Escape") closeModal();
    });
  });
});

yearSelect.addEventListener("change", () => {
  const id = Number(yearSelect.value);
  if (!id) {
    localStorage.removeItem("selected_crop_year_id");
    localStorage.removeItem("selected_crop_year_name");
    syncSelectedYearUI();
    renderRows(itemsCache);
    return;
  }
  const row = itemsCache.find((x) => x.id === id);
  if (!row) return;
  setSelectedYear(row);
  renderRows(itemsCache);
});

let searchTimer = null;
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    search = (searchInput.value || "").trim();
    page = 1;
    load();
  }, 300);
});

btnPrev.addEventListener("click", () => {
  page = Math.max(1, page - 1);
  load();
});
btnNext.addEventListener("click", () => {
  page = Math.min(pages, page + 1);
  load();
});

// Init
syncSelectedYearUI();
load();
