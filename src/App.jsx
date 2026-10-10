import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { supabase } from './supabaseClient';
import './index.css';

function AppContent() {
  const [settings, setSettings] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 1)
          .single();
        
        if (error) throw error;
        setSettings(data);
      } catch (err) {
        console.error('Error fetching settings from Supabase:', err);
      }
    };

    fetchSettings();
  }, [location.pathname]);

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
