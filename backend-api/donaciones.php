<?php
// ============================================
// EquiRed - API de Donaciones
// ============================================
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'stats') {
            getStats();
        } else {
            getDonaciones();
        }
        break;
    case 'POST':
        if ($action === 'create') {
            createDonacion();
        } else {
            sendError('Acción no válida', 400);
        }
        break;
    default:
        sendError('Método no permitido', 405);
}

/**
 * Obtener historial de donaciones del usuario
 */
function getDonaciones() {
    $userId = requireAuth();
    $db = getConnection();

    $stmt = $db->prepare('
        SELECT d.*, u.nombre AS donante_nombre
        FROM donaciones d
        JOIN usuarios u ON d.donante_id = u.id
        WHERE d.donante_id = ?
        ORDER BY d.fecha_donacion DESC
    ');
    $stmt->execute([$userId]);

    sendResponse($stmt->fetchAll());
}

/**
 * Estadísticas generales de donaciones
 */
function getStats() {
    $db = getConnection();

    $totalMonto = $db->query('SELECT COALESCE(SUM(monto), 0) FROM donaciones')->fetchColumn();
    $totalDonaciones = $db->query('SELECT COUNT(*) FROM donaciones')->fetchColumn();
    $totalDonantes = $db->query('SELECT COUNT(DISTINCT donante_id) FROM donaciones')->fetchColumn();

    // Donaciones recientes (públicas)
    $recientes = $db->query('
        SELECT d.monto, d.mensaje, d.fecha_donacion, u.nombre AS donante_nombre
        FROM donaciones d
        JOIN usuarios u ON d.donante_id = u.id
        ORDER BY d.fecha_donacion DESC
        LIMIT 5
    ')->fetchAll();

    sendResponse([
        'total_monto' => floatval($totalMonto),
        'total_donaciones' => intval($totalDonaciones),
        'total_donantes' => intval($totalDonantes),
        'recientes' => $recientes
    ]);
}

/**
 * Registrar intención de donación
 */
function createDonacion() {
    $userId = requireAuth();
    $data = getBody();

    $monto = floatval($data['monto'] ?? 0);
    $mensaje = trim($data['mensaje'] ?? '');
    $metodoPago = trim($data['metodo_pago'] ?? 'Transferencia');

    if ($monto <= 0) {
        sendError('El monto debe ser mayor a 0.');
    }
    if ($monto > 100000) {
        sendError('El monto máximo es de $100,000.');
    }

    $db = getConnection();
    $stmt = $db->prepare('INSERT INTO donaciones (donante_id, monto, mensaje, metodo_pago) VALUES (?, ?, ?, ?)');
    $stmt->execute([$userId, $monto, $mensaje, $metodoPago]);

    sendResponse([
        'id' => $db->lastInsertId(),
        'message' => '¡Gracias por tu donación! Tu generosidad hace la diferencia.'
    ], 201);
}
