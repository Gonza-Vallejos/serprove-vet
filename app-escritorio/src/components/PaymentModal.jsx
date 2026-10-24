import React, { useState, useEffect } from 'react';
import { Banknote, CreditCard, QrCode, User, FileText, CheckCircle2, X } from 'lucide-react';

export function PaymentModal({
  isOpen,
  onClose,
  total,
  onConfirmSale
}) {
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [amountPaid, setAmountPaid] = useState(total);
  const [invoiceType, setInvoiceType] = useState('X'); // X = Remito / Venta Interna, B = Factura B, A = Factura A
  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [customerCuit, setCustomerCuit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmountPaid(total);
      setIsSubmitting(false);
    }
  }, [isOpen, total]);

  if (!isOpen) return null;

  const change = Math.max(0, (Number(amountPaid) || 0) - total);
  const isCash = paymentMethod === 'efectivo';
  const isShortOfMoney = isCash && (Number(amountPaid) || 0) < total;

  const quickPresets = [1000, 2000, 5000, 10000, 20000, 50000];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (isShortOfMoney || isSubmitting) return;

    setIsSubmitting(true);
    await onConfirmSale({
      paymentMethod,
      amountPaid: isCash ? Number(amountPaid) : total,
      changeAmount: isCash ? change : 0,
      invoiceType,
      customerName: customerName.trim() || 'Consumidor Final',
      customerCuit: customerCuit.trim()
    });
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
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
        maxWidth: '580px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(to right, #0f172a, #1e293b)'
        }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
              Cobro y Finalización de Venta
            </h2>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Selecciona el método de pago y tipo de comprobante
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: 'none',
              color: '#94a3b8',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Total Banner */}
        <div style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(30, 41, 59, 0.4))',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#6ee7b7', letterSpacing: '0.5px' }}>
            TOTAL DE LA OPERACIÓN
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 800, color: '#10b981' }}>
            ${total.toLocaleString('es-AR')}
          </span>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Payment Method Selector */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              MEDIO DE PAGO
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {[
                { id: 'efectivo', label: 'Efectivo', icon: Banknote },
                { id: 'debito', label: 'Débito', icon: CreditCard },
                { id: 'credito', label: 'Crédito', icon: CreditCard },
                { id: 'transferencia', label: 'QR / Transf.', icon: QrCode }
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    style={{
                      padding: '12px 8px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #10b981' : '1px solid #334155',
                      background: isSelected ? 'rgba(16, 185, 129, 0.15)' : '#1e293b',
                      color: isSelected ? '#34d399' : '#cbd5e1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Icon size={18} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cash calculation section */}
          {isCash && (
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '14px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                  Abonó con:
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#94a3b8', fontSize: '14px' }}>$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(Number(e.target.value) || 0)}
                    style={{
                      width: '140px',
                      padding: '8px 12px',
                      background: '#0f172a',
                      border: '1px solid #475569',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '16px',
                      fontWeight: 700,
                      textAlign: 'right',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              {/* Quick Cash Presets */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setAmountPaid(total)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #475569',
                    background: '#0f172a',
                    color: '#60a5fa',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Monto Exacto
                </button>
                {quickPresets.filter(p => p >= total).slice(0, 4).map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountPaid(preset)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #475569',
                      background: '#0f172a',
                      color: '#cbd5e1',
                      fontSize: '11px',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer'
                    }}
                  >
                    ${preset.toLocaleString('es-AR')}
                  </button>
                ))}
              </div>

              {/* Change / Vuelto */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '8px',
                borderTop: '1px solid #334155'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: isShortOfMoney ? '#f87171' : '#34d399' }}>
                  {isShortOfMoney ? 'Faltan abonar:' : 'Vuelto a entregar:'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '20px',
                  fontWeight: 800,
                  color: isShortOfMoney ? '#f87171' : '#34d399'
                }}>
                  ${isShortOfMoney ? (total - amountPaid).toLocaleString('es-AR') : change.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          )}

          {/* Invoice Type & ARCA configuration */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '8px' }}>
              TIPO DE COMPROBANTE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              {[
                { id: 'X', label: 'Comprobante X', desc: 'Venta interna / Remito' },
                { id: 'B', label: 'Factura B', desc: 'Consumidor Final (ARCA)' },
                { id: 'A', label: 'Factura A', desc: 'Resp. Inscripto con CUIT' }
              ].map(inv => (
                <button
                  key={inv.id}
                  type="button"
                  onClick={() => setInvoiceType(inv.id)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: invoiceType === inv.id ? '2px solid #3b82f6' : '1px solid #334155',
                    background: invoiceType === inv.id ? 'rgba(59, 130, 246, 0.15)' : '#1e293b',
                    color: invoiceType === inv.id ? '#93c5fd' : '#cbd5e1',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '12px' }}>{inv.label}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>{inv.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer fields */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                Cliente
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Nombre o Razón Social"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                {invoiceType === 'A' ? 'CUIT (Obligatorio en Fac. A)' : 'DNI / CUIT (Opcional)'}
              </label>
              <input
                type="text"
                value={customerCuit}
                onChange={(e) => setCustomerCuit(e.target.value)}
                placeholder="30-xxxxxxxx-x"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={isShortOfMoney || isSubmitting}
            style={{
              padding: '14px',
              borderRadius: '10px',
              background: isShortOfMoney || isSubmitting ? '#334155' : 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              cursor: isShortOfMoney || isSubmitting ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: isShortOfMoney ? 'none' : '0 8px 20px rgba(16, 185, 129, 0.4)',
              marginTop: '6px'
            }}
          >
            <CheckCircle2 size={18} />
            <span>{isSubmitting ? 'Procesando Venta...' : 'CONFIRMAR VENTA E IMPRIMIR'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
