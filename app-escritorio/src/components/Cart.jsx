import React from 'react';
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, ArrowRight, Sparkles } from 'lucide-react';

export function Cart({
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  discount = 0,
  onDiscountChange,
  onOpenPayment
}) {
  const subtotal = items.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const total = Math.max(0, subtotal - discount);
  const totalItemsCount = items.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div style={{
      width: '420px',
      height: '100%',
      background: '#0b1120',
      display: 'flex',
      flexDirection: 'column',
      userSelect: 'none',
      borderLeft: '1px solid #1e293b'
    }}>
      {/* Cart Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingCart size={18} />
          </div>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
              Venta Actual
            </h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {totalItemsCount} {totalItemsCount === 1 ? 'artículo' : 'artículos'}
            </div>
          </div>
        </div>

        {items.length > 0 && (
          <button
            onClick={onClearCart}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '6px'
            }}
            title="Vaciar ticket actual [ESC]"
          >
            <Trash2 size={13} /> Limpiar [ESC]
          </button>
        )}
      </div>

      {/* Cart Items List */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {items.length === 0 ? (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            textAlign: 'center',
            padding: '40px 20px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '26px',
              marginBottom: '14px'
            }}>
              📦
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#94a3b8', marginBottom: '4px' }}>
              Ticket de venta vacío
            </div>
            <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
              Escanea un código de barras con el lector USB o selecciona productos del catálogo.
            </div>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.id}
              style={{
                background: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              {/* Item Top: Name and Remove */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, marginRight: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#f3f4f6', lineHeight: '1.3' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                    ${Number(item.price).toLocaleString('es-AR')} c/u
                  </div>
                </div>

                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#6b7280',
                    cursor: 'pointer',
                    padding: '2px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Item Bottom: Quantity controls and Line Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Quantity Controls */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: '#1f2937',
                  borderRadius: '6px',
                  border: '1px solid #374151'
                }}>
                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d1d5db',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Minus size={12} />
                  </button>

                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#ffffff',
                    minWidth: '28px',
                    textAlign: 'center'
                  }}>
                    {item.quantity}
                  </span>

                  <button
                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#d1d5db',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Line Total */}
                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#34d399'
                }}>
                  ${Number(item.price * item.quantity).toLocaleString('es-AR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Summary & Checkout */}
      <div style={{
        padding: '16px 20px',
        background: '#0f172a',
        borderTop: '1px solid #1e293b',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* Subtotal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#94a3b8' }}>
          <span>Subtotal</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: '#e2e8f0' }}>
            ${subtotal.toLocaleString('es-AR')}
          </span>
        </div>

        {/* Discount Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>Descuento ($)</span>
          <input
            type="number"
            min="0"
            max={subtotal}
            value={discount || ''}
            onChange={(e) => onDiscountChange(Math.max(0, Number(e.target.value) || 0))}
            placeholder="0"
            style={{
              width: '100px',
              padding: '6px 8px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#f87171',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: '13px',
              textAlign: 'right',
              outline: 'none'
            }}
          />
        </div>

        {/* Grand Total */}
        <div style={{
          padding: '12px 14px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(5, 150, 105, 0.05))',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline'
        }}>
          <div>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#6ee7b7', fontWeight: 700 }}>
              TOTAL A COBRAR
            </div>
            <div style={{ fontSize: '10px', color: '#94a3b8' }}>IVA Incluido</div>
          </div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '28px',
            fontWeight: 800,
            color: '#10b981',
            letterSpacing: '-0.5px'
          }}>
            ${total.toLocaleString('es-AR')}
          </div>
        </div>

        {/* Big Checkout Button */}
        <button
          onClick={onOpenPayment}
          disabled={items.length === 0}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '12px',
            background: items.length === 0 ? '#1e293b' : 'linear-gradient(135deg, #10b981, #059669)',
            border: 'none',
            color: items.length === 0 ? '#64748b' : '#ffffff',
            fontSize: '16px',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.5px',
            cursor: items.length === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: items.length === 0 ? 'none' : '0 8px 24px rgba(16, 185, 129, 0.35)',
            transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            if (items.length > 0) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 12px 28px rgba(16, 185, 129, 0.45)';
            }
          }}
          onMouseLeave={(e) => {
            if (items.length > 0) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.35)';
            }
          }}
        >
          <span>COBRAR [F4]</span>
          <ArrowRight size={18} />
        </button>

        {/* Keyboard shortcut footer legend */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '10px',
          color: '#64748b',
          textAlign: 'center',
          paddingTop: '4px'
        }}>
          <span><b>[F2]</b> Buscar</span>
          <span><b>[F4]</b> Cobrar</span>
          <span><b>[F9]</b> Caja</span>
          <span><b>[ESC]</b> Limpiar</span>
        </div>
      </div>
    </div>
  );
}
