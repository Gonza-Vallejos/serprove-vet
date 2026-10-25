import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../supabaseClient';

export default function CartDrawer({ settings, isMobile }) {
  const { cart, cartCount, cartTotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, clearCart } = useCart();

  // Bloquea el scroll del fondo mientras el carrito está abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const whatsappNumber = settings?.global_whatsappPhone || '3794895845';

  const buildWhatsAppMessage = () => {
    if (cart.length === 0) return '';

    let message = `🛒 *Pedido de Serprove*\n\n`;
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

  const handleWhatsAppOrder = async () => {
    // 1. Guardar el pedido en Supabase para que llegue a la app de escritorio del POS
    try {
      const orderNumber = `WEB-${Math.floor(1000 + Math.random() * 9000)}`;
      await supabase.from('web_orders').insert({
        order_number: orderNumber,
        customer_name: 'Cliente Web',
        customer_phone: whatsappNumber,
        items: cart.map(it => ({
          id: it.id,
          name: it.name,
          price: Number(it.price) || 0,
          quantity: it.quantity,
          subtotal: (Number(it.price) || 0) * it.quantity
        })),
        total: cartTotal,
        status: 'pendiente',
        created_at: new Date().toISOString()
      });
      toast.success('¡Pedido enviado! La caja de la veterinaria ya fue notificada.');
    } catch (err) {
      console.warn('Nota: pedido registrado para WhatsApp:', err);
    }

    // 2. Abrir WhatsApp para que el cliente también envíe su mensaje
    const url = `https://api.whatsapp.com/send?phone=54${whatsappNumber}&text=${buildWhatsAppMessage()}`;
    window.open(url, '_blank');
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
      background: '#fafafa',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.06)'
    }}>
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
          onClick={handleWhatsAppOrder}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '10px',
            border: 'none',
            background: '#25D366',
            color: 'white',
            fontWeight: '700',
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <Send size={18} />
          Enviar Pedido por WhatsApp
        </button>
        <button
          onClick={clearCart}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            background: 'white',
            color: '#666',
            fontWeight: '500',
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          Vaciar carrito
        </button>
      </div>
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
