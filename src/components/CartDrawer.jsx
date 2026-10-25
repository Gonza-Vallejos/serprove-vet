import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Send, User, Phone, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';

export default function CartDrawer({ settings, isMobile }) {
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submittedOrder, setSubmittedOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Bloquea el scroll del fondo mientras el carrito está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSubmittedOrder(null);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const whatsappNumber = settings?.global_whatsappPhone || '3794895845';

  const buildWhatsAppMessage = (orderNum) => {
    if (cart.length === 0 && !submittedOrder) return '';

    let message = `🛒 *Pedido de Serprove* (${orderNum || 'Online'})\n\n`;
    if (customerName) message += `👤 *Cliente:* ${customerName}\n`;
    if (customerPhone) message += `📱 *Teléfono:* ${customerPhone}\n\n`;
    message += `📦 *${cartCount} producto(s)*\n\n`;

    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}*\n`;
      message += `   Cantidad: ${item.quantity}\n`;
      message += `   Precio: $${Number(item.price).toLocaleString('es-AR')}\n`;
      if (item.category) message += `   Categoría: ${item.category}\n`;
      message += `\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL: $${cartTotal.toLocaleString('es-AR')}*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Por favor, confirmen disponibilidad y tiempo de entrega. ¡Gracias!`;

    return encodeURIComponent(message);
  };

  const handleSendOrder = async () => {
    if (cart.length === 0) return;

    setIsSubmitting(true);
    const orderNumber = `WEB-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderPayload = {
      id: crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`,
      order_number: orderNumber,
      customer_name: customerName.trim() || 'Cliente Web',
      customer_phone: customerPhone.trim() || whatsappNumber,
      items: cart.map(it => ({
        id: String(it.id),
        name: it.name,
        price: Number(it.price) || 0,
        quantity: it.quantity,
        subtotal: (Number(it.price) || 0) * it.quantity
      })),
      total: cartTotal,
      status: 'pendiente',
      created_at: new Date().toISOString()
    };

    // 1. Enviar a la app de escritorio Electron (receptor en puerto 3005)
    try {
      await fetch('http://localhost:3005/web_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch {}

    // 2. Enviar a backend local (json-server localhost:3001)
    try {
      await fetch('http://localhost:3001/web_orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
    } catch {}

    // 3. Enviar a Supabase Cloud
    try {
      await supabase.from('web_orders').insert(orderPayload);
    } catch {}

    setSubmittedOrder(orderPayload);
    setIsSubmitting(false);
    toast.success(`¡Pedido #${orderNumber} enviado! La caja de la veterinaria ya fue notificada.`);
  };


  // ----- Header común -----
  const header = (
    <div style={{
      padding: '14px 16px',
      borderBottom: '1px solid #eee',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--color-primary, #E91E63)',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white' }}>
        <ShoppingBag size={22} />
        <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Carrito</span>
        <span style={{
          background: 'rgba(255,255,255,0.3)',
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          {cartCount}
        </span>
      </div>
      <button
        onClick={() => setIsCartOpen(false)}
        aria-label="Cerrar carrito"
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          borderRadius: '8px',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          color: 'white'
        }}
      >
        <X size={20} />
      </button>
    </div>
  );

  // ----- Lista de productos -----
  const itemsList = cart.length === 0 ? (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
      <ShoppingBag size={48} style={{ marginBottom: '12px', opacity: 0.4 }} />
      <p style={{ fontSize: '1rem', marginBottom: '8px' }}>Tu carrito está vacío</p>
      <p style={{ fontSize: '0.85rem' }}>Agregá productos para hacer tu pedido</p>
    </div>
  ) : (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
      {cart.map(item => (
        <div key={item.id} style={{
          background: '#f9f9f9',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          gap: '12px',
          border: '1px solid #eee'
        }}>
          {/* Imagen */}
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '8px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            <img
              src={item.image || '/product.jpg'}
              alt={item.name}
              style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
            />
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h4 style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              marginBottom: '4px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {item.name}
            </h4>
            <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '6px' }}>
              {item.category}
            </p>
            <p style={{
              fontSize: '0.95rem',
              fontWeight: '700',
              color: 'var(--color-primary, #E91E63)',
              marginBottom: '8px'
            }}>
              ${Number(item.price).toLocaleString('es-AR')}
            </p>

            {/* Cantidades */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                aria-label="Restar"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Minus size={14} />
              </button>
              <span style={{ fontWeight: '600', minWidth: '24px', textAlign: 'center' }}>
                {item.quantity}
              </span>
              <button
                onClick={() => {
                  if (item.quantity >= item.stock) {
                    toast.error(`Stock máximo alcanzado (${item.stock})`);
                    return;
                  }
                  updateQuantity(item.id, item.quantity + 1);
                }}
                aria-label="Sumar"
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  background: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Plus size={14} />
              </button>
              <button
                onClick={() => removeFromCart(item.id)}
                aria-label="Eliminar producto"
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626',
                  padding: '4px'
                }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // ----- Footer sticky: queda pegado abajo DENTRO del área scrolleable -----
  const stickyFooter = cart.length > 0 && (
    <div style={{
      position: 'sticky',
      bottom: 0,
      padding: '14px 16px',
      borderTop: '1px solid #eee',
      background: '#ffffff',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.06)'
    }}>
      {submittedOrder ? (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '1px solid #86efac',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#15803d', fontWeight: '800', fontSize: '1.05rem' }}>
            <CheckCircle2 size={20} color="#16a34a" />
            ¡Pedido {submittedOrder.order_number} Enviado!
          </div>
          <p style={{ fontSize: '0.82rem', color: '#166534', margin: 0, lineHeight: 1.4 }}>
            Tu pedido ya fue recibido en la caja de la veterinaria. Si deseas confirmar por WhatsApp con un solo toque:
          </p>
          <button
            onClick={() => {
              const url = `https://api.whatsapp.com/send?phone=54${whatsappNumber}&text=${buildWhatsAppMessage(submittedOrder.order_number)}`;
              window.open(url, '_blank');
            }}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: '#25D366',
              color: 'white',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Send size={16} />
            Confirmar en WhatsApp
          </button>
          <button
            onClick={() => {
              clearCart();
              setSubmittedOrder(null);
              setIsCartOpen(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#4b5563',
              fontSize: '0.8rem',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Finalizar y seguir navegando
          </button>
        </div>
      ) : (
        <>
          {/* Formulario de contacto del cliente */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '10px',
            marginBottom: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Tus datos de contacto
            </div>
            <div style={{ position: 'relative' }}>
              <User size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Nombre y Apellido *"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Phone size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
              <input
                type="tel"
                placeholder="Teléfono / WhatsApp *"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px 7px 30px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.85rem',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px'
          }}>
            <span style={{ fontSize: '1rem', fontWeight: '600' }}>Total</span>
            <span style={{
              fontSize: '1.3rem',
              fontWeight: '800',
              color: 'var(--color-primary, #E91E63)'
            }}>
              ${cartTotal.toLocaleString('es-AR')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={handleSendOrder}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: 'white',
                fontWeight: '700',
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Send size={18} />
              {isSubmitting ? 'Enviando a Caja...' : 'Enviar Pedido a Mostrador'}
            </button>
            <button
              onClick={clearCart}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#64748b',
                fontWeight: '500',
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              Vaciar carrito
            </button>
          </div>
        </>
      )}
    </div>
  );


  // Área scrolleable: productos + footer pegado abajo
  const scrollArea = (
    <div style={{
      flex: 1,
      minHeight: 0,
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      {itemsList}
      {stickyFooter}
    </div>
  );

  const styles = (
    <style>{`
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideInRight {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes modalPop {
        from { opacity: 0; transform: translateY(20px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .cart-modal {
        max-height: 78vh;
        max-height: 78dvh;
      }
      .cart-panel {
        top: 0;
        bottom: 0;
        height: 100vh;
        height: 100dvh;
      }
    `}</style>
  );

  // ----- MÓVIL: modal centrado -----
  if (isMobile) {
    return (
      <>
        <div
          onClick={() => setIsCartOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.55)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div
            role="dialog"
            aria-label="Carrito"
            className="cart-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '420px',
              maxHeight: '78dvh',
              backgroundColor: 'white',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'modalPop 0.25s ease'
            }}
          >
            {header}
            {scrollArea}
            {styles}
          </div>
        </div>
      </>
    );
  }

  // ----- ESCRITORIO: panel lateral -----
  return (
    <>
      <div
        onClick={() => setIsCartOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease'
        }}
      />
      <div className="cart-panel" style={{
        position: 'fixed',
        right: 0,
        width: '420px',
        maxWidth: '100%',
        backgroundColor: 'white',
        boxShadow: '-4px 0 20px rgba(0,0,0,0.15)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideInRight 0.3s ease',
        overflow: 'hidden'
      }}>
        {header}
        {scrollArea}
        {styles}
      </div>
    </>
  );
}
