# 🚀 INICIO RÁPIDO - 60 Segundos

## 1️⃣ Instalar (ya hecho ✅)
```bash
npm install
```

## 2️⃣ Ejecutar
```bash
npm run dev
```
→ Abre `http://localhost:3000`

## 3️⃣ Probar
1. Click en "Subir Autos"
2. Llena el formulario
3. Sube 2-3 fotos
4. Click "Subir Auto"
5. Copia el ID que aparece
6. Click "Revisar Stock"
7. Verifica que tus fotos tengan ese ID

## 4️⃣ Deploy
```bash
npm run deploy
```

---

## 📌 Archivos Importantes

| Archivo | Qué hace |
|---------|----------|
| `src/app/page.tsx` | Página principal |
| `src/app/upload/page.tsx` | Formulario subir |
| `src/app/stock/page.tsx` | Visor de stock |
| `src/app/api/autos/*` | APIs REST |
| `wrangler.jsonc` | Configuración Cloudflare |
| `database.sql` | Schema D1 |

---

## 🔧 Troubleshooting

**¿Error de base de datos?**
- Verifica que `wrangler.jsonc` tiene el ID correcto: `9c2cb7f7-...`

**¿Las fotos no se suben?**
- Verifica que el bucket R2 está en `wrangler.jsonc`

**¿TypeScript errores?**
- Ejecuta: `npm run build`

**¿Quieres resetear todo?**
```bash
rm .wrangler/state/v3/d1 -r
```

---

## 📊 Estructura Base de Datos

Cada auto tiene:
```json
{
  "id": "uuid-unico",
  "marca": "Toyota",
  "modelo": "Corolla",
  "año": 2023,
  "precio": 25000,
  "fotos": [
    "uuid-unico/0-foto1.jpg",
    "uuid-unico/1-foto2.jpg"
  ]
}
```

**Las fotos siempre comienzan con el ID del auto = Correlación perfecta**

---

## ✅ Validar Configuración

```bash
node validate.js
```

Debe mostrar todo con ✅

---

## 🎨 Customizar

**Cambiar colores primarios:**
Edita `src/app/globals.css` o busca `blue-500` en los componentes

**Agregar campos:**
1. Modifica `database.sql`
2. Actualiza tipos en `src/lib/utils.ts`
3. Agrega input en `src/app/upload/page.tsx`
4. Actualiza API en `src/app/api/autos/create/route.ts`

---

## 🔐 Credenciales

```
D1 ID:     9c2cb7f7-4eeb-4824-81ec-991af035d6c2
D1 Nombre: perez-automotora

R2 Nombre: perez-automotora
R2 URL:    https://965a96d448588b955fd63d8b7c6efc87.r2.cloudflarestorage.com/perez-automotora
```

---

## 📚 Documentación

- 📄 `SYSTEM_DOCS.md` - Detalles técnicos
- 📄 `SETUP.md` - Guía completa
- 📄 `README_RESUMIDO.md` - Resumen visual
- 📄 `VERIFICACION.md` - Checklist

---

**Status**: ✅ LISTO  
**Build**: ✅ EXITOSO  
**Tests**: ✅ PASADOS  
**Deploy**: ✅ LISTO
