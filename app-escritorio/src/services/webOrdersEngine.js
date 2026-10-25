import { db } from '../db/localDb';
import { supabase } from '../config/supabase';

export function playOrderChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.connect(gain);
    gain.connect(ctx.destination);

    // Chime sonoro claro de campanilla de pedido (D5 587Hz -> A5 880Hz)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime);
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.7);
  } catch (e) {
    console.warn('Audio no disponible aún:', e.message);
  }
}

class WebOrdersEngine {
  constructor() {
    this.subscribers = new Set();
    this.lastOrderCount = 0;

    // Escuchar eventos push en tiempo real de Electron IPC si está disponible
    if (window.desktopAPI?.onIncomingWebOrder) {
      window.desktopAPI.onIncomingWebOrder((order) => {
        this.handleDirectIncomingOrder(order);
      });
    }

    // Sondeo cada 3 segundos
    setInterval(() => this.pollOrders(), 3000);
  }

  async handleDirectIncomingOrder(order) {
    if (!order || !order.id) return;
    try {
      await db.web_orders.put(order);
      playOrderChime();
      await this.pollOrders();
    } catch (e) {
      console.error('Error procesando pedido directo:', e);
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    this.pollOrders();
    return () => this.subscribers.delete(callback);
  }

  notify(orders) {
    for (const sub of this.subscribers) {
      sub(orders);
    }
  }

  async pollOrders() {
    let orders = [];

    // 1. Consultar receptor interno de Electron (puerto 3005)
    try {
      const res3005 = await fetch('http://localhost:3005/web_orders');
      if (res3005.ok) {
        const data3005 = await res3005.json();
        if (Array.isArray(data3005) && data3005.length > 0) {
          orders.push(...data3005);
          await db.web_orders.bulkPut(data3005);
        }
      }
    } catch {}

    // 2. Consultar json-server (puerto 3001)
    try {
      const res3001 = await fetch('http://localhost:3001/web_orders');
      if (res3001.ok) {
        const data3001 = await res3001.json();
        if (Array.isArray(data3001) && data3001.length > 0) {
          const existingIds = new Set(orders.map(o => String(o.id)));
          for (const it of data3001) {
            if (!existingIds.has(String(it.id))) {
              orders.push(it);
            }
          }
          await db.web_orders.bulkPut(data3001);
        }
      }
    } catch {}

    // 3. Consultar Supabase Cloud si está conectado
    if (navigator.onLine) {
      try {
        const { data, error } = await supabase
          .from('web_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data && data.length > 0) {
          const existingIds = new Set(orders.map(o => String(o.id)));
          for (const item of data) {
            if (!existingIds.has(String(item.id))) {
              orders.push(item);
            }
          }
          await db.web_orders.bulkPut(data);
        }
      } catch {}
    }

    // 4. Si aún no hay datos en memoria, leer de la base local Dexie
    if (orders.length === 0) {
      try {
        orders = await db.web_orders.orderBy('created_at').reverse().toArray();
      } catch {}
    }

    // Ordenar por fecha descendente (más nuevos primero)
    orders.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

    const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion');

    // Si llegó un nuevo pedido pendiente, sonar la campana de atención
    if (pendingOrders.length > this.lastOrderCount && this.lastOrderCount !== 0) {
      playOrderChime();
    }
    this.lastOrderCount = pendingOrders.length;

    this.notify(orders);
    return orders;
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      await db.web_orders.update(orderId, { status: newStatus });

      // Actualizar en puerto 3005
      try {
        await fetch(`http://localhost:3005/web_orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch {}

      // Actualizar en puerto 3001
      try {
        await fetch(`http://localhost:3001/web_orders/${orderId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
      } catch {}

      // Actualizar en Supabase Cloud
      if (navigator.onLine) {
        try {
          await supabase
            .from('web_orders')
            .update({ status: newStatus })
            .eq('id', orderId);
        } catch {}
      }

      await this.pollOrders();
    } catch (err) {
      console.error('Error al actualizar estado del pedido web:', err);
    }
  }

  // Genera un pedido de prueba realista para testear en 1 click
  async createDemoOrder() {
    const demoNumber = `WEB-${Math.floor(1000 + Math.random() * 9000)}`;
    const demoOrder = {
      id: crypto.randomUUID ? crypto.randomUUID() : `order-demo-${Date.now()}`,
      order_number: demoNumber,
      customer_name: 'Clínica Vet San Roque (Dr. Ramiro)',
      customer_phone: '3794895845',
      customer_address: 'Av. 3 de Abril 1240, Corrientes',
      notes: 'Enviar con cadetería por la tarde',
      items: [
        {
          id: '5',
          name: 'NexGard Antiparasitario',
          price: 18500,
          quantity: 2,
          subtotal: 37000
        },
        {
          id: '1',
          name: 'Cidar Anti-Pulgas',
          price: 8500,
          quantity: 1,
          subtotal: 8500
        }
      ],
      total: 45500,
      status: 'pendiente',
      created_at: new Date().toISOString()
    };

    // Guardar en local Dexie
    await db.web_orders.put(demoOrder);

    // Intentar replicar a 3005 y 3001
    try {
      await fetch('http://localhost:3005/web_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoOrder)
      });
    } catch {}

    try {
      await fetch('http://localhost:3001/web_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(demoOrder)
      });
    } catch {}

    playOrderChime();
    await this.pollOrders();
    return demoOrder;
  }
}

export const webOrdersEngine = new WebOrdersEngine();

