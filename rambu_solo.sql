-- ============================================================
-- Rambu Solo — Struktur Database
-- ============================================================
-- Cara memakai file ini lewat CMD (Windows / XAMPP):
--
--   cd C:\xampp\mysql\bin
--   mysql -u root -p < C:\xampp\htdocs\rambu-solo-website\database\rambu_solo.sql
--
-- Kalau password root MySQL masih kosong (bawaan XAMPP),
-- tinggal tekan Enter saat diminta password.
-- ============================================================

CREATE DATABASE IF NOT EXISTS rambu_solo
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE rambu_solo;

-- ------------------------------------------------------------
-- Tabel: admin
-- Menyimpan akun yang boleh masuk ke Panel Admin.
-- Password TIDAK disimpan apa adanya, melainkan dalam bentuk
-- hash bcrypt (dibuat oleh password_hash() di PHP).
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  dibuat_pada   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Tabel: masukan
-- Menyimpan masukan & saran yang dikirim pengunjung lewat
-- halaman masukan.html. Hanya bisa dibaca lewat Panel Admin.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS masukan (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NULL,
  isi         TEXT         NOT NULL,
  dibuat_pada DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_masukan_tanggal (dibuat_pada)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Akun admin awal
-- Username : admin-toraja
-- Password : ADMIN-torajasmk
--
-- Nilai di bawah adalah hash bcrypt dari password tersebut,
-- jadi password aslinya tidak pernah tersimpan di database.
-- Ganti password nanti lewat file api/ganti-password.php
-- ------------------------------------------------------------
INSERT INTO admin (username, password_hash) VALUES
  ('admin-toraja', '$2y$12$QYtWkSNnhd/2CR9o4Lereu2ZE5a9cS5NDgRmderhBvnczKxIhJlge')
ON DUPLICATE KEY UPDATE username = username;

-- Selesai. Cek hasilnya dengan:
--   USE rambu_solo;
--   SHOW TABLES;
--   SELECT id, username, dibuat_pada FROM admin;
