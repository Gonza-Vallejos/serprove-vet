# MEMORY.md - Memoria del Proyecto Serprove Vet

## Decisiones Arquitecturales

### Tech Stack
- **React 19 + Vite** - Selección por velocidad de desarrollo y HMR
- **json-server** - Backend mock simple para demo sin infraestructura
- **localStorage** - Auth y usuarios guardados localmente (NO para producción)
- **lucide-react** - Iconos, pero verificar nombres antes de usar
- **sonner** - Librería liviana para notificaciones toast

### Por qué NO usar autenticación real (de momento)
- Proyecto es demo/prototipo
- json-server no soporta auth nativamente
- localStorage es suficiente para el caso de uso actual
- Evitar complejidad prematura

### Estructura de Datos
- Productos con campos: name, description, category, laboratorio, price, stock, featured, image
- Settings global para toda la config del sitio
- Categorías separadas para permitir filtros

---

## Errores y Problemas Encontrados

### Iconos de lucide-react que NO existen ❌
```
Instagram ❌ - No existe
Facebook ❌ - No existe  
Twitter ❌ - No existe
ShoppingCart ❌ - No existe
WhatsApp ❌ - No existe
CheckCircle ❌ - No existe
```

**Solución:** Usar SVGs inline para iconos de redes sociales o verificar exports disponibles.

### Puertos en uso
- Vite usa 5173 por defecto
- json-server usa 3001
- Si están en uso, los procesos anteriores siguen corriendo

**Solución:**
```bash
lsof -ti:3001,5173,5174 | xargs kill -9
```

### Hot reload no funciona bien
- A veces los cambios no se reflejan
- El servidor se detiene por timeout

**Solución:** Reiniciar el servidor periódicamente o usar `lsof` para matar procesos huerfanos.

---

## Decisiones de Diseño

### Colores y Estilos
- Color primario configurable desde settings (`--color-primary`)
- Sistema de badges para estados: Nuevo (verde), Oferta (naranja), Popular (amarillo)
- Stock visual: Verde (OK), Amarillo (≤5), Rojo (Agotado)

### UX del Admin
- Tab-based navigation para separar productos, categorías y settings
- Filtro de búsqueda en productos
- Modal para editar productos
- Toasts para feedback de acciones

### Catálogo Público
- Filtros por categoría con contadores
- Ordenamiento: precio (asc/desc), nombre, stock
- Tarjetas clickeables que llevan a detail
- Badges de estado visibles

---

## Lecciones Aprendidas

### 1. Siempre verificar iconos de librerías
Antes de usar un icono, verificar que exista. Error común: asumir que `Instagram` o `WhatsApp` existen.

### 2. Puertos en conflicto
En desarrollo local, los puertos quedan ocupados. Usar `lsof` para encontrar y matar procesos.

### 3. Build antes de commit
Siempre correr `npm run build` para verificar que no haya errores de compilación.

### 4. Imágenes en base64
Para demo sin backend, las imágenes se guardan como base64 en el campo `image`. Limitación: ~5MB por imagen.

### 5. Props drilling en React
Este proyecto usa estado local en componentes. Para escalar, considerar Context API o Zustand.

---

## Pendientes / Known Issues

- [ ] No hay paginación en catálogo (OK para demo, problema si hay 100+ productos)
- [ ] No hay sistema de órdenes/pedidos reales
- [ ] No hay upload real de imágenes (solo base64)
- [ ] No hay backup de db.json
- [ ] No hay tests automatizados

---

## Para Producción (Futuro)

Si este proyecto fuera a producción:
1. Reemplazar json-server por un backend real (Node.js, Supabase, Firebase)
2. Implementar auth con JWT y hash de contraseñas en server
3. Subir imágenes a un bucket (S3, Cloudinary, etc.)
4. Agregar paginación y búsqueda server-side
5. Implementar HTTPS
6. Agregar tests E2E (Playwright)

---

## Changelog de Decisiones

| Fecha | Decisión | Razón |
|-------|-----------|-------|
| Inicio | React + Vite | Velocidad de desarrollo |
| Inicio | json-server | API mock sin backend |
| v1 | lucide-react | Iconos simples |
| v2 | sonner | Notificaciones elegantes |
| v2 | base64 images | Demo sin upload real |
| v3 | localStorage auth | Prototipo nomás |
