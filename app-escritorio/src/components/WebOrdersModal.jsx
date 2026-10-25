import React, { useState } from 'react';
import { Globe, Clock, User, Phone, MapPin, Package, CheckCircle2, ArrowRight, X, MessageCircle } from 'lucide-react';
import { webOrdersEngine } from '../services/webOrdersEngine';

export function WebOrdersModal({
  isOpen,
  onClose,
  orders = [],
  onLoadOrderToCart
}) {
  const [filter, setFilter] = useState('activos'); // 'activos', 'todos'

  if (!isOpen) return null;

  const filteredOrders = orders.filter(o => {
    if (filter === 'activos') {
      return o.status === 'pendiente' || o.status === 'en_preparacion';
    }
    return true;
  });

  const handleChargeOrder = (order) => {
    onLoadOrderToCart(order);
    onClose();
  };

  const handleSetPreparing = async (orderId) => {
    await webOrdersEngine.updateOrderStatus(orderId, 'en_preparacion');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '88vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #0f172a, #1e1b4b)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                Pedidos Web en Espera
              </h2>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Órdenes enviadas por clientes desde la tienda online
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Filter buttons */}
            <div style={{ display: 'flex', background: '#1e293b', borderRadius: '8px', padding: '2px' }}>
              <button
                onClick={() => setFilter('activos')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === 'activos' ? '#2563eb' : 'transparent',
                  color: filter === 'activos' ? '#fff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Pendientes ({orders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length})
              </button>
              <button
                onClick={() => setFilter('todos')}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: filter === 'todos' ? '#2563eb' : 'transparent',
                  color: filter === 'todos' ? '#fff' : '#94a3b8',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Historial Completo
              </button>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {filteredOrders.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#64748b',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '10px' }}>🌐</div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>
                No hay pedidos web pendientes en este momento
              </div>
              <div style={{ fontSize: '12px', maxWidth: '380px', marginTop: '4px' }}>
                Cuando los clientes agreguen productos al carrito en la web, aparecerán aquí con notificación sonora.
              </div>
            </div>
          ) : (
            filteredOrders.map(order => {
              const isPending = order.status === 'pendiente';
              const isPreparing = order.status === 'en_preparacion';
              const isCompleted = order.status === 'facturado';
              const date = new Date(order.created_at);
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <div
                  key={order.id}
                  style={{
                    background: '#111827',
                    border: isPending ? '1px solid #3b82f6' : '1px solid #1f2937',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: isPending ? '0 0 15px rgba(59, 130, 246, 0.15)' : 'none'
                  }}
                >
                  {/* Top Bar: Order ID, Time & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 800,
                        fontSize: '14px',
                        color: '#f8fafc',
                        background: '#1f2937',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {order.order_number || `#WEB-${order.id.slice(0, 6)}`}
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} />
                        {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} • {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '12px',
                      background: isPending ? 'rgba(59, 130, 246, 0.15)' : isPreparing ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: isPending ? '#60a5fa' : isPreparing ? '#fbbf24' : '#34d399',
                      border: `1px solid ${isPending ? 'rgba(59, 130, 246, 0.3)' : isPreparing ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                      {isPending ? '🔔 Nuevo Pedido' : isPreparing ? '⏳ En Preparación' : '✅ Facturado'}
                    </span>
                  </div>

                  {/* Customer Info */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#cbd5e1',
                    background: '#1a2234',
                    padding: '10px 12px',
                    borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={13} color="#94a3b8" />
                      <b>{order.customer_name || 'Cliente Web'}</b>
                    </div>
                    {order.customer_phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={13} color="#94a3b8" />
                        <span>{order.customer_phone}</span>
                        <a
                          href={`https://wa.me/54${order.customer_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            color: '#22c55e',
                            textDecoration: 'none',
                            fontSize: '11px',
                            marginLeft: '4px'
                          }}
                        >
                          <MessageCircle size={12} /> WhatsApp
                        </a>
                      </div>
                    )}
                    {order.customer_address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <MapPin size={13} color="#94a3b8" />
                        <span>{order.customer_address}</span>
                      </div>
                    )}
                  </div>

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 600 }}>
                      Artículos solicitados:
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '6px' }}>
                      {items.map((it, idx) => (
                        <div
                          key={idx}
                          style={{
                            background: '#090d16',
                            border: '1px solid #1e293b',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ color: '#f3f4f6', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <b>{it.quantity}x</b> {it.name}
                          </span>
                          <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 600, marginLeft: '6px' }}>
                            ${Number(it.price * it.quantity).toLocaleString('es-AR')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom: Total & Actions */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid #1f2937'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>Total Pedido:</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 800, color: '#10b981' }}>
                        ${Number(order.total).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isPending && (
                        <button
                          onClick={() => handleSetPreparing(order.id)}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            background: '#1e293b',
                            border: '1px solid #334155',
                            color: '#93c5fd',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          Marcar en Preparación
                        </button>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => handleChargeOrder(order)}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 800,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                          }}
                        >
                          <Package size={14} />
                          <span>Cargar a Caja y Cobrar [F4]</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
