# Serprove Vet - Instrucciones para Agentes

## Descripción del Proyecto
E-commerce de insumos veterinarios construido con React + Vite + json-server. Demo frontend con API REST simulada.

## Comandos de Desarrollo

```bash
npm run dev    # Inicia Vite (puerto 5173) + json-server (puerto 3001) concurrently
npm run build  # Build de producción
npm run lint   # Oxlint
npm run preview # Previsualizar build de producción
```

**Importante:** Si los puertos están en uso, matar procesos con:
```bash
lsof -ti:3001,5173 | xargs kill -9
```

## Arquitectura

- **Frontend:** React 19 + React Router v7 + Vite
- **Backend:** json-server (API REST simulada vía `db.json`)
- **Estilos:** CSS plano con variables CSS (sin Tailwind)
- **Iconos:** lucide-react
- **Notificaciones:** sonner
- **Estado:** React hooks + localStorage para usuarios/sesiones

## Modelo de Datos

Los datos viven en `db.json` con estas colecciones:
- `products` - id, name, description, category, laboratorio, price, stock, featured, image
- `categories` - id, name
- `settings` - configuración global (colores, contacto, redes sociales, banner)

## Errores Comunes a Evitar

1. **Iconos de lucide-react** - Usar nombres exactos. `Instagram`, `Facebook`, `Twitter`, `ShoppingCart` NO existen. Usar SVGs inline para iconos sociales o verificar primero.

2. **Subida de imágenes** - Los productos guardan imágenes como URIs base64 (no hay upload real). El campo de imagen acepta tanto URLs como base64.

3. **Almacenamiento de auth** - Usuarios y sesiones en localStorage como `serprove_users` y `serprove_session`. Admin por defecto: `admin` / `admin123`.

4. **Timeout de sesión** - 30 min por defecto, 7 días si "recordarme" está marcado. La actividad extiende la sesión.

5. **Hash de contraseñas** - Usa SHA-256 vía Web Crypto API con salt `serprove_salt_2024`.

## Rutas

| Path | Componente | Descripción |
|------|------------|-------------|
| `/` | Landing | Catálogo público con filtros |
| `/product/:id` | ProductDetail | Página de detalle del producto |
| `/login` | Login | Login del admin |
| `/register` | Register | Registro de nuevo usuario |
| `/forgot-password` | ForgotPassword | Recuperación de contraseña |
| `/admin` | Admin | Panel de administración (protegido) |

## Cómo Agregar Nuevas Features

- **Nuevos campos en productos:** Agregar al state en Admin.jsx (formularios de add/edit) Y en db.json
- **Nuevos settings:** Agregar al state de settings en Admin.jsx Y al objeto settings en db.json
- **Nuevos iconos:** Verificar que el nombre exista en los exports de lucide-react, o usar SVG inline
- **Toasts:** Importar `{ toast } from 'sonner'` y usar `toast.success()`, `toast.error()`, `toast.warning()`

## Testing en Navegador

Credenciales: `admin` / `admin123`

Todas las rutas de admin requieren autenticación. Acceso sin auth redirige a `/login`.
