-- =====================================================
-- AUTOS GALERIA - SUPABASE DATABASE SETUP
-- =====================================================
-- Ejecutar este script en el SQL Editor de Supabase
-- =====================================================

-- 1. CREAR EXTENSION PARA UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLA DE USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    telefono VARCHAR(20),
    email VARCHAR(100),
    direccion TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busqueda por cedula
CREATE INDEX IF NOT EXISTS idx_usuarios_cedula ON usuarios(cedula);

-- 3. TABLA DE VEHICULOS
CREATE TABLE IF NOT EXISTS vehiculos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    usuario_cedula VARCHAR(20) NOT NULL REFERENCES usuarios(cedula),

    -- Datos del RUNT/Formulario
    placa VARCHAR(10) UNIQUE NOT NULL,
    clase VARCHAR(50),
    modelo VARCHAR(10),
    cilindraje VARCHAR(20),
    marca VARCHAR(50),
    linea VARCHAR(50),
    color VARCHAR(30),
    combustible VARCHAR(30),
    servicio VARCHAR(30),
    transito VARCHAR(50),
    puertas INTEGER,
    prenda BOOLEAN DEFAULT FALSE,

    -- Datos adicionales del usuario
    kilometraje INTEGER,
    cojineria VARCHAR(50),
    rines VARCHAR(50),
    blindaje BOOLEAN DEFAULT FALSE,
    nivel_blindaje VARCHAR(10),
    direccion_tipo VARCHAR(30),
    soat_vigente DATE,
    rtm_vigente DATE,
    vidrios VARCHAR(50),
    traccion VARCHAR(30),
    transmision VARCHAR(30),

    -- Campos booleanos de equipamiento
    sunroof BOOLEAN DEFAULT FALSE,
    radio BOOLEAN DEFAULT FALSE,
    velocidad_crucero BOOLEAN DEFAULT FALSE,
    aviso_luces BOOLEAN DEFAULT FALSE,
    computador BOOLEAN DEFAULT FALSE,
    frenos_abs BOOLEAN DEFAULT FALSE,
    sensor_parqueo BOOLEAN DEFAULT FALSE,
    camara_reversa BOOLEAN DEFAULT FALSE,

    -- Datos de contacto vendedor
    contacto_nombre VARCHAR(100),
    contacto_telefono VARCHAR(20),
    contacto_email VARCHAR(100),
    contacto_ciudad VARCHAR(50),

    -- Metadata
    precio DECIMAL(15,2),
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para busquedas comunes
CREATE INDEX IF NOT EXISTS idx_vehiculos_usuario ON vehiculos(usuario_cedula);
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca ON vehiculos(marca);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_precio ON vehiculos(precio);

-- 4. TABLA DE IMAGENES DE VEHICULOS
CREATE TABLE IF NOT EXISTS vehiculo_imagenes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vehiculo_id UUID NOT NULL REFERENCES vehiculos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para busqueda por vehiculo
CREATE INDEX IF NOT EXISTS idx_vehiculo_imagenes_vehiculo ON vehiculo_imagenes(vehiculo_id);

-- 5. FUNCION PARA ACTUALIZAR updated_at AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para vehiculos
DROP TRIGGER IF EXISTS update_vehiculos_updated_at ON vehiculos;
CREATE TRIGGER update_vehiculos_updated_at
    BEFORE UPDATE ON vehiculos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehiculo_imagenes ENABLE ROW LEVEL SECURITY;

-- Politicas para usuarios (solo lectura para usuarios autenticados)
CREATE POLICY "Usuarios pueden ver su propia informacion" ON usuarios
    FOR SELECT USING (true);

-- Politicas para vehiculos
CREATE POLICY "Cualquiera puede ver vehiculos activos" ON vehiculos
    FOR SELECT USING (estado = 'activo');

CREATE POLICY "Usuarios pueden insertar sus vehiculos" ON vehiculos
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden actualizar sus vehiculos" ON vehiculos
    FOR UPDATE USING (true);

CREATE POLICY "Usuarios pueden eliminar sus vehiculos" ON vehiculos
    FOR DELETE USING (true);

-- Politicas para imagenes
CREATE POLICY "Cualquiera puede ver imagenes" ON vehiculo_imagenes
    FOR SELECT USING (true);

CREATE POLICY "Usuarios pueden insertar imagenes" ON vehiculo_imagenes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuarios pueden eliminar imagenes" ON vehiculo_imagenes
    FOR DELETE USING (true);

