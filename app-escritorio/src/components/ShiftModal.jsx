import React, { useState, useEffect } from 'react';
import { DollarSign, Lock, Unlock, AlertCircle, CheckCircle, X, Printer } from 'lucide-react';
import { db } from '../db/localDb';

export function ShiftModal({
  isOpen,
  onClose,
  currentShift,
  onOpenShift,
  onCloseShift
}) {
  const [openingAmount, setOpeningAmount] = useState('15000');
  const [countedCash, setCountedCash] = useState('');
  const [shiftStats, setShiftStats] = useState({
    totalSales: 0,
    cashSales: 0,
    debitSales: 0,
    creditSales: 0,
    transferSales: 0,
    count: 0
  });

  useEffect(() => {
    if (isOpen && currentShift) {
      const loadShiftStats = async () => {
        const sales = await db.sales
          .where('created_at')
          .aboveOrEqual(currentShift.opened_at)
          .toArray();

        let total = 0;
        let cash = 0;
        let debit = 0;
        let credit = 0;
        let transfer = 0;

        for (const s of sales) {
          total += s.total;
          if (s.payment_method === 'efectivo') cash += s.total;
          else if (s.payment_method === 'debito') debit += s.total;
          else if (s.payment_method === 'credito') credit += s.total;
          else if (s.payment_method === 'transferencia') transfer += s.total;
        }

        setShiftStats({
          totalSales: total,
          cashSales: cash,
          debitSales: debit,
          creditSales: credit,
          transferSales: transfer,
          count: sales.length
        });

        // Valor por defecto en conteo
        setCountedCash(String((currentShift.opening_amount || 0) + cash));
      };
      loadShiftStats();
    }
  }, [isOpen, currentShift]);

  if (!isOpen) return null;

  const expectedCash = (currentShift?.opening_amount || 0) + shiftStats.cashSales;
  const difference = (Number(countedCash) || 0) - expectedCash;

  const handleOpen = (e) => {
    e.preventDefault();
    onOpenShift(Number(openingAmount) || 0);
  };

  const handleClose = (e) => {
    e.preventDefault();
    onCloseShift({
      closingAmount: Number(countedCash) || 0,
      expectedAmount: expectedCash,
      difference: difference,
      stats: shiftStats
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
        maxWidth: '520px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden'
      }}>
        {/* Header */}
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
              background: currentShift ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: currentShift ? '#60a5fa' : '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {currentShift ? <Lock size={16} /> : <Unlock size={16} />}
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
              {currentShift ? 'Cierre de Turno y Arqueo de Caja' : 'Apertura de Turno de Caja'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {!currentShift ? (
          // APERTURA DE CAJA
          <form onSubmit={handleOpen} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
              Inicia un nuevo turno de ventas. Ingresa el dinero en efectivo disponible en la gaveta física para dar cambio a los clientes.
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '8px' }}>
                MONTO INICIAL EN EFECTIVO ($)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                value={openingAmount}
                onChange={(e) => setOpeningAmount(e.target.value)}
                autoFocus
                placeholder="Ej. 15000"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '18px',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <Unlock size={16} />
              <span>Abrir Caja de Ventas</span>
            </button>
          </form>
        ) : (
          // CIERRE DE CAJA Y ARQUEO
          <form onSubmit={handleClose} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
              Turno abierto el {new Date(currentShift.opened_at).toLocaleDateString('es-AR')} a las {new Date(currentShift.opened_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.
            </div>

            {/* Sales breakdown grid */}
            <div style={{
              background: '#1e293b',
              borderRadius: '10px',
              padding: '14px',
              border: '1px solid #334155',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
              fontSize: '12px'
            }}>
              <div>
                <span style={{ color: '#94a3b8' }}>Efectivo Inicial:</span>
                <div style={{ fontWeight: 700, color: '#f8fafc', fontFamily: 'var(--font-mono)' }}>
                  ${(currentShift.opening_amount || 0).toLocaleString('es-AR')}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Ventas en Efectivo:</span>
                <div style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                  +${shiftStats.cashSales.toLocaleString('es-AR')}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Ventas Débito/Crédito:</span>
                <div style={{ fontWeight: 700, color: '#60a5fa', fontFamily: 'var(--font-mono)' }}>
                  ${(shiftStats.debitSales + shiftStats.creditSales).toLocaleString('es-AR')}
                </div>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Ventas QR/Transferencia:</span>
                <div style={{ fontWeight: 700, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  ${shiftStats.transferSales.toLocaleString('es-AR')}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #334155', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Total Facturado ({shiftStats.count} ventas):</span>
                <span style={{ fontWeight: 800, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                  ${shiftStats.totalSales.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            {/* Arqueo de efectivo */}
            <div style={{ background: '#090d16', padding: '14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1' }}>
                  Efectivo contado en gaveta ($):
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={countedCash}
                  onChange={(e) => setCountedCash(e.target.value)}
                  style={{
                    width: '130px',
                    padding: '8px 10px',
                    background: '#1e293b',
                    border: '1px solid #475569',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '15px',
                    fontWeight: 700,
                    textAlign: 'right',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                <span>Efectivo esperado (Inicial + Ventas):</span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>${expectedCash.toLocaleString('es-AR')}</span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '6px',
                borderTop: '1px dashed #334155'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: difference === 0 ? '#34d399' : difference > 0 ? '#60a5fa' : '#f87171' }}>
                  {difference === 0 ? 'Caja cuadrada exactamente' : difference > 0 ? 'Sobrante de caja:' : 'Faltante de caja:'}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '16px',
                  fontWeight: 800,
                  color: difference === 0 ? '#34d399' : difference > 0 ? '#60a5fa' : '#f87171'
                }}>
                  {difference > 0 ? `+$${difference.toLocaleString('es-AR')}` : `$${difference.toLocaleString('es-AR')}`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                border: 'none',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: 800,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)'
              }}
            >
              <Lock size={16} />
              <span>Cerrar Turno e Imprimir Reporte Z</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
