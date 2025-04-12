// 🔐 Enable Encrypt Button Only When Image is Uploaded
const encryptInput = document.getElementById("encryptInput");
const encryptBtn = document.getElementById("encryptBtn");
encryptInput.addEventListener("change", () => {
  encryptBtn.disabled = !encryptInput.files.length;
});

// 🔓 Enable Decrypt Button Only When Both Image and Key Are Uploaded
const decryptInput = document.getElementById("decryptInput");
const keyInput = document.getElementById("keyInput");
const decryptBtn = document.getElementById("decryptBtn");

function checkDecryptInputs() {
  decryptBtn.disabled = !(decryptInput.files.length && keyInput.files.length);
}

decryptInput.addEventListener("change", checkDecryptInputs);
keyInput.addEventListener("change", checkDecryptInputs);

function setupDrop(dropId, inputId) {
  const dropZone = document.getElementById(dropId);
  const fileInput = document.getElementById(inputId);

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
  });
  dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    fileInput.files = e.dataTransfer.files;

    // 🔄 Trigger change event manually so buttons update
    const event = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(event);
  });
}

setupDrop("encryptDrop", "encryptInput");
setupDrop("decryptDrop", "decryptInput");
setupDrop("keyDrop", "keyInput");

document.getElementById("encryptForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/encrypt", { method: "POST", body: form });
  const data = await res.json();
  document.getElementById("encryptResult").textContent = JSON.stringify(
    data,
    null,
    2
  );
});

document.getElementById("decryptForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const res = await fetch("/decrypt", { method: "POST", body: form });
  const data = await res.json();
  document.getElementById("decryptResult").textContent = JSON.stringify(
    data,
    null,
    2
  );
});
const themeToggle = document.getElementById("themeToggle");

function applyThemeIcon(isDark) {
  themeToggle.textContent = isDark ? "🌙" : "☀️";
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  applyThemeIcon(isDark);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");

  let isDark = false;
  if (savedTheme) {
    isDark = savedTheme === "dark";
  } else {
    isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if (isDark) document.body.classList.add("dark-mode");
  applyThemeIcon(isDark);
});

themeToggle.addEventListener("click", toggleDarkMode);
