// ============================================================
// Rambu Solo — login-page.js
// Logika khusus halaman login.html: memproses form login lewat
// fungsi loginAkun() di auth.js. Website ini tidak punya fitur
// "Buat Akun" — akun admin sudah ditetapkan di js/auth.js.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  // Hanya sesi PHP yang sah boleh melewati halaman login.
  fetch("api/session.php", { cache: "no-store" })
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn && data.isAdmin) window.location.href = "admin.html";
      else clearSession();
    })
    .catch(() => clearSession());
});

async function prosesLogin(event) {
  event.preventDefault();

  const username = document.getElementById("loginUsername").value;
  const password = document.getElementById("loginPassword").value;
  const errorMsg = document.getElementById("loginError");
  const successMsg = document.getElementById("loginSuccess");
  const loader = document.getElementById("loginLoader");
  const tombol = document.getElementById("loginButton");

  errorMsg.classList.add("hidden");
  successMsg.classList.add("hidden");
  loader.classList.remove("hidden");
  tombol.disabled = true;

  const hasil = await loginAkun(username, password);

  loader.classList.add("hidden");
  tombol.disabled = false;

  if (!hasil.ok) {
    errorMsg.textContent = hasil.pesan;
    errorMsg.classList.remove("hidden");
    return false;
  }

  successMsg.textContent = hasil.pesan + " Mengalihkan ke Panel Admin...";
  successMsg.classList.remove("hidden");
  terapkanTampilanSesi();

  setTimeout(() => {
    window.location.href = "admin.html";
  }, 600);

  return false;
}
