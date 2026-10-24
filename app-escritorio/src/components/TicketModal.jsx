import React from 'react';
import { Printer, CheckCircle, ArrowRight, Share2, X } from 'lucide-react';
import { generateThermalTicketHtml } from '../services/arcaEngine';

export function TicketModal({
  isOpen,
  onClose,
  sale,
  items = [],
  onNewSale
}) {
  if (!isOpen || !sale) return null;

  const ticketHtml = generateThermalTicketHtml({ sale, items });

  const handlePrint = async () => {
    if (window.desktopAPI && window.desktopAPI.printTicket) {
      // Impresión nativa mediante Electron hacia impresora térmica (ESC/POS)
      await window.desktopAPI.printTicket(ticketHtml);
    } else {
      // Impresión estándar de navegador web
      window.print();
    }
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
      zIndex: 10000,
      padding: '20px'
    }}>
      <div style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '460px',
        maxHeight: '92vh',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#34d399',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <CheckCircle size={15} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>
              ¡Venta Registrada con Éxito!
            </span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Thermal Ticket Container (Styled like real thermal paper) */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          background: '#090d16',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div
            id="thermal-ticket-container"
            style={{
              width: '100%',
              maxWidth: '320px',
              background: '#ffffff',
              color: '#111827',
              borderRadius: '6px',
              padding: '18px 16px',
              fontFamily: "'Courier New', Courier, monospace",
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              position: 'relative'
            }}
            dangerouslySetInnerHTML={{ __html: ticketHtml }}
          />
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '14px 20px',
          background: '#0f172a',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={handlePrint}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: '#1e293b',
              border: '1px solid #475569',
              color: '#f8fafc',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Printer size={16} />
            <span>Imprimir Ticket</span>
          </button>

          <button
            onClick={onNewSale}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>Nueva Venta</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
