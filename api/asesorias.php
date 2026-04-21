<?php
// ============================================
// EquiRed - API de Asesorías
// ============================================
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'profesionales') {
            getProfesionales();
        } else {
            getAsesorias();
        }
        break;
    case 'POST':
        switch ($action) {
            case 'request':
                requestAsesoria();
                break;
            case 'update':
                updateAsesoria();
                break;
            default:
                sendError('Acción no válida', 400);
        }
        break;
    default:
        sendError('Método no permitido', 405);
}

/**
 * Obtener profesionales disponibles
 */
function getProfesionales() {
    $db = getConnection();
    $tipo = trim($_GET['tipo'] ?? '');

    $sql = "SELECT id, nombre, bio, avatar_url FROM usuarios WHERE tipo_usuario = 'profesional'";
    $params = [];

    if (!empty($tipo)) {
        // Filtrar por tipo de asesoría que ofrecen (basado en bio)
        if ($tipo === 'psicologica') {
            $sql .= " AND (bio LIKE '%psicólog%' OR bio LIKE '%psicolog%')";
        } elseif ($tipo === 'juridica') {
            $sql .= " AND (bio LIKE '%abogad%' OR bio LIKE '%jurídic%' OR bio LIKE '%juridic%' OR bio LIKE '%derecho%')";
        }
    }

    $sql .= ' ORDER BY nombre ASC';
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    $profesionales = $stmt->fetchAll();

    // Agregar conteo de asesorías completadas
    foreach ($profesionales as &$prof) {
        $stmtCount = $db->prepare("SELECT COUNT(*) FROM asesorias WHERE profesional_id = ? AND estado = 'completada'");
        $stmtCount->execute([$prof['id']]);
        $prof['asesorias_completadas'] = intval($stmtCount->fetchColumn());
    }

    sendResponse($profesionales);
}

/**
 * Obtener asesorías del usuario
 */
function getAsesorias() {
    $userId = requireAuth();
    $db = getConnection();

    // Si es profesional, ver solicitudes recibidas
    if (($_SESSION['user_tipo'] ?? '') === 'profesional') {
        $stmt = $db->prepare('
            SELECT a.*, u.nombre AS solicitante_nombre, u.email AS solicitante_email
            FROM asesorias a
            JOIN usuarios u ON a.solicitante_id = u.id
            WHERE a.profesional_id = ?
            ORDER BY a.fecha_solicitud DESC
        ');
        $stmt->execute([$userId]);
    } else {
        // Ver solicitudes enviadas
        $stmt = $db->prepare('
            SELECT a.*, u.nombre AS profesional_nombre
            FROM asesorias a
            LEFT JOIN usuarios u ON a.profesional_id = u.id
            WHERE a.solicitante_id = ?
            ORDER BY a.fecha_solicitud DESC
        ');
        $stmt->execute([$userId]);
    }

    sendResponse($stmt->fetchAll());
}

/**
 * Solicitar asesoría
 */
function requestAsesoria() {
    $userId = requireAuth();
    $data = getBody();

    $tipo = trim($data['tipo'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '');
    $profesionalId = intval($data['profesional_id'] ?? 0);

    if (!in_array($tipo, ['psicologica', 'juridica'])) {
        sendError('Tipo de asesoría no válido. Debe ser "psicologica" o "juridica".');
    }
    if (empty($descripcion)) {
        sendError('La descripción es obligatoria.');
    }

    $db = getConnection();

    // Verificar que el profesional existe si se especificó
    if ($profesionalId > 0) {
        $stmt = $db->prepare("SELECT id FROM usuarios WHERE id = ? AND tipo_usuario = 'profesional'");
        $stmt->execute([$profesionalId]);
        if (!$stmt->fetch()) {
            sendError('El profesional seleccionado no existe.');
        }
    }

    $stmt = $db->prepare('INSERT INTO asesorias (profesional_id, solicitante_id, tipo, descripcion) VALUES (?, ?, ?, ?)');
    $stmt->execute([
        $profesionalId > 0 ? $profesionalId : null,
        $userId,
        $tipo,
        $descripcion
    ]);

    sendResponse([
        'id' => $db->lastInsertId(),
        'message' => '¡Solicitud de asesoría enviada! Un profesional se pondrá en contacto contigo.'
    ], 201);
}

/**
 * Actualizar estado de asesoría (solo profesionales)
 */
function updateAsesoria() {
    $userId = requireAuth();
    
    if (($_SESSION['user_tipo'] ?? '') !== 'profesional') {
        sendError('Solo los profesionales pueden actualizar el estado de las asesorías.', 403);
    }

    $data = getBody();
    $asesoriaId = intval($data['id'] ?? 0);
    $estado = trim($data['estado'] ?? '');

    if ($asesoriaId <= 0) sendError('ID de asesoría no válido.');
    if (!in_array($estado, ['aceptada', 'completada', 'cancelada'])) {
        sendError('Estado no válido.');
    }

    $db = getConnection();
    $stmt = $db->prepare('UPDATE asesorias SET estado = ? WHERE id = ? AND profesional_id = ?');
    $stmt->execute([$estado, $asesoriaId, $userId]);

    if ($stmt->rowCount() === 0) {
        sendError('Asesoría no encontrada o no tienes permiso.', 404);
    }

    sendResponse(['message' => 'Estado actualizado correctamente.']);
}
