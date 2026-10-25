import { db } from '../db/localDb';
import { supabase } from '../config/supabase';

function playOrderChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // Chime melodioso ascendente de 2 notas (tipo timbre de pedido)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Si el navegador bloquea audio sin interacción, ignorar
  }
}

class WebOrdersEngine {
  constructor() {
    this.subscribers = new Set();
    this.lastOrderCount = 0;

    // Sondeo de pedidos web cada 15 segundos
    setInterval(() => this.pollOrders(), 15000);
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
    try {
      let orders = [];

      // 1. Intentamos consultar Supabase si hay conexión
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('web_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);

        if (!error && data) {
          orders = data;
          await db.web_orders.bulkPut(data);
        } else {
          orders = await db.web_orders.orderBy('created_at').reverse().toArray();
        }
      } else {
        orders = await db.web_orders.orderBy('created_at').reverse().toArray();
      }

      const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion');

      // Si llegaron nuevos pedidos pendientes, sonar timbre
      if (pendingOrders.length > this.lastOrderCount && this.lastOrderCount !== 0) {
        playOrderChime();
      }
      this.lastOrderCount = pendingOrders.length;

      this.notify(orders);
      return orders;
    } catch {
      const local = await db.web_orders.orderBy('created_at').reverse().toArray();
      this.notify(local);
      return local;
    }
  }

  async updateOrderStatus(orderId, newStatus) {
    try {
      await db.web_orders.update(orderId, { status: newStatus });

      if (navigator.onLine) {
        await supabase
          .from('web_orders')
          .update({ status: newStatus })
          .eq('id', orderId);
      }

      await this.pollOrders();
    } catch (err) {
      console.error('Error updating web order status:', err);
    }
  }
}

export const webOrdersEngine = new WebOrdersEngine();
