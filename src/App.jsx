import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import Landing from './Landing';
import Admin from './Admin';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';
import ProductDetail from './ProductDetail';
import Contact from './Contact';
import Catalog from './Catalog';
import { CartProvider } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import './index.css';

function AppContent() {
  const [settings, setSettings] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/settings')
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error('Error fetching settings:', err));
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing settings={settings} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/product/:id" element={<ProductDetail settings={settings} />} />
        <Route path="/contact" element={<Contact settings={settings} />} />
        <Route path="/catalog" element={<Catalog settings={settings} />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {settings?.show_cart !== false && <CartDrawer settings={settings} isMobile={isMobile} />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'var(--font-body)',
          },
        }}
      />
      <CartProvider>
        <AppContent />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
