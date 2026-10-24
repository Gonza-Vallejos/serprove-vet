# Serprove Vet - POS Desktop (Punto de Venta de Escritorio)

Sistema de Punto de Venta (POS) de alto rendimiento para veterinarias y petshops con arquitectura **Offline-First**, sincronización en la nube con **Supabase**, atajos de teclado ergonómicos, lector de código de barras USB y soporte para comandera térmica e integración fiscal con **ARCA (ex-AFIP)**.

---

## 🚀 Características Principales

1. **Arquitectura Offline-First (A prueba de cortes de luz e internet):**
   - Utiliza base de datos local embebida de alta velocidad (**Dexie / IndexedDB**).
   - Registra ventas localmente en menos de 50ms sin depender de la red.
   - Sincroniza automáticamente ventas y descarga productos con **Supabase** en cuanto se detecta conexión a internet.

2. **Lector de Código de Barras USB Integrado:**
   - Detecta automáticamente pistolas lectoras de códigos de barra conectadas por USB sin necesidad de hacer clic en el buscador.
   - Feedback sonoro (beep) instantáneo al escanear.

3. **Caja y Control de Turnos (Arqueo de Caja):**
   - Apertura de turno con ingreso de cambio inicial en efectivo.
   - Cierre de turno con desglose de ventas por método de pago (Efectivo, Débito, Crédito, Transferencia/QR).
   - Arqueo con cálculo automático de sobrante o faltante.

4. **Impresión de Tickets Térmicos (58mm / 80mm):**
   - Formateador de ticket para comandera térmica listo con datos fiscales de la veterinaria.
   - Soporte para impresión nativa mediante **Electron** o impresión web estándar (`window.print()`).

5. **Preparado para Facturación ARCA (ex-AFIP):**
   - Soporta Factura B (Consumidor Final), Factura A (con CUIT) y Comprobante X (Remito de venta interno).
   - Generación de Código QR reglamentario de ARCA/AFIP en los comprobantes fiscales.

---

## ⌨️ Atajos de Teclado del Mostrador

| Tecla | Acción |
| :--- | :--- |
| **`F2`** | Enfocar inmediatamente el buscador de productos |
| **`F4`** | Abrir la pantalla de cobro y finalización de venta |
| **`F9`** | Abrir / Cerrar turno de caja y arqueo |
| **`ESC`** | Cancelar / cerrar modal abierto o vaciar venta actual |

---

## 📦 Comandos de Ejecución

Dentro de la carpeta `app-escritorio`:

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en modo Web para desarrollo rápido (puerto 5174)
npm run dev

# 3. Iniciar como Aplicación de Escritorio con Electron
npm run electron
```

---

## 📁 Estructura del Proyecto

```
app-escritorio/
├── electron/
│   ├── main.js        # Proceso principal de Electron (manejo de ventanas e impresión nativa)
│   └── preload.js     # Puente IPC seguro entre Electron y React
├── src/
│   ├── config/        # Conexión con Supabase Cloud
│   ├── db/            # Base de datos local Offline con Dexie
│   ├── services/      # Motor de sincronización (syncEngine) y facturación (arcaEngine)
│   ├── components/    # Componentes del POS (Header, Catalogo, Carrito, Cobro, Ticket, Caja, Historial)
│   ├── App.jsx        # Estado principal y atajos de teclado
│   └── main.jsx       # Entrada de React
└── package.json
```
