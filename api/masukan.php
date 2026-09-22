<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

function jsonInput(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : $_POST;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = jsonInput();
    $nama = trim((string)($data['nama'] ?? ''));
    $email = trim((string)($data['email'] ?? ''));
    $isi = trim((string)($data['isi'] ?? ''));

    if ($nama === '' || $email === '' || $isi === '') {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Nama, email, dan komentar wajib diisi.']);
        exit;
    }

    if (mb_strlen($nama) > 100 || mb_strlen($email) > 150 || mb_strlen($isi) > 10000) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Data masukan terlalu panjang.']);
        exit;
    }

    if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'Format email tidak valid.']);
        exit;
    }

    $stmt = $pdo->prepare('INSERT INTO masukan (nama, email, isi) VALUES (?, ?, ?)');
    $stmt->execute([$nama, $email !== '' ? $email : null, $isi]);

    echo json_encode(['ok' => true, 'id' => (int)$pdo->lastInsertId()]);
    exit;
}

if ($method === 'GET') {
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Login admin diperlukan.']);
        exit;
    }

    $stmt = $pdo->query('SELECT id, nama, email, isi, dibuat_pada FROM masukan ORDER BY dibuat_pada DESC, id DESC');
    $items = [];
    foreach ($stmt as $row) {
        $items[] = [
            'id' => (int)$row['id'],
            'nama' => $row['nama'],
            'email' => $row['email'],
            'isi' => $row['isi'],
            'tanggal' => $row['dibuat_pada'],
        ];
    }
    echo json_encode(['ok' => true, 'data' => $items]);
    exit;
}

if ($method === 'DELETE') {
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'message' => 'Login admin diperlukan.']);
        exit;
    }

    if (!rambuSoloValidateCsrf()) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'message' => 'Token keamanan tidak valid.']);
        exit;
    }

    $data = jsonInput();
    $id = filter_var($data['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(422);
        echo json_encode(['ok' => false, 'message' => 'ID masukan tidak valid.']);
        exit;
    }

    $stmt = $pdo->prepare('DELETE FROM masukan WHERE id = ?');
    $stmt->execute([$id]);
    echo json_encode(['ok' => true, 'deleted' => $stmt->rowCount() > 0]);
    exit;
}

http_response_code(405);
echo json_encode(['ok' => false, 'message' => 'Method tidak diizinkan.']);
