Rambu Solo — koneksi Masukan ke MySQL

1. Pastikan XAMPP Apache dan MySQL aktif.
2. Import database/rambu_solo.sql ke MySQL/phpMyAdmin.
3. Letakkan folder rambu-solo-website ke C:\xampp\htdocs\
4. Buka:
   http://localhost/rambu-solo-website/
5. Login admin menggunakan akun yang ada di database:
   Username: admin-toraja
   Password: ADMIN-torajasmk

Perubahan utama:
- Form masukan mengirim POST ke api/masukan.php.
- Data disimpan ke tabel MySQL `masukan`.
- Panel Admin mengambil data masukan dengan GET dari MySQL.
- Tombol Hapus menghapus data dari MySQL.
- Login admin sekarang diverifikasi oleh database dan PHP session.
- Jangan membuka file HTML dengan double-click (file://). Gunakan localhost agar PHP bisa berjalan.

Jika password MySQL root XAMPP kamu tidak kosong, ubah nilai $pass di api/config.php.