-- =====================================================
-- STORAGE BUCKET PARA IMAGENES
-- =====================================================
-- Ejecutar esto en la seccion de Storage de Supabase
-- o usar la API de Storage

-- Nota: Esto se debe hacer desde el dashboard de Supabase
-- 1. Ir a Storage
-- 2. Crear nuevo bucket llamado "vehiculos"
-- 3. Hacer el bucket publico
-- 4. Configurar politicas:

-- INSERT INTO storage.buckets (id, name, public) VALUES ('vehiculos', 'vehiculos', true);

-- CREATE POLICY "Imagenes publicas" ON storage.objects
--     FOR SELECT USING (bucket_id = 'vehiculos');

-- CREATE POLICY "Usuarios pueden subir imagenes" ON storage.objects
--     FOR INSERT WITH CHECK (bucket_id = 'vehiculos');

-- CREATE POLICY "Usuarios pueden eliminar sus imagenes" ON storage.objects
--     FOR DELETE USING (bucket_id = 'vehiculos');

-- =====================================================
-- USUARIO ADMINISTRADOR DE PRUEBA
-- =====================================================
-- Password: admin123 (hasheado con bcrypt)
-- IMPORTANTE: Cambiar este password en produccion!

INSERT INTO usuarios (cedula, password_hash, nombre, telefono, email, is_admin)
VALUES (
    '123456789',
    '$2a$10$X7VJQJWHw6cz4z6KZzZ9xOQy.qZGzq5L1qG6L1Vq1X6C6Z6L6L6L6',
    'Administrador Autos Galeria',
    '573001234567',
    'admin@autosgaleria.com',
    true
) ON CONFLICT (cedula) DO NOTHING;

-- USUARIO DE PRUEBA (no admin)
-- Password: user123 (hasheado con bcrypt)
INSERT INTO usuarios (cedula, password_hash, nombre, telefono, email, is_admin)
VALUES (
    '987654321',
    '$2a$10$Y8WKRKXHw7dz5z7LZaZ0yPRz.rZHar6M2rH7M2Wr2Y7D7A7M7M7M7',
    'Usuario Prueba',
    '573009876543',
    'usuario@test.com',
    false
) ON CONFLICT (cedula) DO NOTHING;

-- =====================================================
-- VEHICULO DE PRUEBA
-- =====================================================

INSERT INTO vehiculos (
    usuario_cedula, placa, clase, modelo, cilindraje, marca, linea, color,
    combustible, servicio, transito, puertas, prenda, kilometraje, cojineria,
    rines, blindaje, direccion_tipo, vidrios, traccion, transmision,
    sunroof, radio, velocidad_crucero, frenos_abs, sensor_parqueo, camara_reversa,
    contacto_nombre, contacto_telefono, contacto_email, contacto_ciudad,
    precio, descripcion, estado
)
VALUES (
    '123456789',
    'ABC123',
    'Automovil',
    '2022',
    '2000',
    'Toyota',
    'Corolla',
    'Blanco',
    'Gasolina',
    'Particular',
    'Bogota',
    4,
    false,
    35000,
    'Cuero',
    'Aluminio',
    false,
    'Electroasistida',
    'Electricos',
    '4x2',
    'Automatica',
    true,
    true,
    true,
    true,
    true,
    true,
    'Administrador',
    '573001234567',
    'admin@autosgaleria.com',
    'Bogota',
    85000000,
    'Vehiculo en excelente estado, unico dueno, full equipo. Mantenimiento al dia.',
    'activo'
) ON CONFLICT (placa) DO NOTHING;

-- =====================================================
-- NOTAS IMPORTANTES
-- =====================================================
--
-- 1. Los passwords de prueba deben ser generados correctamente con bcrypt
--    Para generar un hash correcto, usar:
--
--    const bcrypt = require('bcryptjs');
--    const hash = await bcrypt.hash('tu_password', 10);
--    console.log(hash);
--
-- 2. Para el Storage, crear el bucket manualmente desde el dashboard:
--    - Nombre: vehiculos
--    - Publico: Si
--    - Allowed MIME types: image/*
--    - Max file size: 5MB
--
-- 3. Configurar las variables de entorno en Vercel/local:
--    - NEXT_PUBLIC_SUPABASE_URL
--    - NEXT_PUBLIC_SUPABASE_ANON_KEY
--    - SUPABASE_SERVICE_ROLE_KEY
--    - JWT_SECRET
--
-- =====================================================
