<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

if (!empty($_SESSION['admin_id'])) {
    echo json_encode([
        'ok' => true,
        'loggedIn' => true,
        'username' => $_SESSION['admin_username'],
        'isAdmin' => true
    ]);
} else {
    echo json_encode(['ok' => true, 'loggedIn' => false]);
}
