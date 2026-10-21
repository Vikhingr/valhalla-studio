-- Valhalla Studio — Decoraciones de temporada del portafolio
-- Ejecutar UNA vez en el SQL Editor de Supabase.
-- Agrega la columna donde el panel guarda fechas e interruptores de cada decoración.

ALTER TABLE configuracion
  ADD COLUMN IF NOT EXISTS decoraciones JSONB;
