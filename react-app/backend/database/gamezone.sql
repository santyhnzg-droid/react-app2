DROP DATABASE IF EXISTS gamezone;

CREATE DATABASE gamezone
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE gamezone;

CREATE TABLE roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE permisos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE rol_permisos (
    rol_id INT UNSIGNED NOT NULL,
    permiso_id INT UNSIGNED NOT NULL,

    PRIMARY KEY (rol_id, permiso_id),

    FOREIGN KEY (rol_id)
        REFERENCES roles(id)
        ON DELETE CASCADE,

    FOREIGN KEY (permiso_id)
        REFERENCES permisos(id)
        ON DELETE CASCADE
);

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(20) NOT NULL UNIQUE,
    direccion VARCHAR(120) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol_id INT UNSIGNED NOT NULL,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (rol_id)
        REFERENCES roles(id)
);

CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(80) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    imagen VARCHAR(255),
    categoria_id INT UNSIGNED,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (categoria_id)
        REFERENCES categorias(id)
        ON DELETE SET NULL
);

CREATE TABLE servicios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('activo', 'inactivo') NOT NULL DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE ventas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado ENUM('completada', 'anulada') NOT NULL DEFAULT 'completada',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
);

CREATE TABLE venta_detalles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    venta_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    cantidad INT UNSIGNED NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,

    FOREIGN KEY (venta_id)
        REFERENCES ventas(id)
        ON DELETE CASCADE,

    FOREIGN KEY (producto_id)
        REFERENCES productos(id)
);

INSERT INTO roles (nombre, descripcion)
VALUES
('Administrador', 'Acceso total al sistema'),
('Empleado', 'Acceso limitado a funciones operativas'),
('Cliente', 'Acceso a funciones de cliente');

INSERT INTO permisos (nombre, descripcion)
VALUES
('usuarios.ver', 'Consultar usuarios'),
('usuarios.crear', 'Crear usuarios'),
('usuarios.editar', 'Editar usuarios'),
('usuarios.eliminar', 'Eliminar usuarios'),

('productos.ver', 'Consultar productos'),
('productos.crear', 'Crear productos'),
('productos.editar', 'Editar productos'),
('productos.eliminar', 'Eliminar productos'),

('servicios.ver', 'Consultar servicios'),
('servicios.crear', 'Crear servicios'),
('servicios.editar', 'Editar servicios'),
('servicios.eliminar', 'Eliminar servicios');

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 1, id
FROM permisos;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 2, id
FROM permisos
WHERE nombre IN (
    'usuarios.ver',
    'productos.ver',
    'productos.editar',
    'servicios.ver'
);

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT 3, id
FROM permisos
WHERE nombre IN (
    'productos.ver',
    'servicios.ver'
);

INSERT INTO categorias (nombre, descripcion)
VALUES
('Acción', 'Videojuegos enfocados en acción'),
('Aventura', 'Videojuegos de aventura'),
('Mundo abierto', 'Videojuegos con exploración libre'),
('Supervivencia', 'Videojuegos de supervivencia');

INSERT INTO productos (
    nombre,
    descripcion,
    precio,
    stock,
    imagen,
    categoria_id
)
VALUES
(
    'Ghost of Tsushima',
    'Aventura samurái ambientada en la isla de Tsushima.',
    129900,
    10,
    'ghost.png',
    2
),
(
    'God of War',
    'Kratos se enfrenta a dioses y criaturas en una aventura épica.',
    119900,
    10,
    'Gow.jpg',
    1
),
(
    'Grand Theft Auto V',
    'Explora Los Santos en uno de los mundos abiertos más reconocidos.',
    89900,
    15,
    'gitiey.webp',
    3
),
(
    'The Last of Us',
    'Una historia de supervivencia en un mundo devastado.',
    109900,
    8,
    'thelast.jpg',
    4
),
(
    'Red Dead Redemption 2',
    'Explora el salvaje oeste en una aventura de mundo abierto.',
    129900,
    12,
    'read.jpg',
    3
);

INSERT INTO servicios (
    nombre,
    descripcion,
    precio
)
VALUES
(
    'Soporte técnico',
    'Asistencia relacionada con la plataforma GameZone.',
    0
);