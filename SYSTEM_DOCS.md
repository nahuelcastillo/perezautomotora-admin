# Perez Automotora - Sistema de Administración

## 📋 Descripción General

Sistema de administración para gestionar el stock de autos de Perez Automotora. Permite subir nuevos vehículos con fotos y revisar todo el stock disponible.

## 🏗️ Arquitectura

```
Frontend (Next.js 16)
    ↓
API Routes (Node.js Runtime)
    ↓
├─ D1 Database (Cloudflare) - Datos de autos
└─ R2 Storage (Cloudflare) - Fotos de autos
```

## 🗂️ Estructura de Datos

### Base de Datos D1 - Tabla `autos`

Cada auto en el sistema tiene un **ID único (UUID)** que relaciona los datos con las fotos.

```sql
CREATE TABLE autos (
  id TEXT PRIMARY KEY,              -- UUID único
  marca TEXT NOT NULL,              -- Marca del vehículo
  modelo TEXT NOT NULL,             -- Modelo del vehículo
  año INTEGER NOT NULL,             -- Año de fabricación
  precio REAL NOT NULL,             -- Precio en USD
  descripcion TEXT,                 -- Descripción adicional
  kilometraje INTEGER,              -- Kilometraje actual
  fotos TEXT DEFAULT '[]',          -- JSON array de referencias a R2
  createdAt TEXT NOT NULL,          -- Fecha de creación
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### R2 Storage - Estructura de Fotos

Las fotos se almacenan en R2 con la siguiente estructura:

```
r2://bucket/
├── {autoId}/
│   ├── 0-foto1.jpg
│   ├── 1-foto2.jpg
│   └── 2-foto3.jpg
└── {autoId2}/
    ├── 0-foto1.jpg
    └── 1-foto2.jpg
```

**Ventaja**: El prefijo `{autoId}/` organiza automáticamente todas las fotos de un auto en la misma "carpeta" virtual.

## 🚀 Páginas Disponibles

### 1. **Página Principal** (`/`)
- Panel de control con dos opciones:
  - **Subir Autos**: Formulario para agregar nuevos vehículos
  - **Revisar Stock**: Ver todos los autos en el sistema

### 2. **Subir Autos** (`/upload`)
- Formulario con campos:
  - Marca, Modelo, Año
  - Precio, Kilometraje
  - Descripción
  - Múltiples fotos (upload masivo)
- Al enviar:
  1. Se genera un **UUID único** para el auto
  2. Se guardan los datos en D1
  3. Se suben las fotos a R2 con prefijo `{UUID}/`
  4. Se guarda la referencia de fotos en D1

### 3. **Revisar Stock** (`/stock`)
- Lista de todos los autos en la base de datos
- Al seleccionar un auto:
  - Muestra todos los detalles
  - Muestra el ID único
  - Muestra referencias de fotos
  - Opción para eliminar

## 🔗 Relación Fotos-Datos

Cada auto tiene un **ID único UUID** que actúa como identificador:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "marca": "Toyota",
  "modelo": "Corolla",
  "fotos": [
    "550e8400-e29b-41d4-a716-446655440000/0-frontal.jpg",
    "550e8400-e29b-41d4-a716-446655440000/1-interior.jpg"
  ]
}
```

**Comparación de IDs**: Podés comparar `auto.id` con la parte inicial del path de la foto para relacionarlos.

## 📡 API Routes

### POST `/api/autos/create`
Crea un nuevo auto con fotos.

**Request**: FormData
```
- carData: JSON string con datos del auto
- foto0: File (primera foto)
- foto1: File (segunda foto)
- ...
```

**Response**:
```json
{
  "message": "Auto subido exitosamente",
  "autoId": "550e8400-e29b-41d4-a716-446655440000",
  "fotoCount": 3
}
```

### GET `/api/autos/list`
Obtiene todos los autos.

**Response**:
```json
{
  "autos": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "marca": "Toyota",
      "modelo": "Corolla",
      "año": 2023,
      "precio": 25000,
      "descripcion": "...",
      "kilometraje": 50000,
      "fotos": ["...", "..."],
      "createdAt": "2026-11-26T12:34:22.314Z"
    }
  ]
}
```

### DELETE `/api/autos/delete/[autoId]`
Elimina un auto y todas sus fotos de R2.

**Response**:
```json
{
  "message": "Auto eliminado exitosamente"
}
```

## ⚙️ Configuración Requerida

### 1. **D1 Database**

En tu `wrangler.jsonc`, añade:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "perezautomotora",
      "database_id": "tu-database-id"
    }
  ]
}
```

Luego ejecuta el SQL de `database.sql`:

```bash
wrangler d1 execute perezautomotora --file database.sql
```

### 2. **R2 Bucket**

En tu `wrangler.jsonc`, añade:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "BUCKET",
      "bucket_name": "perezautomotora-fotos",
      "preview_bucket_name": "perezautomotora-fotos-preview"
    }
  ]
}
```

### 3. **Environment Variables**

Asegúrate de tener acceso a:
- `process.env.DB` - Instancia de D1
- `process.env.BUCKET` - Instancia de R2

## 📦 Dependencias

```json
{
  "dependencies": {
    "uuid": "^9.0.0"  // Para generar IDs únicos
  }
}
```

Instala con:
```bash
npm install uuid
```

## 🔄 Flujo de Subida de Auto

```
1. Usuario completa formulario en /upload
   ↓
2. Submit POST a /api/autos/create
   ↓
3. API genera UUID único
   ↓
4. Inserta datos en D1 con ID único
   ↓
5. Sube fotos a R2 con estructura: {UUID}/
   ↓
6. Actualiza fotos JSON en D1
   ↓
7. Responde con UUID al usuario
```

## 🔄 Flujo de Visualización

```
1. Usuario accede a /stock
   ↓
2. Fetch GET /api/autos/list
   ↓
3. API obtiene todos los autos de D1
   ↓
4. API parsea referencias de fotos
   ↓
5. Muestra lista de autos
   ↓
6. Usuario selecciona auto
   ↓
7. Muestra detalles y referencias de fotos
```

## 🧹 Eliminación

Cuando se elimina un auto:
1. Se obtiene lista de fotos de D1
2. Se eliminan todas las fotos de R2
3. Se elimina el registro de D1

**Importante**: El prefijo `{autoId}/` asegura que todas las fotos de un auto se eliminen automáticamente.

## 🚀 Despliegue

```bash
# Desarrollo local
npm run dev

# Build y preview
npm run preview

# Deploy a Cloudflare Workers
npm run deploy
```

## 📝 Notas Importantes

1. **UUID único**: Cada auto recibe un UUID al momento de la creación. No se puede cambiar.
2. **Organización de fotos**: Las fotos se organizan automáticamente por `{autoId}/` en R2.
3. **Comparación de datos**: Comparar `auto.id` con el prefijo del path de las fotos para relacionarlas.
4. **Escalabilidad**: D1 y R2 de Cloudflare escalan automáticamente.

---

**Creado**: 26 de Noviembre de 2026
