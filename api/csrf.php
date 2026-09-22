<?php
require_once __DIR__ . '/config.php';
session_start();
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'ok' => true,
    'token' => rambuSoloCsrfToken(),
]);
