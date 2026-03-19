-- ============================================
-- Script SQL para Supabase - Sistema TISS UTI
-- ============================================
-- Ejecutar este script en: Supabase Dashboard → SQL Editor

-- Tabla principal para almacenar el estado actual de la UTI
CREATE TABLE IF NOT EXISTS uti_state (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beds JSONB NOT NULL DEFAULT '[]',
    turno TEXT NOT NULL DEFAULT 'mañana',
    enfermeros INTEGER NOT NULL DEFAULT 0,
    notas TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Tabla para historial de turnos (opcional - recomendado)
CREATE TABLE IF NOT EXISTS shift_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beds JSONB NOT NULL,
    turno TEXT NOT NULL,
    enfermeros INTEGER NOT NULL,
    notas TEXT DEFAULT '',
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_shift_history_fecha ON shift_history(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_uti_state_updated ON uti_state(updated_at DESC);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- IMPORTANTE: Ajusta según tus necesidades de seguridad

-- Habilitar RLS
ALTER TABLE uti_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_history ENABLE ROW LEVEL SECURITY;

-- OPCIÓN 1: Acceso público (sin autenticación)
-- Usar si la app es interna y no requiere usuarios autenticados
-- ⚠️ CUALQUIERA con la URL puede leer/escribir

CREATE POLICY "Acceso público a uti_state"
    ON uti_state
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Acceso público a shift_history"
    ON shift_history
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- ============================================
-- OPCIÓN 2: Acceso solo para usuarios autenticados
-- ============================================
-- Descomentar estas políticas si usas autenticación de Supabase
-- y comentar las políticas de "Acceso público" arriba

/*
CREATE POLICY "Usuarios autenticados pueden leer uti_state"
    ON uti_state
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden escribir uti_state"
    ON uti_state
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden leer shift_history"
    ON shift_history
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden escribir shift_history"
    ON shift_history
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
*/

-- ============================================
-- Función para mantener solo 1 registro en uti_state
-- ============================================
-- Esto asegura que siempre hay un único estado actual

CREATE OR REPLACE FUNCTION ensure_single_uti_state()
RETURNS TRIGGER AS $$
BEGIN
    -- Al insertar, eliminar otros registros
    IF TG_OP = 'INSERT' THEN
        DELETE FROM uti_state WHERE id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_uti_state
    AFTER INSERT ON uti_state
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_uti_state();

-- ============================================
-- Función para actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_uti_state_updated_at
    BEFORE UPDATE ON uti_state
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Datos iniciales (opcional)
-- ============================================

-- Insertar un registro inicial vacío
INSERT INTO uti_state (beds, turno, enfermeros, notas)
VALUES ('[]', 'mañana', 0, '')
ON CONFLICT DO NOTHING;

-- ============================================
-- Consultas útiles para verificar
-- ============================================

-- Ver estado actual
-- SELECT * FROM uti_state ORDER BY updated_at DESC LIMIT 1;

-- Ver historial de turnos (últimos 10)
-- SELECT * FROM shift_history ORDER BY fecha DESC LIMIT 10;

-- Ver cantidad de registros
-- SELECT COUNT(*) as total_registros FROM shift_history;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
/*
1. RLS (Row Level Security):
   - Las políticas actuales permiten acceso público
   - Si deseas restringir acceso, implementa autenticación
   - Consulta: https://supabase.com/docs/guides/auth

2. JSONB para beds:
   - Permite almacenar estructura compleja de camas
   - Puedes hacer queries sobre el JSON si es necesario
   - Ejemplo: WHERE beds @> '[{"number": 1}]'

3. Historial de turnos:
   - Es opcional pero recomendado para auditoría
   - Puedes implementar cleanup automático de datos antiguos
   - Considera agregar políticas de retención

4. Performance:
   - Los índices ya están creados para las queries más comunes
   - Si la tabla crece mucho, considera particionamiento

5. Backup:
   - Supabase hace backups automáticos
   - Exporta datos críticos periódicamente
   - Mantén localStorage como respaldo local
*/
