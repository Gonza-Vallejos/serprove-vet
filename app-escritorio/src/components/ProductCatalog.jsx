import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Barcode, Tag, Plus, Check } from 'lucide-react';

export function ProductCatalog({ products = [], onAddToCart, searchInputRef }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [recentlyAddedId, setRecentlyAddedId] = useState(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ['Todos', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchesSearch = !term ||
        p.name.toLowerCase().includes(term) ||
        (p.barcode && p.barcode.toLowerCase().includes(term)) ||
        (p.laboratorio && p.laboratorio.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAdd = (product) => {
    onAddToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 600);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#090d16',
      borderRight: '1px solid #1e293b',
      overflow: 'hidden'
    }}>
      {/* Search Bar & Categories */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b', background: '#0f172a' }}>
        {/* Search input with shortcut hint */}
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, código de barras (EAN-13) o laboratorio... [F2]"
            style={{
              width: '100%',
              padding: '12px 14px 12px 42px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '10px',
              color: '#f8fafc',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#334155';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: '#334155',
                border: 'none',
                color: '#cbd5e1',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: selectedCategory === cat ? '1px solid #3b82f6' : '1px solid #334155',
                background: selectedCategory === cat ? 'linear-gradient(135deg, #1d4ed8, #2563eb)' : '#1e293b',
                color: selectedCategory === cat ? '#ffffff' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '14px',
        alignContent: 'start'
      }}>
        {filteredProducts.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: '#94a3b8' }}>No se encontraron productos</div>
            <div style={{ fontSize: '13px' }}>Prueba con otro término de búsqueda o código de barras.</div>
          </div>
        ) : (
          filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;
            const isJustAdded = recentlyAddedId === product.id;

            return (
              <div
                key={product.id}
                onClick={() => !isOutOfStock && handleAdd(product)}
                style={{
                  background: isJustAdded ? 'rgba(16, 185, 129, 0.15)' : '#0f172a',
                  border: isJustAdded ? '1px solid #10b981' : '1px solid #1e293b',
                  borderRadius: '12px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isOutOfStock) {
                    e.currentTarget.style.borderColor = isJustAdded ? '#10b981' : '#1e293b';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {/* Top: Category & Stock badge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', fontWeight: 600 }}>
                      {product.category}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: isOutOfStock ? 'rgba(239, 68, 68, 0.2)' : isLowStock ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: isOutOfStock ? '#f87171' : isLowStock ? '#fbbf24' : '#34d399',
                      border: `1px solid ${isOutOfStock ? 'rgba(239, 68, 68, 0.3)' : isLowStock ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
                    }}>
                      {isOutOfStock ? 'Agotado' : `Stock: ${product.stock}`}
                    </span>
                  </div>

                  {/* Product Name */}
                  <h3 style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#f8fafc',
                    lineHeight: '1.3',
                    marginBottom: '4px',
                    minHeight: '36px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>

                  {/* Laboratory and Barcode */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {product.laboratorio && (
                      <span style={{ fontSize: '11px', color: '#60a5fa', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Tag size={11} /> {product.laboratorio}
                      </span>
                    )}
                    {product.barcode && (
                      <span style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        color: '#64748b',
                        background: '#1e293b',
                        padding: '1px 5px',
                        borderRadius: '3px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px'
                      }}>
                        <Barcode size={10} /> {product.barcode}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bottom: Price & Quick Add Button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  paddingTop: '8px',
                  borderTop: '1px solid #1e293b'
                }}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 800,
                    color: '#10b981'
                  }}>
                    ${Number(product.price).toLocaleString('es-AR')}
                  </div>

                  <button
                    disabled={isOutOfStock}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: isJustAdded ? '#10b981' : '#2563eb',
                      border: 'none',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      transition: 'background 0.2s ease, transform 0.1s ease'
                    }}
                  >
                    {isJustAdded ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
