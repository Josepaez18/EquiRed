<?php
// ============================================
// EquiRed - API de Autenticación
// ============================================
require_once 'config.php';

$action = $_GET['action'] ?? '';

switch ($action) {
    case 'register':
        register();
        break;
    case 'login':
        login();
        break;
    case 'logout':
        logout();
        break;
    case 'session':
        checkSession();
        break;
    default:
        sendError('Acción no válida', 400);
}

/**
 * Registrar nuevo usuario
 */
function register() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Método no permitido', 405);
    }

    $data = getBody();
    
    $nombre = trim($data['nombre'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $confirm = $data['confirm_password'] ?? '';
    $tipo = $data['tipo_usuario'] ?? 'beneficiario';

    // Validaciones
    if (empty($nombre) || empty($email) || empty($password)) {
        sendError('Todos los campos son obligatorios.');
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        sendError('El correo electrónico no es válido.');
    }
    if (strlen($password) < 6) {
        sendError('La contraseña debe tener al menos 6 caracteres.');
    }
    if ($password !== $confirm) {
        sendError('Las contraseñas no coinciden.');
    }
    if (!in_array($tipo, ['beneficiario', 'empresa', 'profesional', 'donante'])) {
        sendError('Tipo de usuario no válido.');
    }

    $db = getConnection();

    // Verificar si el email ya existe
    $stmt = $db->prepare('SELECT id FROM usuarios WHERE email = ?');
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        sendError('Ya existe una cuenta con este correo electrónico.');
    }

    // Crear usuario
    $hash = password_hash($password, PASSWORD_BCRYPT);
    $stmt = $db->prepare('INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?)');
    $stmt->execute([$nombre, $email, $hash, $tipo]);

    $userId = $db->lastInsertId();

    // Iniciar sesión automáticamente
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_nombre'] = $nombre;
    $_SESSION['user_email'] = $email;
    $_SESSION['user_tipo'] = $tipo;

    sendResponse([
        'id' => $userId,
        'nombre' => $nombre,
        'email' => $email,
        'tipo_usuario' => $tipo,
        'message' => '¡Registro exitoso! Bienvenido/a a EquiRed.'
    ], 201);
}

/**
 * Iniciar sesión
 */
function login() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendError('Método no permitido', 405);
    }

    $data = getBody();
    
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        sendError('Correo y contraseña son obligatorios.');
    }

    $db = getConnection();
    $stmt = $db->prepare('SELECT id, nombre, email, password_hash, tipo_usuario FROM usuarios WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password_hash'])) {
        sendError('Correo o contraseña incorrectos.');
    }

    // Crear sesión
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_nombre'] = $user['nombre'];
    $_SESSION['user_email'] = $user['email'];
    $_SESSION['user_tipo'] = $user['tipo_usuario'];

    sendResponse([
        'id' => $user['id'],
        'nombre' => $user['nombre'],
        'email' => $user['email'],
        'tipo_usuario' => $user['tipo_usuario'],
        'message' => '¡Bienvenido/a de vuelta!'
    ]);
}

/**
 * Cerrar sesión
 */
function logout() {
    session_destroy();
    sendResponse(['message' => 'Sesión cerrada correctamente.']);
}

/**
 * Verificar sesión activa
 */
function checkSession() {
    $user = getCurrentUser();
    if ($user) {
        sendResponse($user);
    } else {
        sendError('No hay sesión activa.', 401);
    }
}
