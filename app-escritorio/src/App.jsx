import React, { useState, useEffect, useRef, useCallback } from 'react';
import { POSHeader } from './components/POSHeader';
import { ProductCatalog } from './components/ProductCatalog';
import { Cart } from './components/Cart';
import { BarcodeListener } from './components/BarcodeListener';
import { PaymentModal } from './components/PaymentModal';
import { TicketModal } from './components/TicketModal';
import { ShiftModal } from './components/ShiftModal';
import { SalesHistoryModal } from './components/SalesHistoryModal';
import { WebOrdersModal } from './components/WebOrdersModal';
import { WebOrdersView } from './components/WebOrdersView';
import { syncEngine } from './services/syncEngine';
import { webOrdersEngine } from './services/webOrdersEngine';
import { db } from './db/localDb';

export function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

  // View state: 'pos' (Mostrador) o 'web_orders' (Pedidos Web)
  const [activeTab, setActiveTab] = useState('pos');

  // Modals state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [isShiftOpen, setIsShiftOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWebOrdersOpen, setIsWebOrdersOpen] = useState(false);

  // Active Sale, Current Shift & Web Orders
  const [completedSale, setCompletedSale] = useState(null);
  const [completedSaleItems, setCompletedSaleItems] = useState([]);
  const [currentShift, setCurrentShift] = useState(null);
  const [webOrders, setWebOrders] = useState([]);
  const [activeWebOrderId, setActiveWebOrderId] = useState(null);
  const [customerNameForPayment, setCustomerNameForPayment] = useState('Consumidor Final');

  const searchInputRef = useRef(null);

  // Carga inicial de catálogo y turno
  const loadData = useCallback(async () => {
    const prods = await syncEngine.pullProducts();
    setProducts(prods);

    const activeShift = await db.cash_shifts.where('status').equals('open').first();
    setCurrentShift(activeShift || null);
  }, []);

  useEffect(() => {
    loadData();
    const unsub = webOrdersEngine.subscribe((orders) => {
      setWebOrders(orders);
    });
    return () => unsub();
  }, [loadData]);

  // Manejo de agregar al carrito (manual o escaneado)
  const handleAddToCart = useCallback((product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        if (product.stock <= 0) return prev;
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  }, []);

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && newQty > product.stock) return;

    setCart((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscount(0);
    setActiveWebOrderId(null);
    setCustomerNameForPayment('Consumidor Final');
  };

  // Carga un pedido recibido desde la web directamente en la caja para cobrar
  const handleLoadWebOrderToCart = (webOrder) => {
    setActiveTab('pos');
    setActiveWebOrderId(webOrder.id);
    setCustomerNameForPayment(webOrder.customer_name || 'Cliente Web');

    const loadedItems = (webOrder.items || []).map(it => {
      const existingProduct = products.find(p => String(p.id) === String(it.id));
      return {
        id: String(it.id),
        name: it.name,
        price: Number(it.price) || 0,
        quantity: Number(it.quantity) || 1,
        stock: existingProduct ? existingProduct.stock : 99,
        category: existingProduct ? existingProduct.category : 'General',
        barcode: existingProduct ? existingProduct.barcode : ''
      };
    });

    setCart(loadedItems);
    setDiscount(0);
    setIsPaymentOpen(true);
  };

  // Cálculo del total actual
  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const total = Math.max(0, subtotal - discount);

  // Confirmación de venta
  const handleConfirmSale = async (paymentDetails) => {
    try {
      const result = await syncEngine.recordSaleOfflineFirst({
        items: cart,
        paymentMethod: paymentDetails.paymentMethod,
        amountPaid: paymentDetails.amountPaid,
        changeAmount: paymentDetails.changeAmount,
        discount,
        customerName: paymentDetails.customerName,
        customerCuit: paymentDetails.customerCuit,
        invoiceType: paymentDetails.invoiceType,
        shiftId: currentShift?.id || null
      });

      // Si la venta provino de un pedido web, marcarlo como facturado
      if (activeWebOrderId) {
        await webOrdersEngine.updateOrderStatus(activeWebOrderId, 'facturado');
        setActiveWebOrderId(null);
      }

      setCompletedSale(result.sale);
      setCompletedSaleItems(result.items);

      setIsPaymentOpen(false);
      setCart([]);
      setDiscount(0);
      setCustomerNameForPayment('Consumidor Final');

      setIsTicketOpen(true);

      const updatedProds = await db.products.toArray();
      setProducts(updatedProds);
    } catch (err) {
      console.error('Error al registrar venta:', err);
      alert('Error guardando la venta: ' + err.message);
    }
  };

  // Manejo de Turnos / Caja
  const handleOpenShift = async (openingAmount) => {
    const shiftId = crypto.randomUUID ? crypto.randomUUID() : `shift-${Date.now()}`;
    const newShift = {
      id: shiftId,
      opened_at: new Date().toISOString(),
      closed_at: null,
      opening_amount: openingAmount,
      closing_amount: null,
      status: 'open'
    };

    await db.cash_shifts.add(newShift);
    setCurrentShift(newShift);
    setIsShiftOpen(false);
  };

  const handleCloseShift = async (closeData) => {
    if (!currentShift) return;

    await db.cash_shifts.update(currentShift.id, {
      closed_at: new Date().toISOString(),
      closing_amount: closeData.closingAmount,
      expected_amount: closeData.expectedAmount,
      difference: closeData.difference,
      status: 'closed'
    });

    setCurrentShift(null);
    setIsShiftOpen(false);
    alert('Turno de caja cerrado con éxito. Se generó el arqueo de caja.');
  };

  const handleReprintTicket = async (sale) => {
    const items = await db.sale_items.where('sale_id').equals(sale.id).toArray();
    setCompletedSale(sale);
    setCompletedSaleItems(items);
    setIsHistoryOpen(false);
    setIsTicketOpen(true);
  };

  // Atajos de teclado globales ergonómicos
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      // F2: Ir a Mostrador / Enfocar buscador
      if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('pos');
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
      // F6: Conmutar entre Mostrador POS y Pedidos Web
      else if (e.key === 'F6') {
        e.preventDefault();
        setActiveTab(prev => prev === 'pos' ? 'web_orders' : 'pos');
      }
      // F4: Abrir Cobro
      else if (e.key === 'F4') {
        e.preventDefault();
        if (cart.length > 0 && !isPaymentOpen) {
          setIsPaymentOpen(true);
        }
      }
      // F9: Abrir/Cerrar Caja
      else if (e.key === 'F9') {
        e.preventDefault();
        setIsShiftOpen(prev => !prev);
      }
      // Escape: Cerrar modales o limpiar carrito
      else if (e.key === 'Escape') {
        if (isPaymentOpen) setIsPaymentOpen(false);
        else if (isTicketOpen) setIsTicketOpen(false);
        else if (isShiftOpen) setIsShiftOpen(false);
        else if (isHistoryOpen) setIsHistoryOpen(false);
        else if (isWebOrdersOpen) setIsWebOrdersOpen(false);
        else if (cart.length > 0) {
          if (window.confirm('¿Deseas vaciar la venta actual?')) {
            handleClearCart();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [cart, isPaymentOpen, isTicketOpen, isShiftOpen, isHistoryOpen, isWebOrdersOpen]);

  const pendingWebOrders = webOrders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion');
  const latestPendingOrder = pendingWebOrders[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Scanner listener */}
      <BarcodeListener onScan={handleAddToCart} products={products} />

      {/* POS Top Header with persistent view switchers */}
      <POSHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenShiftModal={() => setIsShiftOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        currentShift={currentShift}
        webOrdersCount={pendingWebOrders.length}
      />

      {/* Top Banner Alert for Incoming Web Orders when working on POS counter */}
      {activeTab === 'pos' && pendingWebOrders.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, #1e3a8a, #2563eb, #1e3a8a)',
          borderBottom: '1px solid #3b82f6',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
          zIndex: 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>🔔</span>
            <span style={{ fontWeight: 800, fontSize: '13px' }}>
              ¡Tenés {pendingWebOrders.length} pedido{pendingWebOrders.length > 1 ? 's' : ''} web en espera!
            </span>
            {latestPendingOrder && (
              <span style={{ fontSize: '12px', color: '#bfdbfe' }}>
                • Último: <b>{latestPendingOrder.order_number}</b> de <b>{latestPendingOrder.customer_name}</b> (${Number(latestPendingOrder.total).toLocaleString('es-AR')})
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {latestPendingOrder && (
              <button
                onClick={() => handleLoadWebOrderToCart(latestPendingOrder)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  background: '#10b981',
                  border: 'none',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(16, 185, 129, 0.4)'
                }}
              >
                📥 Cobrar este pedido ahora [F4]
              </button>
            )}
            <button
              onClick={() => setActiveTab('web_orders')}
              style={{
                padding: '5px 12px',
                borderRadius: '6px',
                background: 'rgba(255,255,255,0.15)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Ver todos ({pendingWebOrders.length}) [F6]
            </button>
          </div>
        </div>
      )}

      {/* Main Content: Web Orders View OR Split POS (Catalog + Cart) */}
      {activeTab === 'web_orders' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <WebOrdersView
            orders={webOrders}
            onLoadOrderToCart={handleLoadWebOrderToCart}
            onSwitchToPOS={() => setActiveTab('pos')}
          />
        </div>
      ) : (
        <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div style={{ flex: 1, height: '100%' }}>
            <ProductCatalog
              products={products}
              onAddToCart={handleAddToCart}
              searchInputRef={searchInputRef}
            />
          </div>

          <Cart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            discount={discount}
            onDiscountChange={setDiscount}
            onOpenPayment={() => setIsPaymentOpen(true)}
          />
        </main>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
        defaultCustomerName={customerNameForPayment}
        onConfirmSale={handleConfirmSale}
      />

      {/* Ticket Preview & Print Modal */}
      <TicketModal
        isOpen={isTicketOpen}
        onClose={() => setIsTicketOpen(false)}
        sale={completedSale}
        items={completedSaleItems}
        onNewSale={() => setIsTicketOpen(false)}
      />

      {/* Shift Modal */}
      <ShiftModal
        isOpen={isShiftOpen}
        onClose={() => setIsShiftOpen(false)}
        currentShift={currentShift}
        onOpenShift={handleOpenShift}
        onCloseShift={handleCloseShift}
      />

      {/* Sales History Modal */}
      <SalesHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onReprintTicket={handleReprintTicket}
      />

      {/* Web Orders Modal (también accesible por compatibilidad) */}
      <WebOrdersModal
        isOpen={isWebOrdersOpen}
        onClose={() => setIsWebOrdersOpen(false)}
        orders={webOrders}
        onLoadOrderToCart={handleLoadWebOrderToCart}
      />
    </div>
  );
}

