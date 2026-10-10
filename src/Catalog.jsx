import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, SlidersHorizontal, Phone, Mail, MapPin, Plus } from 'lucide-react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { toast } from 'sonner';

const PRODUCTS_PER_PAGE = 8;

function Catalog({ settings }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));


    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  useEffect(() => {
    if (settings?.global_primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.global_primaryColor);
    }
  }, [settings]);

  const whatsappLink = `https://api.whatsapp.com/send?phone=${settings?.global_whatsappPhone || '3794895845'}`;

  const handleAddToCart = (product) => {
    if (product.stock === 0) {
      toast.error('Este producto está agotado');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const availableProducts = products.filter(p => p.stock > 0);

  const ofertasCount = products.filter(p => p.featured === 'oferta' && p.stock > 0).length;

  const filteredProducts = products
    .filter(product => {
      if (selectedCategory === 'ofertas') {
        return product.featured === 'oferta' && product.stock > 0;
      }
      return product.stock > 0 && (selectedCategory === 'all' || product.category === selectedCategory);
    })
    .sort((a, b) => {
      if (sortOrder === 'price-asc') return Number(a.price || 0) - Number(b.price || 0);
      if (sortOrder === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      if (sortOrder === 'name') return a.name.localeCompare(b.name);
      if (sortOrder === 'stock') return Number(b.stock || 0) - Number(a.stock || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Navbar */}
      <Navbar settings={settings} />

      {/* Header */}
      <section style={{
        background: `linear-gradient(135deg, var(--color-primary) 0%, #C2185B 100%)`,
        padding: isMobile ? '28px 16px' : '40px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{ color: 'white', marginBottom: '8px', fontSize: isMobile ? '1.6rem' : '2rem' }}>
          {settings?.catalogo_title || 'Catálogo'}
        </h1>
        <p style={{ opacity: 0.9, fontSize: isMobile ? '0.9rem' : '1rem' }}>
          {settings?.catalogo_subtitle || 'Todos nuestros productos'}
        </p>
      </section>

      {/* Filters */}
      <div style={{ padding: isMobile ? '16px 12px' : '20px', background: 'white', borderBottom: '1px solid #eee' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', flexWrap: 'nowrap' }}>
            <button
              onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                background: selectedCategory === 'all' ? 'var(--color-primary)' : 'white',
                color: selectedCategory === 'all' ? 'white' : '#333',
                border: selectedCategory === 'all' ? 'none' : '1px solid #e0e0e0',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '0.85rem'
              }}
            >
              Todos
            </button>
            {ofertasCount > 0 && (
              <button
                onClick={() => { setSelectedCategory('ofertas'); setCurrentPage(1); }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  background: selectedCategory === 'ofertas' ? '#FF5722' : 'white',
                  color: selectedCategory === 'ofertas' ? 'white' : '#FF5722',
                  border: selectedCategory === 'ofertas' ? 'none' : '1px solid #FF5722',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.85rem'
                }}
              >
                🔥 Ofertas
              </button>
            )}
            {categories.map(cat => {
              const count = availableProducts.filter(p => p.category === cat.name).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.name); setCurrentPage(1); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    background: selectedCategory === cat.name ? 'var(--color-primary)' : 'white',
                    color: selectedCategory === cat.name ? 'white' : '#333',
                    border: selectedCategory === cat.name ? 'none' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '0.85rem'
                  }}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={16} style={{ color: '#999' }} />
              <div style={{ position: 'relative' }}>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{
                    padding: '8px 36px 8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    backgroundColor: 'white',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    color: '#333',
                    minWidth: '150px'
                  }}
                >
                  <option value="default">Ordenar</option>
                  <option value="price-asc">Menor Precio</option>
                  <option value="price-desc">Mayor Precio</option>
                  <option value="name">Nombre A-Z</option>
                  <option value="stock">Mayor Stock</option>
                </select>
                <div style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                  color: '#666'
                }}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M2 4l4 4 4-4" stroke="#666" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <section style={{ padding: isMobile ? '20px 12px' : '24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {products.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Cargando catálogo...</p>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: '20px'
              }}>
                {filteredProducts
                  .slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE)
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
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Image */}
                      <div style={{
                        width: '100%',
                        height: '160px',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '8px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <img
                          src={product.image || '/product.jpg'}
                          alt={product.name}
                          style={{ maxWidth: '80%', maxHeight: '80%', objectFit: 'contain' }}
                        />
                        {product.stock === 0 && (
                          <div style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            <span style={{ color: 'white', fontWeight: '700', fontSize: '0.8rem', backgroundColor: '#d32f2f', padding: '4px 10px', borderRadius: '4px' }}>AGOTADO</span>
                          </div>
                        )}
                        {product.featured && product.featured !== 'none' && (
                          <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            backgroundColor: product.featured === 'oferta' ? '#FF5722' : product.featured === 'nuevo' ? '#4CAF50' : '#FFC107',
                            color: product.featured === 'popular' ? '#333' : 'white'
                          }}>
                            {product.featured === 'nuevo' && '🏆 Nuevo'}
                            {product.featured === 'oferta' && '🔥 Oferta'}
                            {product.featured === 'popular' && '⭐ Popular'}
                          </span>
                        )}
                      </div>

                      {/* Category badge */}
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

                      <h3 style={{ fontSize: '0.95rem', marginBottom: '6px', fontWeight: '600', color: '#333' }}>
                        {product.name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '12px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {product.description}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {settings?.show_prices !== false && (
                            <span style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                              {product.price ? `$${Number(product.price).toLocaleString('es-AR')}` : 'Consultar'}
                            </span>
                          )}
                          {settings?.show_stock !== false && (
                            <span style={{ fontSize: '0.75rem', color: product.stock === 0 ? '#dc2626' : '#888' }}>
                              {product.stock === 0 ? 'Sin stock' : `${product.stock} disponibles`}
                            </span>
                          )}
                        </div>
                        {settings?.show_cart !== false ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                            disabled={product.stock === 0}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: 'none',
                              background: product.stock === 0 ? '#ccc' : '#25D366',
                              color: 'white',
                              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={14} />
                            {product.stock === 0 ? 'Sin Stock' : 'Agregar'}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); if (product.stock > 0) window.open(whatsappLink, '_blank'); }}
                            style={{
                              padding: '6px 12px',
                              borderRadius: '6px',
                              border: product.stock === 0 ? '1px solid #ddd' : 'none',
                              background: product.stock === 0 ? '#f5f5f5' : 'var(--color-primary)',
                              color: product.stock === 0 ? '#999' : 'white',
                              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: '500'
                            }}
                          >
                            {product.stock === 0 ? 'Sin Stock' : 'Comprar'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      background: 'white',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                      if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            style={{
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: currentPage === page ? 'none' : '1px solid #e0e0e0',
                              background: currentPage === page ? 'var(--color-primary)' : 'white',
                              color: currentPage === page ? 'white' : '#333',
                              cursor: 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: '500',
                              minWidth: '40px'
                            }}
                          >
                            {page}
                          </button>
                        );
                      } else if (page === currentPage - 2 || page === currentPage + 2) {
                        return <span key={page} style={{ padding: '0 4px', color: '#999', display: 'flex', alignItems: 'center' }}>...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0',
                      background: 'white',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage >= totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1a1a2e', color: 'white', padding: isMobile ? '32px 16px' : '48px 16px', marginTop: '40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '24px' : '40px', marginBottom: '32px' }}>
            {/* Logo & Description */}
            <div>
              <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '12px', fontWeight: '700' }}>
                SERPR<span style={{ color: 'var(--color-primary)' }}>+</span>VE
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.6', margin: 0 }}>
                Soluciones integrales para veterinarias y petshops del norte argentino.
              </p>
              {/* Social Icons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                {settings?.social_instagram && (
                  <a href={settings.social_instagram} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                  </a>
                )}
                {settings?.social_facebook && (
                  <a href={settings.social_facebook} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                  </a>
                )}
                {settings?.social_twitter && (
                  <a href={settings.social_twitter} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                  </a>
                )}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Contacto</h4>
              {settings?.contact_phone && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} /> {settings.contact_phone}
                </p>
              )}
              {settings?.contact_email && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={14} /> {settings.contact_email}
                </p>
              )}
              {settings?.contact_address && (
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} /> {settings.contact_address}
                </p>
              )}
            </div>

            {/* Links */}
            <div>
              <h4 style={{ color: 'white', fontSize: '1rem', marginBottom: '16px' }}>Enlaces</h4>
              <a href="/" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px' }}>Inicio</a>
              <a href="/catalog" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px' }}>Catálogo</a>
              <a href="/contact" style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', marginBottom: '8px' }}>Contacto</a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>
              © {new Date().getFullYear()} Serprove. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Catalog;
