# 🚗 Perez Automotora - Sistema de Administración

## 📋 Descripción

Sistema web completo de administración para gestionar el stock de autos de Perez Automotora. Permite:

- ✅ **Subir autos** con datos y múltiples fotos
- ✅ **Revisar stock** completo con detalles de cada vehículo
- ✅ **Gestionar fotos** automáticamente organizadas por auto
- ✅ **Eliminar autos** (y todas sus fotos) con un clic

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 16 + React 19 + Tailwind CSS
- **Backend**: Next.js API Routes (Node.js Runtime en Cloudflare Workers)
- **Base de Datos**: Cloudflare D1 (SQLite distribuido)
- **Almacenamiento**: Cloudflare R2 (Compatible con S3)
- **Hosting**: Cloudflare Workers

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                 # Página principal
│   ├── upload/
│   │   └── page.tsx             # Página para subir autos
│   ├── stock/
│   │   └── page.tsx             # Página para ver el stock
│   └── api/
│       └── autos/
│           ├── create/          # POST - Crear auto con fotos
│           ├── list/            # GET - Listar todos los autos
│           └── delete/[autoId]/ # DELETE - Eliminar auto
├── layout.tsx
├── globals.css
└── favicon.ico

database.sql                      # Schema de D1
SYSTEM_DOCS.md                   # Documentación técnica completa
wrangler.jsonc                   # Configuración de Cloudflare
```

## 🚀 Guía de Inicio Rápido

### 1. **Instalación**

```bash
# Clonar repositorio
git clone <repo-url>
cd perezautomotora-admin

# Instalar dependencias
npm install
```

### 2. **Configurar Cloudflare**

#### a) Crear D1 Database

```bash
# Crear base de datos
wrangler d1 create perezautomotora

# Copiar el database_id que aparece y pegarlo en wrangler.jsonc
# Búscar la línea: "database_id": "YOUR_DATABASE_ID"
```

#### b) Crear R2 Bucket

```bash
# Crear bucket
wrangler r2 bucket create perezautomotora-fotos

# Crear bucket preview para desarrollo
wrangler r2 bucket create perezautomotora-fotos-preview
```

#### c) Inicializar Schema D1

```bash
# Crear tablas en la base de datos
wrangler d1 execute perezautomotora --file database.sql
```

### 3. **Configurar wrangler.jsonc**

Abre `wrangler.jsonc` y reemplaza:

```jsonc
"d1_databases": [
  {
    "binding": "DB",
    "database_name": "perezautomotora",
    "database_id": "AQUI_TU_DATABASE_ID"  // ← Reemplaza con tu ID
  }
]
```

### 4. **Desarrollo Local**

```bash
npm run dev
```

Accede a `http://localhost:3000`

### 5. **Deploy a Producción**

```bash
npm run deploy
```

## 🔍 Cómo Funciona

### Sistema de Identificadores Únicos

Cada auto recibe un **UUID único** al ser creado:

```
Auto: Toyota Corolla
├─ ID: 550e8400-e29b-41d4-a716-446655440000
├─ Datos en D1
└─ Fotos en R2:
   ├─ 550e8400-e29b-41d4-a716-446655440000/0-frontal.jpg
   ├─ 550e8400-e29b-41d4-a716-446655440000/1-interior.jpg
   └─ 550e8400-e29b-41d4-a716-446655440000/2-baul.jpg
```

**Ventaja**: Puedes comparar el `autoId` con el prefijo de las fotos para verificar que están correctamente asociadas.

## 📊 Base de Datos

### Tabla `autos`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | TEXT | UUID único (PK) |
| `marca` | TEXT | Marca del vehículo |
| `modelo` | TEXT | Modelo del vehículo |
| `año` | INTEGER | Año de fabricación |
| `precio` | REAL | Precio en USD |
| `descripcion` | TEXT | Detalles adicionales |
| `kilometraje` | INTEGER | Kilometraje actual |
| `fotos` | TEXT | JSON array con rutas en R2 |
| `createdAt` | TEXT | Fecha de creación |
| `updatedAt` | TEXT | Fecha de última actualización |

