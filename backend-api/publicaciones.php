<?php
// ============================================
// EquiRed - API de Publicaciones (Feed Social)
// ============================================
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        getPublicaciones();
        break;
    case 'POST':
        switch ($action) {
            case 'create':
                createPublicacion();
                break;
            case 'like':
                toggleLike();
                break;
            case 'comment':
                addComment();
                break;
            default:
                sendError('Acción no válida', 400);
        }
        break;
    case 'DELETE':
        deletePublicacion();
        break;
    default:
        sendError('Método no permitido', 405);
}

/**
 * Obtener publicaciones del feed
 */
function getPublicaciones() {
    $db = getConnection();
    $page = max(1, intval($_GET['page'] ?? 1));
    $limit = 10;
    $offset = ($page - 1) * $limit;
    $userId = $_SESSION['user_id'] ?? 0;

    $stmt = $db->prepare('
        SELECT 
            p.id,
            p.contenido,
            p.imagen_url,
            p.fecha_creacion,
            u.id AS autor_id,
            u.nombre AS autor_nombre,
            u.avatar_url AS autor_avatar,
            u.tipo_usuario AS autor_tipo,
            (SELECT COUNT(*) FROM likes WHERE publicacion_id = p.id) AS total_likes,
            (SELECT COUNT(*) FROM comentarios WHERE publicacion_id = p.id) AS total_comentarios,
            (SELECT COUNT(*) FROM likes WHERE publicacion_id = p.id AND usuario_id = ?) AS user_liked
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        ORDER BY p.fecha_creacion DESC
        LIMIT ? OFFSET ?
    ');
    $stmt->execute([$userId, $limit, $offset]);
    $publicaciones = $stmt->fetchAll();

    // Obtener comentarios para cada publicación
    foreach ($publicaciones as &$pub) {
        $stmtC = $db->prepare('
            SELECT c.id, c.contenido, c.fecha_creacion, u.nombre AS autor_nombre, u.avatar_url AS autor_avatar
            FROM comentarios c
            JOIN usuarios u ON c.usuario_id = u.id
            WHERE c.publicacion_id = ?
            ORDER BY c.fecha_creacion ASC
            LIMIT 5
        ');
        $stmtC->execute([$pub['id']]);
        $pub['comentarios'] = $stmtC->fetchAll();
        $pub['user_liked'] = (bool)$pub['user_liked'];
    }

    // Total de publicaciones
    $total = $db->query('SELECT COUNT(*) FROM publicaciones')->fetchColumn();

    sendResponse([
        'publicaciones' => $publicaciones,
        'total' => intval($total),
        'page' => $page,
        'has_more' => ($offset + $limit) < $total
    ]);
}

/**
 * Crear nueva publicación
 */
function createPublicacion() {
    $userId = requireAuth();
    $data = getBody();
    
    $contenido = trim($data['contenido'] ?? '');
    $imagenUrl = trim($data['imagen_url'] ?? '');

    if (empty($contenido)) {
        sendError('El contenido de la publicación no puede estar vacío.');
    }

    $db = getConnection();
    $stmt = $db->prepare('INSERT INTO publicaciones (usuario_id, contenido, imagen_url) VALUES (?, ?, ?)');
    $stmt->execute([$userId, $contenido, $imagenUrl ?: null]);

    $pubId = $db->lastInsertId();

    // Devolver la publicación creada
    $stmt = $db->prepare('
        SELECT p.*, u.nombre AS autor_nombre, u.avatar_url AS autor_avatar, u.tipo_usuario AS autor_tipo
        FROM publicaciones p
        JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.id = ?
    ');
    $stmt->execute([$pubId]);
    $pub = $stmt->fetch();
    $pub['total_likes'] = 0;
    $pub['total_comentarios'] = 0;
    $pub['comentarios'] = [];
    $pub['user_liked'] = false;

    sendResponse($pub, 201);
}

/**
 * Dar/quitar like a una publicación
 */
function toggleLike() {
    $userId = requireAuth();
    $data = getBody();
    $pubId = intval($data['publicacion_id'] ?? 0);

    if ($pubId <= 0) {
        sendError('ID de publicación no válido.');
    }

    $db = getConnection();

    // Verificar si ya dio like
    $stmt = $db->prepare('SELECT id FROM likes WHERE publicacion_id = ? AND usuario_id = ?');
    $stmt->execute([$pubId, $userId]);
    $existing = $stmt->fetch();

    if ($existing) {
        // Quitar like
        $db->prepare('DELETE FROM likes WHERE publicacion_id = ? AND usuario_id = ?')->execute([$pubId, $userId]);
        $liked = false;
    } else {
        // Dar like
        $db->prepare('INSERT INTO likes (publicacion_id, usuario_id) VALUES (?, ?)')->execute([$pubId, $userId]);
        $liked = true;
    }

    // Contar likes totales
    $total = $db->prepare('SELECT COUNT(*) FROM likes WHERE publicacion_id = ?');
    $total->execute([$pubId]);

    sendResponse([
        'liked' => $liked,
        'total_likes' => intval($total->fetchColumn())
    ]);
}

/**
 * Agregar comentario a una publicación
 */
function addComment() {
    $userId = requireAuth();
    $data = getBody();
    $pubId = intval($data['publicacion_id'] ?? 0);
    $contenido = trim($data['contenido'] ?? '');

    if ($pubId <= 0) {
        sendError('ID de publicación no válido.');
    }
    if (empty($contenido)) {
        sendError('El comentario no puede estar vacío.');
    }

    $db = getConnection();
    $stmt = $db->prepare('INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES (?, ?, ?)');
    $stmt->execute([$pubId, $userId, $contenido]);

    $commentId = $db->lastInsertId();

    $stmt = $db->prepare('
        SELECT c.id, c.contenido, c.fecha_creacion, u.nombre AS autor_nombre, u.avatar_url AS autor_avatar
        FROM comentarios c
        JOIN usuarios u ON c.usuario_id = u.id
        WHERE c.id = ?
    ');
    $stmt->execute([$commentId]);

    sendResponse($stmt->fetch(), 201);
}

/**
 * Eliminar publicación propia
 */
function deletePublicacion() {
    $userId = requireAuth();
    $data = getBody();
    $pubId = intval($data['id'] ?? $_GET['id'] ?? 0);

    if ($pubId <= 0) {
        sendError('ID de publicación no válido.');
    }

    $db = getConnection();
    $stmt = $db->prepare('DELETE FROM publicaciones WHERE id = ? AND usuario_id = ?');
    $stmt->execute([$pubId, $userId]);

    if ($stmt->rowCount() === 0) {
        sendError('Publicación no encontrada o no tienes permiso para eliminarla.', 404);
    }

    sendResponse(['message' => 'Publicación eliminada correctamente.']);
}
