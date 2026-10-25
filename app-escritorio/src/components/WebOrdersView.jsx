import React, { useState } from 'react';
import { Globe, Clock, User, Phone, MapPin, Package, CheckCircle2, ArrowRight, MessageCircle, Sparkles, RefreshCw, ShoppingCart } from 'lucide-react';
import { webOrdersEngine } from '../services/webOrdersEngine';

export function WebOrdersView({
  orders = [],
  onLoadOrderToCart,
  onSwitchToPOS
}) {
  const [filter, setFilter] = useState('pendientes'); // 'pendientes', 'en_preparacion', 'facturado', 'todos'
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

  const pendingOrders = orders.filter(o => o.status === 'pendiente');
  const preparingOrders = orders.filter(o => o.status === 'en_preparacion');
  const completedOrders = orders.filter(o => o.status === 'facturado');

  const filteredOrders = orders.filter(o => {
    if (filter === 'pendientes') return o.status === 'pendiente';
    if (filter === 'en_preparacion') return o.status === 'en_preparacion';
    if (filter === 'facturado') return o.status === 'facturado';
    return true;
  });

  const handleChargeOrder = (order) => {
    onLoadOrderToCart(order);
  };

  const handleSetPreparing = async (orderId) => {
    await webOrdersEngine.updateOrderStatus(orderId, 'en_preparacion');
  };

  const handleCreateDemo = async () => {
    setIsCreatingDemo(true);
    await webOrdersEngine.createDemoOrder();
    setTimeout(() => setIsCreatingDemo(false), 500);
  };

  const totalPendingAmount = pendingOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#0a0f1d',
      overflow: 'hidden'
    }}>
      {/* Top Banner / Controls Bar */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid #1e293b',
        background: 'linear-gradient(to right, #0f172a, #1e1b4b)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
          }}>
            <Globe size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc', margin: 0, fontFamily: 'var(--font-display)' }}>
                Bandeja de Pedidos Web
              </h2>
              <span style={{
                background: 'rgba(59, 130, 246, 0.2)',
                color: '#60a5fa',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                fontSize: '11px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '6px'
              }}>
                En Vivo (Tiempo Real)
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0 0' }}>
              Órdenes enviadas por clientes desde la tienda online listas para facturar en caja
            </p>
          </div>
        </div>

        {/* Action Buttons: Demo order & Back to POS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handleCreateDemo}
            disabled={isCreatingDemo}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              border: 'none',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isCreatingDemo ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
            }}
            title="Genera un pedido web ficticio para comprobar el sonido de campanilla y la carga a caja"
          >
            <Sparkles size={15} />
            <span>{isCreatingDemo ? 'Generando...' : '🧪 Simular Pedido de Prueba'}</span>
          </button>

          {onSwitchToPOS && (
            <button
              onClick={onSwitchToPOS}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#cbd5e1',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <ShoppingCart size={15} />
              <span>Ir al Mostrador</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics & Filter Bar */}
      <div style={{
        padding: '12px 24px',
        borderBottom: '1px solid #1e293b',
        background: '#090d16',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Filter Tabs */}
        <div style={{ display: 'flex', background: '#1e293b', borderRadius: '10px', padding: '3px' }}>
          <button
            onClick={() => setFilter('pendientes')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: filter === 'pendientes' ? '#2563eb' : 'transparent',
              color: filter === 'pendientes' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Pendientes</span>
            <span style={{
              background: filter === 'pendientes' ? '#1d4ed8' : '#334155',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {pendingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('en_preparacion')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: filter === 'en_preparacion' ? '#d97706' : 'transparent',
              color: filter === 'en_preparacion' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>En Preparación</span>
            <span style={{
              background: filter === 'en_preparacion' ? '#b45309' : '#334155',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {preparingOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('facturado')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: filter === 'facturado' ? '#059669' : 'transparent',
              color: filter === 'facturado' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Facturados</span>
            <span style={{
              background: filter === 'facturado' ? '#047857' : '#334155',
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '11px'
            }}>
              {completedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setFilter('todos')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              background: filter === 'todos' ? '#475569' : 'transparent',
              color: filter === 'todos' ? '#fff' : '#94a3b8',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Todos ({orders.length})
          </button>
        </div>

        {/* Quick summary stat */}
        {pendingOrders.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#93c5fd' }}>
            <span>Monto total en espera:</span>
            <b style={{ color: '#34d399', fontSize: '15px', fontFamily: 'var(--font-mono)' }}>
              ${totalPendingAmount.toLocaleString('es-AR')}
            </b>
          </div>
        )}
      </div>

      {/* Orders List / Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {filteredOrders.length === 0 ? (
          <div style={{
            margin: 'auto',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '460px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#111827',
              border: '1px solid #1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '16px'
            }}>
              🌐
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', margin: '0 0 6px 0' }}>
              No hay pedidos en la sección "{filter}"
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              Cuando los clientes realicen pedidos desde la tienda web o WhatsApp, entrarán automáticamente aquí acompañados de un sonido de campanilla.
            </p>
            <button
              onClick={handleCreateDemo}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Sparkles size={16} />
              Simular Pedido de Prueba Ahora
            </button>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isPending = order.status === 'pendiente';
            const isPreparing = order.status === 'en_preparacion';
            const isCompleted = order.status === 'facturado';
            const date = new Date(order.created_at || Date.now());
            const items = Array.isArray(order.items) ? order.items : [];

            return (
              <div
                key={order.id}
                style={{
                  background: '#0f172a',
                  border: isPending ? '1.5px solid #3b82f6' : isPreparing ? '1.5px solid #f59e0b' : '1px solid #1e293b',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  boxShadow: isPending ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Header: Order ID, Date & Status Pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 800,
                      fontSize: '16px',
                      color: '#f8fafc',
                      background: '#1e293b',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      border: '1px solid #334155'
                    }}>
                      {order.order_number || `#WEB-${String(order.id).slice(0, 6)}`}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} />
                      {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} • {date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    background: isPending ? 'rgba(59, 130, 246, 0.15)' : isPreparing ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: isPending ? '#60a5fa' : isPreparing ? '#fbbf24' : '#34d399',
                    border: `1px solid ${isPending ? 'rgba(59, 130, 246, 0.4)' : isPreparing ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                  }}>
                    {isPending ? '🔔 Nuevo Pedido en Espera' : isPreparing ? '⏳ En Preparación' : '✅ Facturado y Despachado'}
                  </span>
                </div>

                {/* Customer Details Card */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignItems: 'center',
                  fontSize: '13px',
                  color: '#e2e8f0',
                  background: '#161f36',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #233052'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={15} color="#94a3b8" />
                    <span>Cliente:</span>
                    <b style={{ color: '#ffffff' }}>{order.customer_name || 'Cliente Web'}</b>
                  </div>

                  {order.customer_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={15} color="#94a3b8" />
                      <span>{order.customer_phone}</span>
                      <a
                        href={`https://wa.me/54${order.customer_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          background: '#16a34a',
                          color: '#ffffff',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        <MessageCircle size={13} />
                        WhatsApp
                      </a>
                    </div>
                  )}

                  {order.customer_address && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="#94a3b8" />
                      <span>{order.customer_address}</span>
                    </div>
                  )}

                  {order.notes && (
                    <div style={{ fontSize: '12px', color: '#fbbf24', fontStyle: 'italic', width: '100%' }}>
                      Nota: "{order.notes}"
                    </div>
                  )}
                </div>

                {/* Items Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Artículos solicitados:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                    {items.map((it, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: '#090d16',
                          border: '1px solid #1e293b',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '13px'
                        }}
                      >
                        <span style={{ color: '#f3f4f6', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <span style={{ color: '#38bdf8', marginRight: '6px' }}>{it.quantity}x</span>
                          {it.name}
                        </span>
                        <span style={{ color: '#34d399', fontFamily: 'var(--font-mono)', fontWeight: 700, marginLeft: '8px' }}>
                          ${Number(it.price * it.quantity).toLocaleString('es-AR')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer: Order Total & Primary Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '12px',
                  borderTop: '1px solid #1e293b',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>Total del Pedido:</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, color: '#34d399' }}>
                      ${Number(order.total).toLocaleString('es-AR')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {isPending && (
                      <button
                        onClick={() => handleSetPreparing(order.id)}
                        style={{
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: '#1e293b',
                          border: '1px solid #334155',
                          color: '#fbbf24',
                          fontSize: '13px',
                          fontWeight: 700,
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
                          padding: '10px 20px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          border: 'none',
                          color: '#ffffff',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        <Package size={16} />
                        <span>Cargar a Caja y Cobrar [F4]</span>
                        <ArrowRight size={15} />
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
  );
}
