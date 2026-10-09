import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Tag, Factory, CheckCircle2, Plus } from 'lucide-react';
import { useCart } from './context/CartContext';
import Navbar from './components/Navbar';
import { toast } from 'sonner';

// WhatsApp Icon SVG component
const WhatsAppIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

function ProductDetail({ settings }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch product
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        // Fetch related products (same category)
        return fetch('/api/products');
      })
      .then(res => res.json())
      .then(products => {
        const related = products.filter(p => 
          p.category === product?.category && p.id !== product?.id
        ).slice(0, 4);
        setRelatedProducts(related);
      })
      .catch(err => console.error("Error fetching product:", err))
      .finally(() => setIsLoading(false));

  }, [id]);

  useEffect(() => {
    if (settings?.global_primaryColor) {
      document.documentElement.style.setProperty('--color-primary', settings.global_primaryColor);
    }
  }, [settings]);

  const handleAddToCart = () => {
    if (product.stock === 0) {
      toast.error('Este producto está agotado');
      return;
    }
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  };

  const whatsappLink = settings?.global_whatsappPhone 
    ? `https://api.whatsapp.com/send?phone=${settings.global_whatsappPhone}&text=Hola!%20Quiero%20consultar%20por:%20${encodeURIComponent(product?.name || '')}%20-%20${encodeURIComponent(window.location.href)}`
    : 'https://api.whatsapp.com/send?phone=3794895845';

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '3px solid var(--color-bg)', 
            borderTopColor: 'var(--color-primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: 'var(--color-text-light)' }}>Cargando producto...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ marginBottom: '16px' }}>Producto no encontrado</h2>
          <button onClick={() => navigate('/')} className="btn btn-primary">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  const getFeaturedBadge = (featured) => {
    if (!featured || featured === 'none') return null;
    const badges = {
      nuevo: { bg: '#4CAF50', label: '🏆 Nuevo' },
      oferta: { bg: '#FF5722', label: '🔥 Oferta' },
      popular: { bg: '#FFC107', label: '⭐ Popular' }
    };
    return badges[featured];
  };

  const featuredBadge = getFeaturedBadge(product.featured);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Navbar */}
      <Navbar settings={settings} />

      {/* Product Detail */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth < 768 ? '1fr' : '1fr 1fr',
            gap: '48px',
            alignItems: 'start'
          }}>
            {/* Image */}
            <div style={{ position: 'relative' }}>
              <div style={{
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                position: 'relative'
              }}>
                <img 
                  src={product.image || '/product.jpg'} 
                  alt={product.name}
                  style={{ 
                    width: '100%', 
                    height: 'auto',
                    maxHeight: '500px',
                    objectFit: 'cover'
                  }} 
                />
                {product.stock === 0 && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ 
                      color: 'white', 
                      fontWeight: '700', 
                      fontSize: '1.5rem',
                      backgroundColor: '#d32f2f',
                      padding: '8px 24px',
                      borderRadius: '8px'
                    }}>AGOTADO</span>
                  </div>
                )}
                {featuredBadge && (
                  <span style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: featuredBadge.bg,
                    color: featuredBadge.bg === '#FFC107' ? '#333' : 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontWeight: '600',
                    fontSize: '0.9rem'
                  }}>
                    {featuredBadge.label}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div>
              <div style={{ marginBottom: '16px' }}>
                <span className="badge" style={{ margin: 0 }}>{product.category}</span>
              </div>
              
              <h1 style={{ 
                fontSize: '2.5rem', 
                marginBottom: '16px',
                fontFamily: 'var(--font-heading)'
              }}>
                {product.name}
              </h1>

              {/* Price */}
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: 'var(--color-primary)',
                marginBottom: '24px'
              }}>
                {product.price ? `$${Number(product.price).toLocaleString('es-AR')}` : 'Consultar precio'}
              </div>

              {/* Stock status */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '24px',
                padding: '12px 16px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: product.stock === 0 ? '#ffebee' : product.stock <= 5 ? '#fff3e0' : '#e8f5e9'
              }}>
                {product.stock === 0 ? (
                  <>
                    <span style={{ color: '#d32f2f', fontWeight: '600' }}>Sin stock disponible</span>
                  </>
                ) : product.stock <= 5 ? (
                  <>
                    <span style={{ color: '#e65100', fontWeight: '600' }}>¡Últimas unidades!</span>
                    <span style={{ color: '#e65100' }}>(Solo {product.stock} disponibles)</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} style={{ color: '#2e7d32' }} />
                    <span style={{ color: '#2e7d32', fontWeight: '600' }}>Stock disponible</span>
                    <span style={{ color: '#2e7d32' }}>({product.stock} unidades)</span>
                  </>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '12px', fontSize: '1.1rem' }}>Descripción</h3>
                <p style={{ 
                  color: 'var(--color-text-light)', 
                  lineHeight: '1.8',
                  fontSize: '1.05rem'
                }}>
                  {product.description}
                </p>
              </div>

              {/* Meta info */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: '12px',
                marginBottom: '32px',
                padding: '20px',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Factory size={20} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: '500' }}>Laboratorio:</span>
                  <span style={{ color: 'var(--color-text-light)' }}>{product.laboratorio}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Package size={20} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: '500' }}>Categoría:</span>
                  <span style={{ color: 'var(--color-text-light)' }}>{product.category}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Tag size={20} style={{ color: 'var(--color-primary)' }} />
                  <span style={{ fontWeight: '500' }}>Código:</span>
                  <span style={{ color: 'var(--color-text-light)' }}>#{product.id}</span>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '24px' }}>
                {product.stock > 0 ? (
                  settings?.show_cart !== false ? (
                    <button 
                      onClick={handleAddToCart}
                      className="btn btn-primary"
                      style={{ 
                        padding: '12px 24px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Plus size={18} /> Agregar al Carrito
                    </button>
                  ) : (
                    <a 
                      href={whatsappLink} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="btn btn-primary"
                      style={{ 
                        padding: '12px 24px',
                        fontSize: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <ShoppingBag size={18} /> Comprar
                    </a>
                  )
                ) : (
                  <button 
                    disabled 
                    className="btn"
                    style={{ 
                      padding: '12px 24px',
                      fontSize: '1rem',
                      backgroundColor: '#e0e0e0',
                      color: '#9e9e9e',
                      cursor: 'not-allowed'
                    }}
                  >
                    Sin Stock
                  </button>
                )}
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-outline"
                  style={{ 
                    padding: '12px 24px',
                    fontSize: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <WhatsAppIcon size={18} /> Consultar Precio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ padding: '60px 0', backgroundColor: 'white' }}>
          <div className="container">
            <h2 style={{ marginBottom: '32px', textAlign: 'center' }}>Productos Relacionados</h2>
            <div className="product-grid">
              {relatedProducts.map(relProduct => (
                <div 
                  key={relProduct.id} 
                  className="product-card"
                  onClick={() => navigate(`/product/${relProduct.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="product-img-wrapper">
                    <img src={relProduct.image || "/product.jpg"} alt={relProduct.name} />
                  </div>
                  <span className="badge" style={{ margin: 0 }}>{relProduct.category}</span>
                  <h3 className="product-title">{relProduct.name}</h3>
                  <p className="product-desc">{relProduct.description}</p>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '700', 
                    color: 'var(--color-primary)',
                    marginTop: 'auto'
                  }}>
                    {relProduct.price ? `$${Number(relProduct.price).toLocaleString('es-AR')}` : 'Consultar'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Serprove. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default ProductDetail;
