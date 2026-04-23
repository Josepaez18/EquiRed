<?php
// ============================================
// EquiRed - API de Empleos
// ============================================
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

switch ($method) {
    case 'GET':
        if ($action === 'detail') {
            getEmpleoDetail();
        } elseif ($action === 'my_posts') {
            getMyEmpleos();
        } elseif ($action === 'applications') {
            getPostulaciones();
        } else {
            getEmpleos();
        }
        break;
    case 'POST':
        switch ($action) {
            case 'create':
                createEmpleo();
                break;
            case 'apply':
                postularse();
                break;
            default:
                sendError('Acción no válida', 400);
        }
        break;
    default:
        sendError('Método no permitido', 405);
}

/**
 * Listar empleos activos
 */
function getEmpleos() {
    $db = getConnection();
    $search = trim($_GET['search'] ?? '');
    $tipo = trim($_GET['tipo'] ?? '');
    
    $sql = '
        SELECT e.*, u.nombre AS empresa_nombre
        FROM empleos e
        JOIN usuarios u ON e.empresa_id = u.id
        WHERE e.estado = "activo"
    ';
    $params = [];

    if (!empty($search)) {
        $sql .= ' AND (e.titulo LIKE ? OR e.descripcion LIKE ? OR e.ubicacion LIKE ?)';
        $searchParam = "%$search%";
        $params[] = $searchParam;
        $params[] = $searchParam;
        $params[] = $searchParam;
    }

    if (!empty($tipo)) {
        $sql .= ' AND e.tipo_contrato = ?';
        $params[] = $tipo;
    }

    $sql .= ' ORDER BY e.fecha_publicacion DESC';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    sendResponse($stmt->fetchAll());
}

/**
 * Detalle de un empleo
 */
function getEmpleoDetail() {
    $id = intval($_GET['id'] ?? 0);
    if ($id <= 0) sendError('ID no válido.');

    $db = getConnection();
    $stmt = $db->prepare('
        SELECT e.*, u.nombre AS empresa_nombre, u.bio AS empresa_bio
        FROM empleos e
        JOIN usuarios u ON e.empresa_id = u.id
        WHERE e.id = ?
    ');
    $stmt->execute([$id]);
    $empleo = $stmt->fetch();

    if (!$empleo) sendError('Empleo no encontrado.', 404);

    // Verificar si el usuario ya se postuló
    $userId = $_SESSION['user_id'] ?? 0;
    if ($userId > 0) {
        $stmtP = $db->prepare('SELECT id, estado FROM postulaciones WHERE empleo_id = ? AND usuario_id = ?');
        $stmtP->execute([$id, $userId]);
        $empleo['postulacion'] = $stmtP->fetch() ?: null;
    }

    sendResponse($empleo);
}

/**
 * Obtener empleos publicados por la empresa actual
 */
function getMyEmpleos() {
    $userId = requireAuth();
    $db = getConnection();
    
    $stmt = $db->prepare('
        SELECT e.*, 
            (SELECT COUNT(*) FROM postulaciones WHERE empleo_id = e.id) AS total_postulaciones
        FROM empleos e
        WHERE e.empresa_id = ?
        ORDER BY e.fecha_publicacion DESC
    ');
    $stmt->execute([$userId]);

    sendResponse($stmt->fetchAll());
}

/**
 * Crear nuevo empleo (solo empresas)
 */
function createEmpleo() {
    $userId = requireAuth();
    
    // Verificar que es una empresa
    if (($_SESSION['user_tipo'] ?? '') !== 'empresa') {
        sendError('Solo las empresas pueden publicar empleos.', 403);
    }

    $data = getBody();
    $titulo = trim($data['titulo'] ?? '');
    $descripcion = trim($data['descripcion'] ?? '');
    $ubicacion = trim($data['ubicacion'] ?? '');
    $tipo_contrato = trim($data['tipo_contrato'] ?? 'Tiempo completo');
    $salario = trim($data['salario'] ?? '');
    $requisitos = trim($data['requisitos'] ?? '');

    if (empty($titulo) || empty($descripcion)) {
        sendError('El título y la descripción son obligatorios.');
    }

    $db = getConnection();
    $stmt = $db->prepare('
        INSERT INTO empleos (empresa_id, titulo, descripcion, ubicacion, tipo_contrato, salario, requisitos)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ');
    $stmt->execute([$userId, $titulo, $descripcion, $ubicacion, $tipo_contrato, $salario, $requisitos]);

    sendResponse(['id' => $db->lastInsertId(), 'message' => 'Empleo publicado exitosamente.'], 201);
}

/**
 * Postularse a un empleo
 */
function postularse() {
    $userId = requireAuth();
    $data = getBody();
    $empleoId = intval($data['empleo_id'] ?? 0);
    $mensaje = trim($data['mensaje'] ?? '');

    if ($empleoId <= 0) sendError('ID de empleo no válido.');

    $db = getConnection();

    // Verificar que el empleo existe y está activo
    $stmt = $db->prepare('SELECT id, empresa_id FROM empleos WHERE id = ? AND estado = "activo"');
    $stmt->execute([$empleoId]);
    $empleo = $stmt->fetch();
    if (!$empleo) sendError('El empleo no existe o ya no está activo.');

    // No postularse a tu propia oferta
    if ($empleo['empresa_id'] == $userId) {
        sendError('No puedes postularte a tu propio empleo.');
    }

    // Verificar si ya se postuló
    $stmt = $db->prepare('SELECT id FROM postulaciones WHERE empleo_id = ? AND usuario_id = ?');
    $stmt->execute([$empleoId, $userId]);
    if ($stmt->fetch()) {
        sendError('Ya te has postulado a este empleo.');
    }

    $stmt = $db->prepare('INSERT INTO postulaciones (empleo_id, usuario_id, mensaje) VALUES (?, ?, ?)');
    $stmt->execute([$empleoId, $userId, $mensaje]);

    sendResponse(['message' => '¡Postulación enviada exitosamente!'], 201);
}

/**
 * Ver postulaciones
 */
function getPostulaciones() {
    $userId = requireAuth();
    $db = getConnection();

    $stmt = $db->prepare('
        SELECT p.*, e.titulo AS empleo_titulo, u.nombre AS empresa_nombre
        FROM postulaciones p
        JOIN empleos e ON p.empleo_id = e.id
        JOIN usuarios u ON e.empresa_id = u.id
        WHERE p.usuario_id = ?
        ORDER BY p.fecha_postulacion DESC
    ');
    $stmt->execute([$userId]);

    sendResponse($stmt->fetchAll());
}
