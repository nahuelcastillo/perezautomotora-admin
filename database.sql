-- Schema para la tabla de autos
-- Ejecutar este SQL en tu base de datos D1 de Cloudflare

CREATE TABLE IF NOT EXISTS autos (
  id TEXT PRIMARY KEY,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  año INTEGER NOT NULL,
  precio REAL NOT NULL,
  descripcion TEXT,
  kilometraje INTEGER,
  fotos TEXT DEFAULT '[]',
  createdAt TEXT NOT NULL,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_autos_marca ON autos(marca);
CREATE INDEX IF NOT EXISTS idx_autos_año ON autos(año);
CREATE INDEX IF NOT EXISTS idx_autos_createdAt ON autos(createdAt DESC);
