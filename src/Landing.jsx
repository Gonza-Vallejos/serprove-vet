import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from './assets/Gemini_Generated_Image_idiu8widiu8widiu.jpeg';
import { Mail, MapPin, Phone, Clock, Plus } from 'lucide-react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { toast } from 'sonner';

function Landing({ settings }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, []);

  useEffect(() => {
    if (settings?.global_primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.global_primaryColor);
      document.documentElement.style.setProperty('--color-primary-hover', settings.global_primaryColor);
    }
  }, [settings]);

  const whatsappLink = `https://api.whatsapp.com/send?phone=${settings?.global_whatsappPhone || '3794895845'}`;

  const ofertasCount = products.filter(p => p.featured === 'oferta' && p.stock > 0).length;

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Este producto está agotado');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  return (
    <>
      {/* Navbar */}
      <Navbar settings={settings} />

      {/* Hero Section */}
      <section id="inicio" className="hero">
        <div className="container hero-grid">
          <div className="hero-content animate-fade-in">
            <h1>{settings?.inicio_title || 'Cargando...'}</h1>
            <p>{settings?.inicio_subtitle}</p>
            <div className="flex gap-4">
              <a href="/catalog" className="btn btn-primary">Ver Catálogo</a>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn btn-outline">Hacer un Pedido</a>
            </div>
          </div>
          <div className="hero-image-wrapper animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <img src={settings?.inicio_image || '/hero.jpg'} alt="Insumos Veterinarios Premium" />
          </div>
        </div>
      </section>

      {/* Banner Promocional */}
      {settings?.banner_active && (
        <section style={{
          background: `linear-gradient(135deg, var(--color-primary) 0%, #C2185B 100%)`,
          padding: isMobile ? '32px 16px' : '60px 0',
          color: 'white',
          textAlign: 'center'
        }}>
          <div className="container">
            <div style={{
              display: 'grid',
              gridTemplateColumns: settings?.banner_image && !isMobile ? '1fr 1fr' : '1fr',
              gap: isMobile ? '24px' : '40px',
              alignItems: 'center'
            }}>
              <div style={{ textAlign: settings?.banner_image && !isMobile ? 'left' : 'center' }}>
                <h2 style={{
                  fontSize: isMobile ? '1.6rem' : '2.5rem',
                  fontWeight: '800',
                  marginBottom: '12px',
                  color: 'white',
                  fontFamily: 'var(--font-heading)'
                }}>
                  {settings?.banner_title || '¡Ofertas Especiales!'}
                </h2>
                <p style={{
                  fontSize: isMobile ? '1rem' : '1.25rem',
                  marginBottom: isMobile ? '16px' : '24px',
                  opacity: 0.95
                }}>
                  {settings?.banner_subtitle || 'Hasta 30% de descuento en productos seleccionados'}
                </p>
                <a href="#catalogo" className="btn" style={{
                  backgroundColor: 'white',
                  color: 'var(--color-primary)',
                  padding: isMobile ? '12px 24px' : '14px 32px',
                  fontSize: isMobile ? '0.95rem' : '1.1rem'
                }}>
                  Ver Ofertas
                </a>
              </div>
              {settings?.banner_image && (
                <div style={{ textAlign: 'center' }}>
                  <img
                    src={settings.banner_image}
                    alt="Oferta"
                    style={{
                      maxHeight: isMobile ? '150px' : '200px',
                      maxWidth: '100%',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 20px 40px rgba(0,0,0,0.3)'
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* About Us Minimal Section */}
      <section id="nosotros" style={{ backgroundColor: 'white', padding: isMobile ? '40px 0' : '80px 0' }}>
        <div className="container text-center">
          <h2 className="section-title" style={{ fontSize: isMobile ? '1.8rem' : undefined }}>{settings?.nosotros_title}</h2>
          <p className="section-subtitle" style={{ maxWidth: '800px', margin: '0 auto 32px', fontSize: isMobile ? '0.95rem' : undefined }}>
            {settings?.nosotros_text}
          </p>
          <div style={{ display: 'flex', gap: isMobile ? '16px' : '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              minWidth: isMobile ? '140px' : '180px',
              flex: '1 1 140px',
              maxWidth: '250px'
            }}>
              <h3 className="text-primary" style={{ fontSize: isMobile ? '1.6rem' : '2rem', marginBottom: '8px' }}>+100</h3>
              <p style={{ color: 'var(--color-text-light)', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>Clínicas Confían</p>
            </div>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              minWidth: isMobile ? '140px' : '180px',
              flex: '1 1 140px',
              maxWidth: '250px'
            }}>
              <h3 className="text-primary" style={{ fontSize: isMobile ? '1.6rem' : '2rem', marginBottom: '8px' }}>Atención</h3>
              <p style={{ color: 'var(--color-text-light)', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>Personalizada</p>
            </div>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: '12px',
              padding: isMobile ? '20px 16px' : '28px 24px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              minWidth: isMobile ? '140px' : '180px',
              flex: '1 1 140px',
              maxWidth: '250px'
            }}>
              <h3 className="text-primary" style={{ fontSize: isMobile ? '1.6rem' : '2rem', marginBottom: '8px' }}>Eventos</h3>
              <p style={{ color: 'var(--color-text-light)', fontSize: isMobile ? '0.85rem' : '0.95rem' }}>de Capacitación</p>
            </div>
          </div>
        </div>
      </section>

      {/* Catalogo Destacados - Ofertas */}
      <section id="catalogo" style={{ padding: isMobile ? '40px 0' : '80px 0' }}>
        <div className="container">
          <div className="text-center">
            <h2 className="section-title" style={{ fontSize: isMobile ? '1.8rem' : undefined }}>Ofertas Destacadas</h2>
            <p className="section-subtitle" style={{ fontSize: isMobile ? '0.95rem' : undefined }}>
              Conocé nuestras promociones especiales
            </p>
          </div>

          {/* Oferta Products Preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {products
              .filter(p => p.featured === 'oferta' && p.stock > 0)
              .slice(0, 4)
              .map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    border: '1px solid rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{
                    width: '100%',
                    height: '150px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    position: 'relative'
                  }}>
                    <img src={product.image || '/product.jpg'} alt={product.name} style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }} />
                    <span style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '3px 8px',
                      borderRadius: '10px',
                      fontSize: '0.7rem',
                      fontWeight: '600',
                      backgroundColor: '#FF5722',
                      color: 'white'
                    }}>
                      🔥 Oferta
                    </span>
                  </div>
                  <span style={{
                    display: 'inline-block',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    color: 'var(--color-primary)',
                    marginBottom: '8px',
                    alignSelf: 'flex-start'
                  }}>
                    {product.category}
                  </span>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '6px', fontWeight: '600', color: '#333' }}>{product.name}</h3>
                  {settings?.show_prices !== false && (
                    <p style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '10px' }}>
                      {product.price ? `$${Number(product.price).toLocaleString('es-AR')}` : 'Consultar'}
                    </p>
                  )}
                  {settings?.show_stock !== false && (
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px' }}>
                      Stock: {product.stock} unidades
                    </p>
                  )}
                  {settings?.show_cart !== false ? (
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stock === 0}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: product.stock === 0 ? '#ccc' : '#25D366',
                        color: 'white',
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} />
                      {product.stock === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); window.open(whatsappLink, '_blank'); }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'var(--color-primary)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}
                    >
                      Comprar por WhatsApp
                    </button>
                  )}
                </div>
              ))}
          </div>

          {/* Ver Catalogo Completo Button */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/catalog"
              className="btn btn-outline"
              style={{
                padding: isMobile ? '12px 28px' : '14px 36px',
                fontSize: isMobile ? '0.95rem' : '1.05rem',
                borderColor: 'var(--color-primary)',
                color: 'var(--color-primary)'
              }}
            >
              Ver Catálogo Completo
            </a>
          </div>
        </div>
      </section>

      {/* Capacitaciones Section */}
      <section id="capacitaciones" className="section" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: isMobile ? '40px 0' : '80px 0' }}>
        <div className="container text-center">
          <h2 className="section-title" style={{ color: 'white' }}>{settings?.capacitaciones_title}</h2>
          <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '800px', margin: '0 auto 32px' }}>
            {settings?.capacitaciones_text}
          </p>
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="btn" style={{ backgroundColor: 'white', color: 'var(--color-primary)' }}>
            Consultar Próximas Fechas
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="logo" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                <img src={logoImg} alt="Serprove Logo" style={{ height: '55px', objectFit: 'contain', backgroundColor: 'white', padding: '8px', borderRadius: '8px' }} />
              </div>
              <p className="footer-text">Soluciones integrales para veterinarias y petshops.</p>
              {/* Redes Sociales */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
                {settings?.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.target.style.color = '#E1306C'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
                {settings?.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.target.style.color = '#1877F2'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {settings?.social_twitter && (
                  <a href={settings.social_twitter} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}
                    onMouseOver={(e) => e.target.style.color = '#1DA1F2'}
                    onMouseOut={(e) => e.target.style.color = 'rgba(255,255,255,0.7)'}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                )}
              </div>
            </div>
            <div>
              <h4 className="footer-title">Contacto</h4>
              {settings?.contact_phone && (
                <p className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={16} /> {settings.contact_phone}
                </p>
              )}
              {settings?.contact_email && (
                <p className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={16} /> {settings.contact_email}
                </p>
              )}
              {settings?.contact_address && (
                <p className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> {settings.contact_address}
                </p>
              )}
              {settings?.contact_schedule && (
                <p className="footer-text" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px' }}>
                  <Clock size={16} /> {settings.contact_schedule}
                </p>
              )}
            </div>
            <div>
              <h4 className="footer-title">Enlaces</h4>
              <a href="#inicio" className="footer-text" style={{ display: 'block' }}>Inicio</a>
              <a href="#nosotros" className="footer-text" style={{ display: 'block' }}>Nosotros</a>
              <a href="/catalog" className="footer-text" style={{ display: 'block' }}>Catálogo</a>
              <a href="#capacitaciones" className="footer-text" style={{ display: 'block' }}>Capacitaciones</a>
              <a href="/contact" className="footer-text" style={{ display: 'block' }}>Contacto</a>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Serprove. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </>
  );
}

export default Landing;
