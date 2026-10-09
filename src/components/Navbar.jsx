import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Phone, ShoppingBag } from 'lucide-react';
import logoImg from '../assets/Gemini_Generated_Image_idiu8widiu8widiu.jpeg';
import { useCart } from '../context/CartContext';

export default function Navbar({ settings }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cartCount, setIsCartOpen } = useCart();
  const showCart = settings?.show_cart !== false;

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Cierra el menú móvil al cambiar de página
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const whatsappLink = `https://api.whatsapp.com/send?phone=${settings?.global_whatsappPhone || '3794895845'}`;

  const goHome = () => {
    setMenuOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  // Navega a una sección de la Landing (si no estamos ahí, primero vamos a '/')
  const goSection = (id) => {
    setMenuOpen(false);
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    };
    if (location.pathname === '/') {
      scroll();
    } else {
      navigate('/');
      setTimeout(scroll, 400);
    }
  };

  const goPage = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const navLinks = [
    { label: 'Inicio', onClick: goHome },
    { label: 'Nosotros', onClick: () => goSection('nosotros') },
    { label: 'Catálogo', onClick: () => goPage('/catalog') },
    { label: 'Capacitaciones', onClick: () => goSection('capacitaciones') },
    { label: 'Contacto', onClick: () => goPage('/contact') },
  ];

  return (
    <nav
      className="navbar"
      style={{
        background: 'rgba(255,255,255,0.98)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}
    >
      <div className="container nav-container">
        {/* Logo */}
        <button
          onClick={goHome}
          className="logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer'
          }}
        >
          <img
            src={logoImg}
            alt="Serprove Logo"
            style={{ height: '45px', objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
        </button>

        {/* Links desktop */}
        <div className="nav-links" style={{ display: isMobile ? 'none' : 'flex' }}>
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={link.onClick}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                color: 'inherit'
              }}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Carrito */}
          {showCart && (
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label={`Abrir carrito${cartCount > 0 ? `, ${cartCount} productos` : ''}`}
              title="Carrito"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: cartCount > 0 ? 'var(--color-primary)' : '#f0f0f0',
                color: cartCount > 0 ? 'white' : '#555',
                border: '1px solid ' + (cartCount > 0 ? 'var(--color-primary)' : '#ddd'),
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    minWidth: '20px',
                    height: '20px',
                    padding: '0 4px',
                    borderRadius: '10px',
                    background: '#FF5722',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: '800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white',
                    boxSizing: 'border-box'
                  }}
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          )}

          {/* WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{
              padding: isMobile ? '10px 14px' : '12px 24px',
              fontSize: isMobile ? '0.85rem' : '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isMobile ? <Phone size={18} /> : 'WhatsApp'}
          </a>

          {/* Menú móvil */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menú"
            style={{
              display: isMobile ? 'flex' : 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#333'
            }}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            borderBottom: '1px solid #eee'
          }}
        >
          {navLinks.map(link => (
            <button
              key={link.label}
              onClick={link.onClick}
              className="nav-link"
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 0',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'inherit',
                fontSize: '1rem',
                color: '#333',
                width: '100%'
              }}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
