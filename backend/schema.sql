-- ==============================================================================
-- SCRIPT DE BASE DE DATOS PARA NEON (PostgreSQL) - PROYECTO AlojAR
-- Responsables: Chalita y Tate
-- Instrucciones: Copiar todo este código y pegarlo en el "SQL Editor" de Neon.
-- ==============================================================================

-- 1. Tabla de Usuarios (Sirve tanto para Huéspedes como Anfitriones)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL CHECK (rol IN ('huesped', 'anfitrion')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Alojamientos (Publicados por los Anfitriones)
CREATE TABLE IF NOT EXISTS alojamientos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(150) NOT NULL,
    tipo VARCHAR(50), -- Ej: Cabaña, Casa, Departamento
    precio_noche INTEGER NOT NULL,
    capacidad INTEGER NOT NULL,
    habitaciones INTEGER,
    camas INTEGER,
    banos INTEGER,
    servicios TEXT[], -- Arreglo de strings (Ej: '{"Wi-Fi", "Pileta"}')
    imagenes TEXT[], -- Rutas de las imágenes
    estado VARCHAR(20) DEFAULT 'publicado' CHECK (estado IN ('publicado', 'retirado')),
    anfitrion_id INTEGER NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anfitrion FOREIGN KEY (anfitrion_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 3. Tabla de Reservas (Hechas por los Huéspedes)
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    cantidad_huespedes INTEGER NOT NULL,
    precio_total INTEGER NOT NULL,
    mensaje_solicitud TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    huesped_id INTEGER NOT NULL,
    alojamiento_id INTEGER NOT NULL,
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_huesped FOREIGN KEY (huesped_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_alojamiento FOREIGN KEY (alojamiento_id) REFERENCES alojamientos(id) ON DELETE CASCADE
);
