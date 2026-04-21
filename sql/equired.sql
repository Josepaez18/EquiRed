-- ============================================
-- EquiRed - Base de Datos
-- Plataforma para la reducción de desigualdades (ODS 10)
-- ============================================

CREATE DATABASE IF NOT EXISTS equired_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE equired_db;

-- ============================================
-- TABLA: usuarios
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('beneficiario', 'empresa', 'profesional', 'donante') NOT NULL DEFAULT 'beneficiario',
    bio TEXT DEFAULT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ============================================
-- TABLA: publicaciones
-- ============================================
CREATE TABLE IF NOT EXISTS publicaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    imagen_url VARCHAR(255) DEFAULT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: likes
-- ============================================
CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (publicacion_id, usuario_id),
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: comentarios
-- ============================================
CREATE TABLE IF NOT EXISTS comentarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (publicacion_id) REFERENCES publicaciones(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: empleos
-- ============================================
CREATE TABLE IF NOT EXISTS empleos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empresa_id INT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    ubicacion VARCHAR(150) DEFAULT NULL,
    tipo_contrato VARCHAR(50) DEFAULT 'Tiempo completo',
    salario VARCHAR(100) DEFAULT NULL,
    requisitos TEXT DEFAULT NULL,
    fecha_publicacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'cerrado') DEFAULT 'activo',
    FOREIGN KEY (empresa_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: postulaciones
-- ============================================
CREATE TABLE IF NOT EXISTS postulaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    empleo_id INT NOT NULL,
    usuario_id INT NOT NULL,
    mensaje TEXT DEFAULT NULL,
    fecha_postulacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'aceptada', 'rechazada') DEFAULT 'pendiente',
    UNIQUE KEY unique_postulacion (empleo_id, usuario_id),
    FOREIGN KEY (empleo_id) REFERENCES empleos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: donaciones
-- ============================================
CREATE TABLE IF NOT EXISTS donaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donante_id INT NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    mensaje TEXT DEFAULT NULL,
    metodo_pago VARCHAR(50) DEFAULT 'Transferencia',
    fecha_donacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donante_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- TABLA: asesorias
