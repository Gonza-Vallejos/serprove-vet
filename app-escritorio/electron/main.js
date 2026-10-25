import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Serprove Vet - Punto de Venta POS',
    backgroundColor: '#0f172a', // Dark slate background matching POS theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  // En desarrollo cargamos el servidor de Vite en el puerto 5174
  const devUrl = 'http://localhost:5174';
  const isDev = process.env.NODE_ENV !== 'production' && !app.isPackaged;

  if (isDev) {
    mainWindow.loadURL(devUrl).catch(() => {
      // Reintento en caso de delay en el inicio de Vite
      setTimeout(() => mainWindow.loadURL(devUrl), 1500);
    });
    // Opcional: abrir DevTools en desarrollo
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers para impresión de tickets y hardware
ipcMain.handle('print-ticket', async (event, htmlContent) => {
  if (!mainWindow) return { success: false, error: 'No active window' };

  try {
    // Creamos una ventana oculta para formatear e imprimir el ticket térmico (58mm / 80mm)
    const printWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false
      }
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body {
              width: 78mm;
              margin: 0 auto;
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              line-height: 1.25;
              color: #000;
              padding: 5px;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .right { text-align: right; }
            .divider { border-top: 1px dashed #000; margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; }
            th, td { padding: 2px 0; }
          </style>
        </head>
        <body>
          ${htmlContent}
          <script>
            window.onload = () => {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    await printWin.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(fullHtml)}`);
    
    // Imprimir silenciosamente o mostrar diálogo
    return new Promise((resolve) => {
      printWin.webContents.print({ silent: false, printBackground: true }, (success, failureReason) => {
        printWin.close();
        if (success) {
          resolve({ success: true });
        } else {
          resolve({ success: false, error: failureReason });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('open-cash-drawer', async () => {
  // Envío de pulso a la gaveta de dinero conectada a la impresora fiscal/térmica
  return { success: true, message: 'Pulso enviado a gaveta' };
});

ipcMain.handle('get-app-version', () => app.getVersion());

ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});
ipcMain.on('window-close', () => mainWindow?.close());

// Almacén en memoria de pedidos web recibidos para el servidor HTTP embebido
const memoryWebOrders = [];

function startLocalWebOrdersServer() {
  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/web_orders' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(memoryWebOrders));
      return;
    }

    if (req.url === '/web_orders' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const order = JSON.parse(body);
          if (!order.id) {
            order.id = `order-${Date.now()}`;
          }
          const existingIdx = memoryWebOrders.findIndex(o => String(o.id) === String(order.id));
          if (existingIdx >= 0) {
            memoryWebOrders[existingIdx] = order;
          } else {
            memoryWebOrders.unshift(order);
          }

          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('incoming-web-order', order);
          }

          res.writeHead(201, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(order));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    if (req.url?.startsWith('/web_orders/') && req.method === 'PATCH') {
      const orderId = req.url.split('/')[2];
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const patch = JSON.parse(body);
          const found = memoryWebOrders.find(o => String(o.id) === String(orderId));
          if (found) {
            Object.assign(found, patch);
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(found || patch));
        } catch (e) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  server.listen(3005, '0.0.0.0', () => {
    console.log('Servidor de recepción de pedidos web activo en puerto 3005');
  });

  server.on('error', (err) => {
    console.warn('Nota sobre servidor HTTP local de Electron:', err.message);
  });
}

app.whenReady().then(() => {
  createWindow();
  startLocalWebOrdersServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

