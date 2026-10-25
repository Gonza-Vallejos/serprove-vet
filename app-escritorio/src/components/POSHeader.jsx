import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, DollarSign, History, Minus, Square, X, AlertTriangle, Globe } from 'lucide-react';
import { syncEngine } from '../services/syncEngine';
import { db } from '../db/localDb';

export function POSHeader({ onOpenShiftModal, onOpenHistoryModal, currentShift, onOpenWebOrders, webOrdersCount = 0 }) {
  const [connection, setConnection] = useState({ isOnline: navigator.onLine, isSyncing: false });
  const [pendingCount, setPendingCount] = useState(0);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Suscripción al motor de sincronización
    const unsubscribe = syncEngine.subscribe((status) => {
      setConnection(status);
    });

    // Reloj digital en vivo
    const timer = setInterval(() => setTime(new Date()), 1000);

    // Contar ventas pendientes periódicamente
    const updatePending = async () => {
      try {
        const count = await db.sales.where('sync_status').equals('pending').count();
        setPendingCount(count);
      } catch (err) {
        console.error('Error counting pending sales:', err);
      }
    };
    updatePending();
    const pendingTimer = setInterval(updatePending, 5000);

    return () => {
      unsubscribe();
      clearInterval(timer);
      clearInterval(pendingTimer);
    };
  }, []);

  const handleManualSync = async () => {
    if (connection.isSyncing) return;
    await syncEngine.syncAll();
    const count = await db.sales.where('sync_status').equals('pending').count();
    setPendingCount(count);
  };

  const isElectron = !!window.desktopAPI;

  return (
    <header style={{
      height: '64px',
      background: 'linear-gradient(to right, #0f172a, #1e1b4b, #0f172a)',
      borderBottom: '1px solid #334155',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      userSelect: 'none'
    }}>
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '18px',
          color: '#fff',
          boxShadow: '0 4px 12px rgba(236, 72, 153, 0.35)'
        }}>
          🐾
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '18px', letterSpacing: '0.5px', color: '#fff' }}>
              SERPROVE VET
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              letterSpacing: '0.8px'
            }}>
              POS DESKTOP
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            Punto de Venta Local • Sincronización Cloud
          </div>
        </div>
      </div>

      {/* Center status badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Connection status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '8px',
          background: connection.isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${connection.isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
          color: connection.isOnline ? '#34d399' : '#fbbf24',
          fontSize: '12px',
          fontWeight: 600
        }}>
          {connection.isOnline ? (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <Wifi size={15} />
              <span>Conectado a Cloud</span>
            </>
          ) : (
            <>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 8px #f59e0b' }} className="animate-pulse-glow" />
              <WifiOff size={15} />
              <span>Modo Local (Offline)</span>
            </>
          )}
        </div>

        {/* Pending sync counter */}
        {pendingCount > 0 && (
          <button
            onClick={handleManualSync}
            disabled={!connection.isOnline || connection.isSyncing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#f87171',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: connection.isOnline ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease'
            }}
            title={connection.isOnline ? 'Click para subir ventas pendientes a Supabase' : 'Se sincronizarán automáticamente al volver internet'}
          >
            <RefreshCw size={14} className={connection.isSyncing ? 'animate-spin' : ''} />
            <span>{pendingCount} venta{pendingCount > 1 ? 's' : ''} por sincronizar</span>
          </button>
        )}

        {/* Current Shift button */}
        <button
          onClick={onOpenShiftModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: currentShift ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${currentShift ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: currentShift ? '#93c5fd' : '#fca5a5',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <DollarSign size={14} />
          <span>{currentShift ? 'Caja Abierta (F9)' : 'Abrir Caja (F9)'}</span>
        </button>

        {/* Sales history */}
        <button
          onClick={onOpenHistoryModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(51, 65, 85, 0.5)',
            border: '1px solid #334155',
            color: '#cbd5e1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <History size={14} />
          <span>Historial</span>
        </button>

        {/* Web Orders button */}
        <button
          onClick={onOpenWebOrders}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: webOrdersCount > 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(51, 65, 85, 0.5)',
            border: webOrdersCount > 0 ? '1px solid #3b82f6' : '1px solid #334155',
            color: webOrdersCount > 0 ? '#93c5fd' : '#cbd5e1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            position: 'relative'
          }}
          title="Ver pedidos enviados por clientes desde el catálogo web"
        >
          <Globe size={14} />
          <span>Pedidos Web</span>
          {webOrdersCount > 0 && (
            <span style={{
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '10px',
              marginLeft: '2px'
            }}>
              {webOrdersCount}
            </span>
          )}
        </button>
      </div>

      {/* Right: Date, Time & Window Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} color="#94a3b8" />
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
              {time.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: '10px', color: '#64748b' }}>
              {time.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          </div>
        </div>

        {/* Electron Window Controls */}
        {isElectron && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '10px', borderLeft: '1px solid #334155', paddingLeft: '12px' }}>
            <button
              onClick={() => window.desktopAPI.minimizeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
              title="Minimizar"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={() => window.desktopAPI.maximizeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
              title="Maximizar"
            >
              <Square size={12} />
            </button>
            <button
              onClick={() => window.desktopAPI.closeWindow()}
              style={{ background: 'transparent', border: 'none', color: '#f87171', padding: '4px', cursor: 'pointer', borderRadius: '4px' }}
              title="Cerrar"
            >
              <X size={15} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
