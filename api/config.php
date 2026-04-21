<?php
// ============================================
// EquiRed - Configuración de Base de Datos
// ============================================

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Iniciar sesión
session_start();

// Configuración de la base de datos
define('DB_HOST', 'localhost');
define('DB_NAME', 'equired_db');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

/**
 * Obtener conexión PDO a MySQL
 */
function getConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        sendError('Error de conexión a la base de datos: ' . $e->getMessage(), 500);
        exit();
    }
}

/**
 * Enviar respuesta JSON exitosa
 */
function sendResponse($data, $code = 200) {
    http_response_code($code);
    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Enviar respuesta JSON de error
 */
function sendError($message, $code = 400) {
    http_response_code($code);
    echo json_encode([
        'success' => false,
        'error' => $message
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

/**
 * Obtener datos del body (JSON)
 */
function getBody() {
    $body = file_get_contents('php://input');
    return json_decode($body, true) ?? [];
}

/**
 * Verificar que el usuario esté autenticado
 */
function requireAuth() {
    if (!isset($_SESSION['user_id'])) {
        sendError('No autorizado. Inicia sesión.', 401);
    }
    return $_SESSION['user_id'];
}

/**
 * Obtener usuario actual de la sesión
 */
function getCurrentUser() {
    if (!isset($_SESSION['user_id'])) {
        return null;
    }
    return [
        'id' => $_SESSION['user_id'],
        'nombre' => $_SESSION['user_nombre'] ?? '',
        'email' => $_SESSION['user_email'] ?? '',
        'tipo_usuario' => $_SESSION['user_tipo'] ?? ''
    ];
}
