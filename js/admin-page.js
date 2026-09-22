// ============================================================
// Rambu Solo — admin-page.js
// Logika khusus halaman admin.html.
// Data Masukan & Saran dibaca dan dihapus langsung dari MySQL
// melalui api/masukan.php dan dilindungi session PHP.
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const sesi = await cekSessionServer();

  if (!sesi) {
    clearSession();
    window.location.href = "login.html";
    return;
  }

  const welcome = document.getElementById("adminWelcome");
  if (welcome) welcome.textContent = `Halo, ${sesi.username} 👋`;

  tampilkanDaftarAkun(sesi.username);

  if (typeof bukaEditKontak === "function") bukaEditKontak();

  tampilkanMasukanAdmin();
});

async function cekSessionServer() {
  try {
    const response = await fetch("api/session.php", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.loggedIn || !data.isAdmin) return null;

    // Tetap isi session lokal hanya untuk tampilan navbar.
    setSession(data.username, true);
    return data;
  } catch (error) {
    return null;
  }
}

/* ---------------- Masukan & Saran (MySQL) ---------------- */
async function tampilkanMasukanAdmin() {
  const tbody = document.getElementById("masukanAdminTable");
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="5">Memuat masukan...</td></tr>';

  try {
    const response = await fetch("api/masukan.php", { cache: "no-store" });
    const result = await response.json();

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Gagal mengambil data masukan.");
    }

    const daftar = result.data || [];

    if (daftar.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5">Belum ada masukan yang masuk.</td></tr>';
      return;
    }

    tbody.innerHTML = daftar.map((item) => {
      const tanggal = new Date(item.tanggal.replace(" ", "T")).toLocaleString("id-ID", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      return `<tr>
        <td class="col-label">${escapeHtml(item.nama)}</td>
        <td>${item.email ? escapeHtml(item.email) : "&mdash;"}</td>
        <td class="admin-masukan-isi">${escapeHtml(item.isi)}</td>
        <td>${escapeHtml(tanggal)}</td>
        <td><button type="button" class="table-hapus-btn" onclick="hapusMasukan(${Number(item.id)})">Hapus</button></td>
      </tr>`;
    }).join("");
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5">${escapeHtml(error.message || "Gagal memuat masukan.")}</td></tr>`;
  }
}

async function hapusMasukan(id) {
  if (!confirm("Hapus masukan ini?")) return;

  try {
    const csrfToken = await fetch("api/csrf.php", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => data.token)
      .catch(() => "");

    const response = await fetch("api/masukan.php", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      body: JSON.stringify({ id: Number(id), csrf_token: csrfToken }),
    });
    const result = await response.json();

    if (response.status === 401) {
      window.location.href = "login.html";
      return;
    }

    if (!response.ok || !result.ok) {
      throw new Error(result.message || "Masukan gagal dihapus.");
    }

    tampilkanMasukanAdmin();
  } catch (error) {
    alert(error.message || "Masukan gagal dihapus.");
  }
}

function tampilkanDaftarAkun(username) {
  const tbody = document.getElementById("adminAccountsTable");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td class="col-label">${escapeHtml(username)}</td><td>Admin &middot; sedang login</td></tr>`;
}

function escapeHtml(teks) {
  const div = document.createElement("div");
  div.textContent = teks ?? "";
  return div.innerHTML;
}
