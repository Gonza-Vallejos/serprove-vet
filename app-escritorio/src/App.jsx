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
import { syncEngine } from './services/syncEngine';
import { webOrdersEngine } from './services/webOrdersEngine';
import { db } from './db/localDb';

export function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);

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

  const searchInputRef = useRef(null);

  // Carga inicial de catálogo y turno
  const loadData = useCallback(async () => {
    // 1. Cargar productos desde motor de sincronización (Offline-First)
    const prods = await syncEngine.pullProducts();
    setProducts(prods);

    // 2. Verificar si hay un turno de caja abierto
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
          return prev; // No superar stock disponible
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
  };

  // Carga un pedido recibido desde la web directamente en la caja para cobrar
  const handleLoadWebOrderToCart = (webOrder) => {
    setActiveWebOrderId(webOrder.id);
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

      // Limpiar venta actual y cerrar modal de cobro
      setIsPaymentOpen(false);
      setCart([]);
      setDiscount(0);

      // Abrir modal de ticket e impresión
      setIsTicketOpen(true);

      // Refrescar catálogo local para reflejar nuevo stock descontado
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

  // Reimprimir ticket desde el historial
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
      // F2: Enfocar buscador de productos
      if (e.key === 'F2') {
        e.preventDefault();
        searchInputRef.current?.focus();
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
        else if (cart.length > 0) {
          if (window.confirm('¿Deseas vaciar la venta actual?')) {
            handleClearCart();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, [cart, isPaymentOpen, isTicketOpen, isShiftOpen, isHistoryOpen]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Invisible Barcode Scanner Listener for physical USB scanners */}
      <BarcodeListener onScan={handleAddToCart} products={products} />

      {/* POS Top Header */}
      <POSHeader
        onOpenShiftModal={() => setIsShiftOpen(true)}
        onOpenHistoryModal={() => setIsHistoryOpen(true)}
        currentShift={currentShift}
        onOpenWebOrders={() => setIsWebOrdersOpen(true)}
        webOrdersCount={webOrders.filter(o => o.status === 'pendiente' || o.status === 'en_preparacion').length}
      />

      {/* Main Content: Split into Catalog (Left) and Cart (Right) */}
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

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        total={total}
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

      {/* Shift (Apertura y Cierre de Caja) Modal */}
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

      {/* Web Orders from Online Catalog Modal */}
      <WebOrdersModal
        isOpen={isWebOrdersOpen}
        onClose={() => setIsWebOrdersOpen(false)}
        orders={webOrders}
        onLoadOrderToCart={handleLoadWebOrderToCart}
      />
    </div>
  );
}
