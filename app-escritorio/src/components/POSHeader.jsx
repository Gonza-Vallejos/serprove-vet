import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw, Clock, DollarSign, History, Minus, Square, X, AlertTriangle, Globe } from 'lucide-react';
import { syncEngine } from '../services/syncEngine';
import { db } from '../db/localDb';

export function POSHeader({
  activeTab = 'pos',
  onTabChange,
  onOpenShiftModal,
  onOpenHistoryModal,
  currentShift,
  webOrdersCount = 0
}) {
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
      height: '66px',
      background: 'linear-gradient(to right, #0a0f1d, #141b2d, #0a0f1d)',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      userSelect: 'none',
      zIndex: 100
    }}>
      {/* Left: Brand & Navigation Mode Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '19px',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(236, 72, 153, 0.4)'
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
              Punto de Venta Local • Sincronización Supabase
            </div>
          </div>
        </div>

        {/* PRIMARY VIEW SWITCHER TABS: Mostrador POS vs Pedidos Web */}
        <div style={{
          display: 'flex',
          background: '#090d16',
          border: '1px solid #1e293b',
          borderRadius: '10px',
          padding: '3px',
          marginLeft: '8px'
        }}>
          <button
            onClick={() => onTabChange && onTabChange('pos')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 16px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'pos' ? 'linear-gradient(135deg, #ec4899, #8b5cf6)' : 'transparent',
              color: activeTab === 'pos' ? '#ffffff' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeTab === 'pos' ? '0 2px 10px rgba(236, 72, 153, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🛒 Mostrador POS</span>
            <span style={{ fontSize: '10px', opacity: 0.8, background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px' }}>[F2]</span>
          </button>

          <button
            onClick={() => onTabChange && onTabChange('web_orders')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 18px',
              borderRadius: '7px',
              border: 'none',
              background: activeTab === 'web_orders' ? 'linear-gradient(135deg, #2563eb, #1d4ed8)' : 'transparent',
              color: activeTab === 'web_orders' ? '#ffffff' : webOrdersCount > 0 ? '#60a5fa' : '#94a3b8',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeTab === 'web_orders' ? '0 2px 10px rgba(37, 99, 235, 0.4)' : 'none',
              transition: 'all 0.15s ease',
              position: 'relative'
            }}
          >
            <Globe size={15} />
            <span>Pedidos Web</span>
            <span style={{ fontSize: '10px', opacity: 0.8, background: 'rgba(0,0,0,0.2)', padding: '1px 5px', borderRadius: '4px' }}>[F6]</span>
            {webOrdersCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 800,
                padding: '2px 7px',
                borderRadius: '12px',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.7)',
                marginLeft: '2px',
                animation: 'pulse 1.5s infinite'
              }}>
                {webOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Center & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Connection status badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '6px 10px',
          borderRadius: '8px',
          background: connection.isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.15)',
          border: `1px solid ${connection.isOnline ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.4)'}`,
          color: connection.isOnline ? '#34d399' : '#fbbf24',
          fontSize: '11px',
          fontWeight: 600
        }}>
          {connection.isOnline ? (
            <>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <Wifi size={14} />
              <span>Cloud Conectado</span>
            </>
          ) : (
            <>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
              <WifiOff size={14} />
              <span>Modo Local</span>
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
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: connection.isOnline ? 'pointer' : 'not-allowed'
            }}
          >
            <RefreshCw size={13} className={connection.isSyncing ? 'animate-spin' : ''} />
            <span>{pendingCount} por sincronizar</span>
          </button>
        )}

        {/* Current Shift button */}
        <button
          onClick={onOpenShiftModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: currentShift ? 'rgba(59, 130, 246, 0.12)' : 'rgba(239, 68, 68, 0.12)',
            border: `1px solid ${currentShift ? 'rgba(59, 130, 246, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            color: currentShift ? '#93c5fd' : '#fca5a5',
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <DollarSign size={13} />
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
            padding: '6px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <History size={13} />
          <span>Historial</span>
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
