# Rambu Solo Website

Website profil dan panel admin untuk promosi budaya Toraja dengan fitur:
- landing page beranda
- halaman masukan/saran
- login admin
- panel admin untuk melihat dan menghapus masukan
- penyimpanan data di MySQL via PHP API

## Struktur Project

- `index.html` – halaman utama
- `login.html` – halaman login admin
- `admin.html` – panel admin
- `masukan.html` – halaman form masukan
- `api/` – API PHP untuk login, session, logout, dan database
- `css/` – stylesheet
- `js/` – JavaScript frontend
- `images/` – asset gambar
- `rambu_solo.sql` – struktur database dan seed admin

## Persiapan

1. Jalankan XAMPP atau server PHP lokal.
2. Pastikan MySQL aktif.
3. Import file `rambu_solo.sql` ke database MySQL.
4. Akses project melalui browser di localhost.

## Admin Default

- Username: `admin-toraja`
- Password: `ADMIN-torajasmk`

## Catatan

Project ini masih menggunakan setup lokal sederhana untuk keperluan development dan demo.
