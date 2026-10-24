import React, { useState, useEffect } from 'react';
import { History, Cloud, CloudOff, Printer, RefreshCw, X, Search } from 'lucide-react';
import { db } from '../db/localDb';
import { syncEngine } from '../services/syncEngine';

export function SalesHistoryModal({
  isOpen,
  onClose,
  onReprintTicket
}) {
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSync, setFilterSync] = useState('all'); // all, pending, synced
  const [isSyncing, setIsSyncing] = useState(false);

  const loadSales = async () => {
    try {
      const list = await db.sales.orderBy('created_at').reverse().toArray();
      setSales(list);
    } catch (err) {
      console.error('Error loading sales history:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSales();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredSales = sales.filter(s => {
    const matchesSearch = !searchTerm ||
      s.sale_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customer_name && s.customer_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSync = filterSync === 'all' ||
      (filterSync === 'pending' && s.sync_status === 'pending') ||
      (filterSync === 'synced' && s.sync_status === 'synced');

    return matchesSearch && matchesSync;
  });

  const handleForceSync = async () => {
    setIsSyncing(true);
    await syncEngine.syncAll();
    await loadSales();
    setIsSyncing(false);
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
        maxWidth: '750px',
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
              <History size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-display)' }}>
                Historial de Ventas Locales
              </h2>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                Registro persistido en el dispositivo con estado de sincronización Cloud
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleForceSync}
              disabled={isSyncing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: '#1e293b',
                border: '1px solid #475569',
                color: '#60a5fa',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
              <span>Sincronizar Cloud</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div style={{
          padding: '12px 20px',
          background: '#1e293b',
          borderBottom: '1px solid #334155',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por n° de ticket o cliente..."
              style={{
                width: '100%',
                padding: '6px 10px 6px 30px',
                background: '#0f172a',
                border: '1px solid #475569',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'all', label: 'Todas' },
              { id: 'pending', label: 'Pendientes Sync' },
              { id: 'synced', label: 'Sincronizadas' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterSync(f.id)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: filterSync === f.id ? '1px solid #3b82f6' : '1px solid transparent',
                  background: filterSync === f.id ? '#2563eb' : '#0f172a',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sales List Table */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
          {filteredSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              No se encontraron ventas con los filtros aplicados.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: '#94a3b8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '8px 6px' }}>N° VENTA</th>
                  <th style={{ padding: '8px 6px' }}>FECHA / HORA</th>
                  <th style={{ padding: '8px 6px' }}>CLIENTE</th>
                  <th style={{ padding: '8px 6px' }}>MEDIO</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>TOTAL</th>
                  <th style={{ padding: '8px 6px', textAlign: 'center' }}>ESTADO</th>
                  <th style={{ padding: '8px 6px', textAlign: 'right' }}>ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map(sale => {
                  const isPending = sale.sync_status === 'pending';
                  const date = new Date(sale.created_at);

                  return (
                    <tr
                      key={sale.id}
                      style={{ borderBottom: '1px solid #1e293b', transition: 'background 0.15s ease' }}
                    >
                      <td style={{ padding: '10px 6px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#f8fafc' }}>
                        {sale.sale_number}
                      </td>
                      <td style={{ padding: '10px 6px', color: '#94a3b8', fontSize: '12px' }}>
                        {date.toLocaleDateString('es-AR')} {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '10px 6px', color: '#cbd5e1' }}>
                        {sale.customer_name || 'Consumidor Final'}
                      </td>
                      <td style={{ padding: '10px 6px', textTransform: 'capitalize', color: '#94a3b8' }}>
                        {sale.payment_method}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#10b981' }}>
                        ${sale.total.toLocaleString('es-AR')}
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: isPending ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: isPending ? '#fbbf24' : '#34d399',
                          border: `1px solid ${isPending ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                        }}>
                          {isPending ? <CloudOff size={11} /> : <Cloud size={11} />}
                          <span>{isPending ? 'Pendiente' : 'Sincronizado'}</span>
                        </span>
                      </td>
                      <td style={{ padding: '10px 6px', textAlign: 'right' }}>
                        <button
                          onClick={() => onReprintTicket(sale)}
                          style={{
                            background: '#1e293b',
                            border: '1px solid #475569',
                            color: '#cbd5e1',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Printer size={12} />
                          <span>Ticket</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
