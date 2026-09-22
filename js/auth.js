// ============================================================
// Rambu Solo — auth.js
// Login admin menggunakan database MySQL + PHP session.
// ============================================================

const AUTH_SESSION_KEY = "rambuSoloSession";
const ADMIN_USERNAME = "admin-toraja";

function setSession(username, isAdmin) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ username, isAdmin: !!isAdmin }));
}

function getSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

async function getCsrfToken() {
  try {
    const response = await fetch("api/csrf.php", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.ok || !data.token) {
      throw new Error("Gagal membuat token keamanan.");
    }
    return data.token;
  } catch (error) {
    throw new Error("Token keamanan tidak tersedia. Coba muat ulang halaman.");
  }
}

async function syncSessionFromServer() {
  try {
    const response = await fetch("api/session.php", { cache: "no-store" });
    const data = await response.json().catch(() => ({}));

    if (response.ok && data.loggedIn && data.isAdmin) {
      setSession(data.username || ADMIN_USERNAME, true);
      return { ok: true, username: data.username || ADMIN_USERNAME };
    }

    clearSession();
    return { ok: false };
  } catch (error) {
    clearSession();
    return { ok: false };
  }
}

async function loginAkun(username, password) {
  username = (username || "").trim();

  if (username === "" || password === "") {
    return { ok: false, pesan: "Harap isi username dan password." };
  }

  try {
    const csrfToken = await getCsrfToken();
    const response = await fetch("api/login.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ username, password, csrf_token: csrfToken }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.ok) {
      return { ok: false, pesan: data.message || "Username atau password salah." };
    }

    setSession(data.username, true);
    return { ok: true, pesan: "Login berhasil!" };
  } catch (error) {
    return { ok: false, pesan: error.message || "Server tidak bisa dihubungi. Jalankan project melalui XAMPP/localhost." };
  }
}

async function logoutUser() {
  try {
    const csrfToken = await getCsrfToken();
    fetch("api/logout.php", {
      method: "POST",
      keepalive: true,
      headers: { "X-CSRF-Token": csrfToken },
    }).catch(() => {
      // Sesi lokal tetap dihapus jika server tidak dapat dihubungi.
    });
  } catch (error) {
    fetch("api/logout.php", { method: "POST", keepalive: true }).catch(() => {});
  }

  clearSession();
  closeNavUserMenu();
  terapkanTampilanSesi();

  const sedangDiPanelAdmin =
    window.location.pathname.toLowerCase().endsWith("admin.html") ||
    document.getElementById("adminAccountsTable") !== null;

  if (sedangDiPanelAdmin) {
    window.location.replace("index.html");
  }
}

function ambilInisial(nama) {
  const bersih = (nama || "").trim();
  if (bersih === "") return "?";
  return bersih.slice(0, 2).toUpperCase();
}

function toggleNavUserMenu() {
  const menu = document.getElementById("navUserMenu");
  const btn = document.getElementById("navAvatarBtn");
  if (!menu) return;

  const akanTerbuka = menu.classList.contains("hidden");
  menu.classList.toggle("hidden", !akanTerbuka);
  if (btn) btn.setAttribute("aria-expanded", String(akanTerbuka));
}

function closeNavUserMenu() {
  const menu = document.getElementById("navUserMenu");
  const btn = document.getElementById("navAvatarBtn");
  if (menu) menu.classList.add("hidden");
  if (btn) btn.setAttribute("aria-expanded", "false");
}

document.addEventListener("click", (event) => {
  const wrap = document.getElementById("navUserInfo");
  if (wrap && !wrap.contains(event.target)) closeNavUserMenu();
});

async function terapkanTampilanSesi() {
  let sesi = getSession();

  const serverState = await syncSessionFromServer();
  if (serverState.ok) {
    sesi = { username: serverState.username, isAdmin: true };
  } else {
    sesi = null;
  }

  const loginLink = document.getElementById("navLoginLink");
  const userInfo = document.getElementById("navUserInfo");
  const usernameEl = document.getElementById("navUsername");
  const avatarEl = document.getElementById("navAvatar");
  const avatarLgEl = document.getElementById("navAvatarLg");

  if (sesi && sesi.isAdmin) {
    if (loginLink) loginLink.classList.add("hidden");
    if (userInfo) userInfo.classList.remove("hidden");
    if (usernameEl) usernameEl.textContent = sesi.username;
    const inisial = ambilInisial(sesi.username);
    if (avatarEl) avatarEl.textContent = inisial;
    if (avatarLgEl) avatarLgEl.textContent = inisial;
  } else {
    if (loginLink) loginLink.classList.remove("hidden");
    if (userInfo) userInfo.classList.add("hidden");
    closeNavUserMenu();
  }

  document.querySelectorAll(".admin-only").forEach((el) => {
    if (sesi && sesi.isAdmin) el.classList.remove("hidden");
    else el.classList.add("hidden");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  terapkanTampilanSesi().catch(() => {
    clearSession();
  });
});
