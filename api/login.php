<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method tidak diizinkan.']);
    exit;
}

if (!rambuSoloValidateCsrf()) {
    http_response_code(403);
    echo json_encode(['ok' => false, 'message' => 'Token keamanan tidak valid. Muat ulang halaman lalu coba lagi.']);
    exit;
}

$now = time();
$lockUntil = (int)($_SESSION['login_locked_until'] ?? 0);
if ($lockUntil > $now) {
    http_response_code(429);
    echo json_encode(['ok' => false, 'message' => 'Terlalu banyak percobaan login. Coba lagi beberapa saat lagi.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true) ?: $_POST;
$username = trim((string)($data['username'] ?? ''));
$password = (string)($data['password'] ?? '');

$stmt = $pdo->prepare('SELECT id, username, password_hash FROM admin WHERE username = ? LIMIT 1');
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    $failures = (int)($_SESSION['login_failures'] ?? 0) + 1;
    $_SESSION['login_failures'] = $failures;

    if ($failures >= 5) {
        $_SESSION['login_locked_until'] = $now + 300;
        $_SESSION['login_failures'] = 0;
        http_response_code(429);
        echo json_encode(['ok' => false, 'message' => 'Terlalu banyak percobaan login. Silakan tunggu 5 menit sebelum mencoba lagi.']);
    } else {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Username atau password salah.']);
    }
    exit;
}

$_SESSION['login_failures'] = 0;
$_SESSION['login_locked_until'] = 0;
session_regenerate_id(true);
$_SESSION['admin_id'] = (int)$admin['id'];
$_SESSION['admin_username'] = $admin['username'];

echo json_encode(['ok' => true, 'username' => $admin['username'], 'isAdmin' => true]);