## 🌐 Rutas Disponibles

### Frontend

| Ruta | Descripción |
|------|-------------|
| `/` | Panel principal |
| `/upload` | Subir nuevo auto |
| `/stock` | Ver todos los autos |

### API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/autos/create` | Crear auto con fotos |
| GET | `/api/autos/list` | Listar todos los autos |
| DELETE | `/api/autos/delete/[autoId]` | Eliminar auto y sus fotos |

## 📸 Subir Autos

### Formulario (`/upload`)

1. **Datos del Auto**
   - Marca (requerido)
   - Modelo (requerido)
   - Año (requerido)
   - Precio en USD (requerido)
   - Kilometraje
   - Descripción

2. **Fotos**
   - Acepta múltiples archivos de imagen
   - Se suben junto con el auto
   - Se organizan automáticamente por `{autoId}/` en R2

### Proceso Backend

```
POST /api/autos/create
├─ Generar UUID único
├─ Insertar en D1 con UUID
├─ Subir fotos a R2 con estructura: {UUID}/
├─ Actualizar referencias en D1
└─ Responder con UUID y cantidad de fotos
```

## 🔍 Revisar Stock

### Página Stock (`/stock`)

1. **Lista de Autos**
   - Muestra todos los autos ordenados por fecha
   - Click para ver detalles

2. **Detalles del Auto**
   - Información completa del vehículo
   - ID único (para comparar con fotos)
   - Lista de fotos almacenadas
   - Opción para eliminar

## 🗑️ Eliminar Autos

Al eliminar un auto:

```
DELETE /api/autos/delete/{autoId}
├─ Obtener lista de fotos de D1
├─ Eliminar cada foto de R2
├─ Eliminar registro de D1
└─ Responder OK
```

**Nota**: Todas las fotos con prefijo `{autoId}/` se eliminan automáticamente.

## 🔧 Troubleshooting

### "Error: Base de datos no configurada"

**Solución**: Verifica que:
1. Creaste la D1 database con `wrangler d1 create perezautomotora`
2. El `database_id` está correcto en `wrangler.jsonc`
3. Ejecutaste el schema: `wrangler d1 execute perezautomotora --file database.sql`

### "Error: R2 Bucket no configurado"

**Solución**: Verifica que:
1. Creaste el bucket con `wrangler r2 bucket create perezautomotora-fotos`
2. El nombre del bucket es correcto en `wrangler.jsonc`

### Las fotos no se suben

**Solución**: Verifica que:
1. R2 está configurado correctamente
2. Tienes permisos en Cloudflare
3. Los archivos no superan el límite de R2 (25 MB por archivo)

## 📦 Dependencias

```json
{
  "dependencies": {
    "next": "^16.4.6",
    "react": "19.2.1",
    "react-dom": "19.2.1",
    "@opennextjs/cloudflare": "^1.20.19",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "typescript": "5.9.3",
    "tailwindcss": "4.1.17",
    "wrangler": "^4.168.0"
  }
}
```

## 🎨 Customización

### Cambiar Colores

Edita `src/app/globals.css` o usa las clases Tailwind CSS en los componentes.

### Agregar Más Campos

1. Modifica la tabla `autos` en `database.sql`
2. Actualiza la interfaz `CarData` en `src/app/upload/page.tsx`
3. Agrega campos al formulario HTML
4. Actualiza la API en `src/app/api/autos/create/route.ts`

## 📄 Documentación Completa

Para documentación técnica detallada, consulta [SYSTEM_DOCS.md](SYSTEM_DOCS.md)

## 🔐 Seguridad

- ✅ Los datos se almacenan en D1 (encriptado en tránsito)
- ✅ Las fotos se almacenan en R2 (con control de acceso)
- ✅ Los UUIDs son únicos e imposibles de predecir
- ⚠️ Implementa autenticación si es necesario

## 📞 Soporte

Para problemas o sugerencias, contacta con el equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 26 de Noviembre de 2026
