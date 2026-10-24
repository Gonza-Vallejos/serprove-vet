import { db, seedInitialLocalProductsIfEmpty } from '../db/localDb';
import { supabase } from '../config/supabase';

class SyncEngine {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.listeners = new Set();

    // Escucha eventos nativos del navegador / sistema operativo
    window.addEventListener('online', () => this.handleConnectivityChange(true));
    window.addEventListener('offline', () => this.handleConnectivityChange(false));

    // Comprobador periódico de conectividad y sincronización cada 30 segundos
    setInterval(() => {
      this.checkRealConnectivity();
    }, 30000);
  }

  // Notificar a los componentes de React sobre el estado de la conexión
  subscribe(callback) {
    this.listeners.add(callback);
    callback({ isOnline: this.isOnline, isSyncing: this.isSyncing });
    return () => this.listeners.delete(callback);
  }

  notify() {
    for (const listener of this.listeners) {
      listener({ isOnline: this.isOnline, isSyncing: this.isSyncing });
    }
  }

  async handleConnectivityChange(online) {
    this.isOnline = online;
    this.notify();

    if (online) {
      console.log('[SyncEngine] Conexión restablecida. Iniciando sincronización automática...');
      await this.syncAll();
    } else {
      console.warn('[SyncEngine] Conexión perdida. Operando en modo Offline local.');
    }
  }

  // Verifica si realmente hay acceso a internet y a Supabase
  async checkRealConnectivity() {
    if (!navigator.onLine) {
      if (this.isOnline) this.handleConnectivityChange(false);
      return false;
    }

    try {
      // Petición ultraligera con timeout corto (3 seg)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const { error } = await supabase
        .from('categories')
        .select('name', { count: 'exact', head: true })
        .abortSignal(controller.signal);

      clearTimeout(timeoutId);

      const connected = !error;
      if (connected !== this.isOnline) {
        this.handleConnectivityChange(connected);
      }
      return connected;
    } catch {
      if (this.isOnline) this.handleConnectivityChange(false);
      return false;
    }
  }

  // Descarga productos actualizados desde Supabase hacia la base local
  async pullProducts() {
    await seedInitialLocalProductsIfEmpty();

    try {
      const legacy = await db.products.filter(p => String(p.id).startsWith('p-')).toArray();
      if (legacy.length > 0) {
        await db.products.bulkDelete(legacy.map(p => p.id));
      }
    } catch {}

    if (!this.isOnline) {
      return await db.products.toArray();
    }

    try {
      const { data: cloudProducts, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      if (cloudProducts && cloudProducts.length > 0) {
        const localFormatted = cloudProducts.map((p, idx) => ({
          id: p.id,
          name: p.name,
          // Si no tiene código de barra asignado, asignamos uno estándar basado en su índice o ID
          barcode: p.barcode || `779${String(idx + 1).padStart(10, '0')}`,
          category: p.category || 'General',
          laboratorio: p.laboratorio || 'N/A',
          price: Number(p.price) || 0,
          stock: Number(p.stock) || 0,
          image: p.image || '/product.jpg',
          synced_at: new Date().toISOString()
        }));

        await db.products.bulkPut(localFormatted);
        console.log(`[SyncEngine] Sincronizados ${localFormatted.length} productos desde Supabase.`);
      }

      return await db.products.toArray();
    } catch (err) {
      console.warn('[SyncEngine] Supabase no disponible, intentando sincronización con catálogo local:', err.message);
      try {
        const res = await fetch('http://localhost:3001/products');
        if (res.ok) {
          const jsonProds = await res.json();
          const localFormatted = jsonProds.map((p, idx) => ({
            id: String(p.id),
            name: p.name,
            barcode: p.barcode || `779${String(idx + 1).padStart(10, '0')}`,
            category: p.category || 'General',
            laboratorio: p.laboratorio || 'N/A',
            price: Number(p.price) || 0,
            stock: Number(p.stock) || 0,
            image: p.image || '/product.jpg',
            synced_at: new Date().toISOString()
          }));
          await db.products.bulkPut(localFormatted);
          console.log(`[SyncEngine] Sincronizados ${localFormatted.length} productos desde json-server local.`);
        }
      } catch {
        // Si no está corriendo json-server, usa los productos persistidos en Dexie
      }
      return await db.products.toArray();
    }
  }

  // Sube las ventas pendientes acumuladas localmente a Supabase
  async pushPendingSales() {
    if (!this.isOnline || this.isSyncing) return;

    this.isSyncing = true;
    this.notify();

    try {
      const pendingSales = await db.sales
        .where('sync_status')
        .equals('pending')
        .toArray();

      if (pendingSales.length === 0) {
        this.isSyncing = false;
        this.notify();
        return;
      }

      console.log(`[SyncEngine] Subiendo ${pendingSales.length} ventas pendientes a Supabase...`);

      for (const sale of pendingSales) {
        // Obtenemos los ítems de esta venta
        const items = await db.sale_items.where('sale_id').equals(sale.id).toArray();

        // 1. Intentamos insertar la venta en Supabase
        const { error: saleErr } = await supabase.from('sales').upsert({
          id: sale.id,
          sale_number: sale.sale_number,
          total: sale.total,
          subtotal: sale.subtotal,
          discount: sale.discount,
          payment_method: sale.payment_method,
          amount_paid: sale.amount_paid,
          change_amount: sale.change_amount,
          customer_name: sale.customer_name,
          customer_cuit: sale.customer_cuit,
          invoice_type: sale.invoice_type,
          cae: sale.cae,
          created_at: sale.created_at,
          synced_at: new Date().toISOString()
        });

        if (!saleErr) {
          // 2. Insertamos los ítems en Supabase
          if (items.length > 0) {
            await supabase.from('sale_items').upsert(
              items.map(it => ({
                id: it.id,
                sale_id: sale.id,
                product_id: it.product_id,
                product_name: it.product_name,
                quantity: it.quantity,
                unit_price: it.unit_price,
                subtotal: it.subtotal
              }))
            );
          }

          // 3. Descontamos stock en la tabla de Supabase para cada producto
          for (const item of items) {
            try {
              // Intentamos decrementar stock mediante RPC o lectura/escritura
              const { data: currentP } = await supabase
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single();

              if (currentP) {
                const newStock = Math.max(0, (currentP.stock || 0) - item.quantity);
                await supabase
                  .from('products')
                  .update({ stock: newStock })
                  .eq('id', item.product_id);
              }
            } catch (stkErr) {
              console.warn('[SyncEngine] Error actualizando stock en Supabase:', stkErr.message);
            }
          }

          // 4. Marcamos como sincronizado localmente
          await db.sales.update(sale.id, {
            sync_status: 'synced',
            synced_at: new Date().toISOString()
          });

          console.log(`[SyncEngine] Venta ${sale.sale_number} sincronizada con éxito.`);
        } else {
          console.error(`[SyncEngine] Error al sincronizar venta ${sale.sale_number}:`, saleErr.message);
        }
      }
    } catch (err) {
      console.error('[SyncEngine] Excepción durante pushPendingSales:', err);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  // Guarda la venta de manera 100% Offline-First en IndexedDB
  async recordSaleOfflineFirst({
    items,
    paymentMethod,
    amountPaid,
    changeAmount,
    discount = 0,
    customerName = 'Consumidor Final',
    customerCuit = '',
    invoiceType = 'X',
    shiftId = null
  }) {
    const saleId = crypto.randomUUID ? crypto.randomUUID() : `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date();
    const saleNumber = `V-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
    const total = Math.max(0, subtotal - discount);

    const saleRecord = {
      id: saleId,
      sale_number: saleNumber,
      total,
      subtotal,
      discount,
      payment_method: paymentMethod,
      amount_paid: Number(amountPaid) || total,
      change_amount: Number(changeAmount) || 0,
      customer_name: customerName,
      customer_cuit: customerCuit,
      invoice_type: invoiceType,
      cae: null,
      shift_id: shiftId,
      sync_status: 'pending',
      created_at: now.toISOString()
    };

    const itemRecords = items.map((it) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sale_id: saleId,
      product_id: it.id,
      product_name: it.name,
      quantity: it.quantity,
      unit_price: it.price,
      subtotal: it.price * it.quantity
    }));

    // Transacción atómica local: guardar venta, guardar ítems y descontar stock local
    await db.transaction('rw', db.sales, db.sale_items, db.products, async () => {
      await db.sales.add(saleRecord);
      await db.sale_items.bulkAdd(itemRecords);

      // Descontar stock local de inmediato para que la cajera vea el remanente real
      for (const it of items) {
        const prod = await db.products.get(it.id);
        if (prod) {
          const updatedStock = Math.max(0, (prod.stock || 0) - it.quantity);
          await db.products.update(it.id, { stock: updatedStock });
        }
      }
    });

    console.log(`[Offline Sale] Venta ${saleNumber} guardada en almacenamiento local.`);

    // Si hay conexión, lanzamos la sincronización en segundo plano sin bloquear al usuario
    if (this.isOnline) {
      setTimeout(() => this.pushPendingSales(), 100);
    }

    return {
      sale: saleRecord,
      items: itemRecords
    };
  }

  // Sincronización completa (productos + ventas)
  async syncAll() {
    await this.pullProducts();
    await this.pushPendingSales();
  }
}

export const syncEngine = new SyncEngine();
