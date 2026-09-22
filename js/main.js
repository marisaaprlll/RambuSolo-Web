// ============================================================
// Rambu Solo — main.js
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  initNavToggle();
  terapkanKontenTersimpan();
});

// ================= PENYIMPANAN KONTEN (edit admin, persisten) =================
// Semua perubahan yang disimpan admin lewat "Simpan" (teks, tabel, data
// kontak) disimpan di localStorage supaya tetap ada walau halaman
// di-refresh atau dibuka lagi nanti di browser yang sama.
const CONTENT_STORE_KEY = "rambuSoloContent";

function getContentStore() {
  try {
    const raw = localStorage.getItem(CONTENT_STORE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveContentStore(store) {
  localStorage.setItem(CONTENT_STORE_KEY, JSON.stringify(store));
}

// Simpan isi HTML sebuah elemen (teks atau tabel) berdasarkan id-nya.
function simpanKontenElemen(id, html) {
  const store = getContentStore();
  store[id] = html;
  saveContentStore(store);
}

// Simpan pasangan teks + link (dipakai untuk data kontak: WA & email).
function simpanKontenTautan(id, teks, href) {
  const store = getContentStore();
  store[id] = { text: teks, href: href };
  saveContentStore(store);
}

// Terapkan semua konten yang sudah pernah disimpan admin ke halaman ini.
// Dipanggil di setiap halaman yang memuat main.js supaya perubahan admin
// langsung terlihat oleh siapa pun yang membuka website di browser ini.
function terapkanKontenTersimpan() {
  const store = getContentStore();
  Object.keys(store).forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;

    const nilai = store[id];
    if (nilai && typeof nilai === "object" && "text" in nilai) {
      el.textContent = nilai.text;
      if (nilai.href) el.setAttribute("href", nilai.href);
    } else if (typeof nilai === "string") {
      el.innerHTML = nilai;
    }
  });
}

/* ---------------- Menu mobile (hamburger) --------------------- */
function initNavToggle() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");
  if (!toggle || !menu) return;

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ================= LOGIN & MODE ADMIN =================
// Sistem login (termasuk akun admin) sekarang ditangani di halaman
// terpisah login.html, dengan data akun tersimpan lewat js/auth.js
// (localStorage). Status login dibaca oleh auth.js -> terapkanTampilanSesi(),
// yang otomatis menampilkan/menyembunyikan elemen ber-class ".admin-only"
// (mis. tombol edit teks & edit kontak di bawah ini) sesuai akun yang login.

// ================= EDIT TEKS (mis. Sejarah, Keunikan, Tradisi) =================
// buttonId opsional: kalau tidak diisi, tombol edit dianggap ada tepat
// setelah elemen ini (perilaku lama). Kalau diisi (dipakai untuk tabel,
// karena tombol tidak bisa diletakkan di dalam struktur <table>), tombol
// dicari lewat id-nya sendiri.
function mulaiEdit(id, buttonId) {
  const el = document.getElementById(id);
  if (!el || el.dataset.editing === "true") return;

  const editBtn = buttonId ? document.getElementById(buttonId) : el.nextElementSibling;
  if (!editBtn) return;

  el.dataset.editing = "true";
  el.dataset.originalHtml = el.innerHTML;
  el.dataset.originalText = normalkanIsiEdit(el.textContent);
  el.setAttribute("contenteditable", "true");
  el.classList.add("editing");
  el.focus();

  editBtn.classList.add("hidden");

  const simpanBtn = document.createElement("button");
  simpanBtn.type = "button";
  simpanBtn.className = "edit-btn edit-btn--save";
  simpanBtn.textContent = "Simpan";
  simpanBtn.onclick = () => selesaiEdit(id, true, buttonId);

  const batalBtn = document.createElement("button");
  batalBtn.type = "button";
  batalBtn.className = "edit-btn edit-btn--cancel";
  batalBtn.textContent = "Batal";
  batalBtn.onclick = () => selesaiEdit(id, false, buttonId);

  editBtn.insertAdjacentElement("afterend", batalBtn);
  editBtn.insertAdjacentElement("afterend", simpanBtn);
}

function selesaiEdit(id, simpan, buttonId) {
  const el = document.getElementById(id);

  if (!simpan) {
    el.innerHTML = el.dataset.originalHtml;
  } else {
    if (normalkanIsiEdit(el.textContent) === el.dataset.originalText) {
      alert("Data tidak dapat diperbarui karena isinya masih sama seperti sebelumnya.");
    } else {
      simpanKontenElemen(id, el.innerHTML);
    }
  }

  el.removeAttribute("contenteditable");
  el.classList.remove("editing");
  el.dataset.editing = "false";

  const editBtn = buttonId ? document.getElementById(buttonId) : el.nextElementSibling;
  const simpanBtn = editBtn.nextElementSibling;
  const batalBtn = simpanBtn ? simpanBtn.nextElementSibling : null;
  if (simpanBtn) simpanBtn.remove();
  if (batalBtn) batalBtn.remove();
  editBtn.classList.remove("hidden");
}

function normalkanIsiEdit(isi) {
  return (isi || "").replace(/\s+/g, " ").trim();
}

// ================= EDIT TABEL (Sejarah, Keunikan, Tradisi) =================
// Membuat seluruh isi <tbody> sebuah tabel bisa diedit langsung di
// browser (klik dua kali di sel lalu ketik), lalu tersimpan permanen
// lewat CONTENT_STORE_KEY seperti teks biasa.
function mulaiEditTabel(tbodyId, buttonId) {
  mulaiEdit(tbodyId, buttonId);
}

function selesaiEditTabel(tbodyId, simpan, buttonId) {
  selesaiEdit(tbodyId, simpan, buttonId);
}

// ================= EDIT DATA KONTAK (tampilan sesi ini saja) =================
function bukaEditKontak() {
  document.getElementById("inputLokasiTeks").value = document.getElementById("kontakLokasiLink").textContent.trim();
  document.getElementById("inputLokasiUrl").value = document.getElementById("kontakLokasiLink").getAttribute("href");

  document.getElementById("inputWa").value = document.getElementById("kontakWaLink").textContent.trim();

  document.getElementById("inputInstagramTeks").value = document.getElementById("kontakInstagramLink").textContent.trim();
  document.getElementById("inputInstagramUrl").value = document.getElementById("kontakInstagramLink").getAttribute("href");

  document.getElementById("inputYoutubeTeks").value = document.getElementById("kontakYoutubeLink").textContent.trim();
  document.getElementById("inputYoutubeUrl").value = document.getElementById("kontakYoutubeLink").getAttribute("href");

  document.getElementById("inputEmail").value = document.getElementById("kontakEmailLink").textContent.trim();

  document.getElementById("editKontakBox").classList.remove("hidden");
}

function tutupEditKontak() {
  const box = document.getElementById("editKontakBox");
  if (box) box.classList.add("hidden");
}

function simpanKontak() {
  const lokasiTeks = document.getElementById("inputLokasiTeks").value.trim();
  const lokasiUrl = document.getElementById("inputLokasiUrl").value.trim();
  const wa = document.getElementById("inputWa").value.trim();
  const igTeks = document.getElementById("inputInstagramTeks").value.trim();
  const igUrl = document.getElementById("inputInstagramUrl").value.trim();
  const ytTeks = document.getElementById("inputYoutubeTeks").value.trim();
  const ytUrl = document.getElementById("inputYoutubeUrl").value.trim();
  const email = document.getElementById("inputEmail").value.trim();

  const kontakSaatIni = {
    lokasiTeks: document.getElementById("kontakLokasiLink").textContent.trim(),
    lokasiUrl: document.getElementById("kontakLokasiLink").getAttribute("href") || "",
    wa: document.getElementById("kontakWaLink").textContent.trim(),
    igTeks: document.getElementById("kontakInstagramLink").textContent.trim(),
    igUrl: document.getElementById("kontakInstagramLink").getAttribute("href") || "",
    ytTeks: document.getElementById("kontakYoutubeLink").textContent.trim(),
    ytUrl: document.getElementById("kontakYoutubeLink").getAttribute("href") || "",
    email: document.getElementById("kontakEmailLink").textContent.trim(),
  };

  const dataBaru = {
    lokasiTeks: lokasiTeks || kontakSaatIni.lokasiTeks,
    lokasiUrl: lokasiUrl || kontakSaatIni.lokasiUrl,
    wa: wa || kontakSaatIni.wa,
    igTeks: igTeks || kontakSaatIni.igTeks,
    igUrl: igUrl || kontakSaatIni.igUrl,
    ytTeks: ytTeks || kontakSaatIni.ytTeks,
    ytUrl: ytUrl || kontakSaatIni.ytUrl,
    email: email || kontakSaatIni.email,
  };

  if (JSON.stringify(dataBaru) === JSON.stringify(kontakSaatIni)) {
    alert("Tidak ada data yang diperbarui. Isi data masih sama seperti sebelumnya.");
    return;
  }

  if (lokasiTeks !== "" || lokasiUrl !== "") {
    const linkLokasi = document.getElementById("kontakLokasiLink");
    const teksBaru = lokasiTeks !== "" ? lokasiTeks : linkLokasi.textContent.trim();
    const urlBaru = lokasiUrl !== "" ? lokasiUrl : linkLokasi.getAttribute("href");
    linkLokasi.textContent = teksBaru;
    linkLokasi.href = urlBaru;
    simpanKontenTautan("kontakLokasiLink", teksBaru, urlBaru);
  }

  if (wa !== "") {
    const linkWa = document.getElementById("kontakWaLink");
    const hrefWa = "https://wa.me/62" + wa.replace(/^0/, "");
    linkWa.textContent = wa;
    linkWa.href = hrefWa;
    simpanKontenTautan("kontakWaLink", wa, hrefWa);
  }

  if (igTeks !== "" || igUrl !== "") {
    const linkIg = document.getElementById("kontakInstagramLink");
    const teksBaru = igTeks !== "" ? igTeks : linkIg.textContent.trim();
    const urlBaru = igUrl !== "" ? igUrl : linkIg.getAttribute("href");
    linkIg.textContent = teksBaru;
    linkIg.href = urlBaru;
    simpanKontenTautan("kontakInstagramLink", teksBaru, urlBaru);
  }

  if (ytTeks !== "" || ytUrl !== "") {
    const linkYt = document.getElementById("kontakYoutubeLink");
    const teksBaru = ytTeks !== "" ? ytTeks : linkYt.textContent.trim();
    const urlBaru = ytUrl !== "" ? ytUrl : linkYt.getAttribute("href");
    linkYt.textContent = teksBaru;
    linkYt.href = urlBaru;
    simpanKontenTautan("kontakYoutubeLink", teksBaru, urlBaru);
  }

  if (email !== "") {
    const linkEmail = document.getElementById("kontakEmailLink");
    const hrefEmail = "mailto:" + email;
    linkEmail.textContent = email;
    linkEmail.href = hrefEmail;
    simpanKontenTautan("kontakEmailLink", email, hrefEmail);
  }

  tutupEditKontak();
  alert("Data kontak berhasil diperbarui dan tersimpan di browser ini.");
}

// ================= MASUKAN & SARAN =================
// Masukan sekarang disimpan di MySQL melalui api/masukan.php.
// Pengunjung hanya bisa MENAMBAH masukan. Daftar masukan dan hapus
// hanya dapat dilakukan oleh admin melalui session PHP.

function kirimMasukan(event) {
  event.preventDefault();

  const namaEl = document.getElementById("komentarNama");
  const emailEl = document.getElementById("komentarEmail");
  const isiEl = document.getElementById("komentarIsi");
  const status = document.getElementById("feedbackStatus");
  const tombol = event.submitter || document.querySelector('#feedbackForm button[type="submit"]');

  const nama = namaEl.value.trim();
  const emailPengirim = emailEl.value.trim();
  const isi = isiEl.value.trim();

  if (nama === "" || emailPengirim === "" || isi === "") {
    status.textContent = "Nama, email, dan komentar wajib diisi.";
    status.classList.remove("hidden", "feedback-status--ok");
    status.classList.add("feedback-status--error");
    return false;
  }

  if (!emailEl.checkValidity()) {
    status.textContent = "Masukkan alamat email yang valid.";
    status.classList.remove("hidden", "feedback-status--ok");
    status.classList.add("feedback-status--error");
    emailEl.focus();
    return false;
  }

  if (tombol) tombol.disabled = true;
  status.textContent = "Mengirim masukan...";
  status.classList.remove("hidden", "feedback-status--error", "feedback-status--ok");

  fetch("api/masukan.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama, email: emailPengirim, isi }),
  })
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Masukan gagal dikirim.");
      }
      return data;
    })
    .then(() => {
      status.textContent = "Terima kasih! Masukan kamu sudah tersimpan dan akan dibaca langsung oleh admin kami.";
      status.classList.remove("hidden", "feedback-status--error");
      status.classList.add("feedback-status--ok");
      namaEl.value = "";
      emailEl.value = "";
      isiEl.value = "";
    })
    .catch((error) => {
      status.textContent = error.message || "Masukan gagal dikirim. Pastikan website dijalankan melalui XAMPP.";
      status.classList.remove("hidden", "feedback-status--ok");
      status.classList.add("feedback-status--error");
    })
    .finally(() => {
      if (tombol) tombol.disabled = false;
    });

  return false;
}