-- ============================================
CREATE TABLE IF NOT EXISTS asesorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesional_id INT DEFAULT NULL,
    solicitante_id INT NOT NULL,
    tipo ENUM('psicologica', 'juridica') NOT NULL,
    descripcion TEXT NOT NULL,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'aceptada', 'completada', 'cancelada') DEFAULT 'pendiente',
    FOREIGN KEY (profesional_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (solicitante_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================
-- DATOS DE EJEMPLO
-- ============================================

-- Usuarios de ejemplo (contraseña: "123456" hasheada con bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, tipo_usuario, bio) VALUES
('María González', 'maria@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'beneficiario', 'Defensora de los derechos de la mujer. Creo en la igualdad de oportunidades.'),
('Carlos Rodríguez', 'carlos@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empresa', 'CEO de TechInclusion, empresa comprometida con la diversidad laboral.'),
('Dra. Ana Martínez', 'ana@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesional', 'Psicóloga clínica especializada en apoyo a víctimas de discriminación.'),
('Roberto Sánchez', 'roberto@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'donante', 'Empresario comprometido con causas sociales y la reducción de la desigualdad.'),
('Camila Vargas', 'camila@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'beneficiario', 'Activista LGBTIQ+. Creo en un mundo donde la diversidad sea celebrada.'),
('Lic. Fernando López', 'fernando@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'profesional', 'Abogado especialista en derechos humanos y discriminación laboral.'),
('Inclusión Digital S.A.', 'inclusion@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'empresa', 'Empresa de tecnología que promueve la inclusión digital para todos.'),
('Laura Pérez', 'laura@equired.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'donante', 'Profesora universitaria comprometida con la educación inclusiva.');

-- Publicaciones de ejemplo
INSERT INTO publicaciones (usuario_id, contenido, imagen_url) VALUES
(1, 'Hoy quiero compartir mi historia. Después de años de luchar contra la discriminación por género en mi trabajo, finalmente encontré un lugar donde me valoran por mis habilidades. No se rindan, la igualdad es posible. 💪', NULL),
(5, 'Como persona de la comunidad LGBTIQ+, siempre tuve miedo de ser yo misma en el trabajo. EquiRed me conectó con una empresa donde la diversidad es celebrada, no solo tolerada. Por fin puedo ser auténtica. 🏳️‍🌈', NULL),
(3, 'Desde mi experiencia como psicóloga, puedo decir que el apoyo emocional es fundamental para quienes han sufrido discriminación. Estoy aquí para ayudar. No están solos. ❤️', NULL),
(4, 'Donar no es solo dar dinero, es invertir en un futuro más justo. Hoy contribuí a que 3 jóvenes de comunidades vulnerables accedan a capacitación profesional. ¡Juntos podemos más!', NULL),
(2, 'En TechInclusion creemos que la diversidad impulsa la innovación. Por eso, el 40% de nuestro equipo pertenece a grupos que históricamente han sido excluidos. ¡Y los resultados hablan por sí solos! 🚀', NULL),
(1, 'Quiero recordarles que la discriminación no solo duele, también limita el progreso de toda la sociedad. Cada vez que incluimos a alguien, todos ganamos. 🌍', NULL);

-- Likes de ejemplo
INSERT INTO likes (publicacion_id, usuario_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), (1, 8),
(2, 1), (2, 3), (2, 4), (2, 6), (2, 7),
(3, 1), (3, 2), (3, 4), (3, 5),
(4, 1), (4, 2), (4, 3), (4, 5), (4, 6), (4, 7), (4, 8),
(5, 1), (5, 3), (5, 4), (5, 5), (5, 6),
(6, 2), (6, 3), (6, 4), (6, 5);

-- Comentarios de ejemplo
INSERT INTO comentarios (publicacion_id, usuario_id, contenido) VALUES
(1, 3, '¡Qué inspiradora tu historia, María! La perseverancia siempre da frutos. 💛'),
(1, 5, 'Me identifico mucho contigo. ¡Seguimos luchando juntas! ✊'),
(1, 4, 'Historias como la tuya nos motivan a seguir apoyando.'),
(2, 1, '¡Me alegra mucho leer esto, Camila! Todos merecemos ser auténticos.'),
(3, 1, 'Gracias, Dra. Ana. Su trabajo es invaluable para nuestra comunidad.'),
(4, 8, '¡Excelente iniciativa, Roberto! Yo también quiero contribuir.'),
(5, 6, 'Felicitaciones a TechInclusion. Así se construye un mejor futuro laboral.');

-- Empleos de ejemplo
INSERT INTO empleos (empresa_id, titulo, descripcion, ubicacion, tipo_contrato, salario, requisitos) VALUES
(2, 'Desarrollador/a Web Junior', 'Buscamos un/a desarrollador/a web junior para unirse a nuestro equipo de innovación. No se requiere experiencia previa, ofrecemos capacitación completa. Valoramos la diversidad y la inclusión.', 'Remoto / Ciudad de México', 'Tiempo completo', '$12,000 - $18,000 MXN', 'Conocimientos básicos de HTML, CSS y JavaScript. Ganas de aprender. No se requiere título universitario.'),
(2, 'Diseñador/a UX/UI', 'Buscamos una persona creativa y empática para diseñar experiencias digitales inclusivas y accesibles para todos los usuarios.', 'Remoto', 'Tiempo completo', '$15,000 - $22,000 MXN', 'Conocimiento de herramientas de diseño (Figma, Adobe XD). Sensibilidad hacia la accesibilidad web. Portafolio deseable.'),
(7, 'Asistente Administrativo/a', 'Posición abierta para personas con discapacidad motriz. Ofrecemos espacio de trabajo adaptado y horarios flexibles.', 'Bogotá, Colombia', 'Medio tiempo', '$2,500,000 - $3,500,000 COP', 'Manejo básico de Office. Organización y responsabilidad. Adaptamos el puesto a tus necesidades.'),
(7, 'Community Manager', 'Gestiona nuestras redes sociales y ayuda a difundir mensajes de inclusión y diversidad. Ideal para personas con experiencia en comunidades sociales.', 'Remoto', 'Freelance', '$800 - $1,200 USD', 'Experiencia en redes sociales. Pasión por la inclusión social. Buen manejo de redacción.'),
(2, 'Analista de Datos para Impacto Social', 'Analiza datos para medir el impacto de programas de inclusión social. Apoyamos a personas que están en proceso de reinserción laboral.', 'Híbrido - Lima, Perú', 'Tiempo completo', 'S/ 3,500 - S/ 5,000 PEN', 'Conocimiento de Excel avanzado o herramientas de BI. Interés en el impacto social.');

-- Donaciones de ejemplo
INSERT INTO donaciones (donante_id, monto, mensaje, metodo_pago) VALUES
(4, 500.00, 'Para apoyar programas de capacitación laboral para jóvenes vulnerables.', 'Transferencia'),
(8, 200.00, 'Mi granito de arena para la educación inclusiva.', 'Tarjeta de crédito'),
(4, 1000.00, 'Donación para el programa de asesoría jurídica gratuita.', 'Transferencia'),
(8, 150.00, 'Para que más personas accedan a apoyo psicológico.', 'PayPal');

-- Asesorías de ejemplo
INSERT INTO asesorias (profesional_id, solicitante_id, tipo, descripcion, estado) VALUES
(3, 1, 'psicologica', 'Necesito apoyo emocional después de sufrir discriminación laboral por mi género.', 'completada'),
(6, 5, 'juridica', 'Fui despedida injustamente por mi orientación sexual. Necesito orientación legal.', 'aceptada'),
(3, 5, 'psicologica', 'Ansiedad y estrés por situaciones de acoso laboral.', 'pendiente'),
(6, 1, 'juridica', 'Consulta sobre derechos laborales para personas con discapacidad.', 'pendiente');
