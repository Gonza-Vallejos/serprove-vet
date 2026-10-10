import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, Plus, Settings, Package, Tags, Edit3, X, Check, Search, Shield, Clock, TrendingUp, AlertTriangle, DollarSign, PackageX, BarChart3, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from './supabaseClient';

function Admin() {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({
    global_primaryColor: '#E91E63',
    global_whatsappPhone: '',
    contact_email: '',
    contact_phone: '',
    contact_address: '',
    contact_schedule: '',
    social_instagram: '',
    social_facebook: '',
    social_twitter: '',
    inicio_title: '',
    inicio_subtitle: '',
    inicio_image: '',
    banner_title: '',
    banner_subtitle: '',
    banner_image: '',
    banner_active: true,
    nosotros_title: '',
    nosotros_text: '',
    catalogo_title: '',
    catalogo_subtitle: '',
    capacitaciones_title: '',
    capacitaciones_text: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState({ username: '', expiresAt: null, timeRemaining: 0 });
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    category: '',
    laboratorio: '',
    price: '',
    stock: 0,
    featured: 'none',
    image: '/product.jpg'
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '' });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const navigate = useNavigate();

  // Session timeout check
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return false;
      }

      setSessionInfo({
        username: session.user.email,
        expiresAt: session.expires_at * 1000,
        timeRemaining: Math.ceil((session.expires_at * 1000 - Date.now()) / 1000)
      });
      return true;
    };

    checkSession().then((isValid) => {
      if (isValid) {
        fetchProducts();
        fetchCategories();
        fetchSettings();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/login');
      } else if (session) {
        setSessionInfo({
          username: session.user.email,
          expiresAt: session.expires_at * 1000,
          timeRemaining: Math.ceil((session.expires_at * 1000 - Date.now()) / 1000)
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      setCategories(data || []);
      if (data?.length > 0 && !newProduct.category) {
        setNewProduct(prev => ({ ...prev, category: data[0].name }));
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error("Error fetching settings:", err);
    }
  };

  const handleSettingsChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setSettings(prev => ({ ...prev, [name]: val }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('settings').upsert({ id: 1, ...settings });
      if (error) throw error;
      toast.success('Configuración guardada correctamente');
    } catch (err) {
      console.error("Error saving settings:", err);
      toast.error('Error al guardar configuración');
    }
  };

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleDelete = async (id) => {
    toast.warning('¿Eliminar este producto?', {
      description: 'Esta acción no se puede deshacer',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            fetchProducts(); 
            toast.success('Producto eliminado correctamente');
          } catch (err) {
            console.error("Error deleting:", err);
            toast.error('Error al eliminar el producto');
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleDeleteCategory = async (id) => {
    toast.warning('¿Eliminar esta categoría?', {
      description: 'Los productos asociados podrían quedarse sin categoría válida',
      action: {
        label: 'Eliminar',
        onClick: async () => {
          try {
            const { error } = await supabase.from('categories').delete().eq('id', id);
            if (error) throw error;
            fetchCategories(); 
            toast.success('Categoría eliminada correctamente');
          } catch (err) {
            console.error("Error deleting category:", err);
            toast.error('Error al eliminar la categoría');
          }
        }
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => {}
      }
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct({ ...product });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').update(editingProduct).eq('id', editingProduct.id);
      if (error) throw error;
      setEditingProduct(null);
      fetchProducts();
      toast.success('Producto actualizado correctamente');
    } catch (err) {
      console.error("Error updating product:", err);
      toast.error('Error al actualizar el producto');
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleFeaturedChange = (e, setProduct, product) => {
    const { value } = e.target;
    setProduct(prev => ({ ...prev, featured: value }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('products').insert([newProduct]);
      if (error) throw error;
      setNewProduct({ name: '', description: '', category: categories[0]?.name || '', laboratorio: '', price: '', stock: 0, featured: 'none', image: '/product.jpg' });
      fetchProducts();
      setIsAddModalOpen(false);
      toast.success(`¡Producto "${newProduct.name}" agregado correctamente!`);
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error('Error al agregar el producto');
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('categories').insert([newCategory]);
      if (error) throw error;
      setNewCategory({ name: '' });
      fetchCategories();
      toast.success('Categoría creada correctamente');
    } catch (err) {
      console.error("Error adding category:", err);
      toast.error('Error al crear la categoría');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, product, setProduct) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        toast.error('La imagen es muy grande. Máximo 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProduct(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
      {/* Admin Navbar */}
      <nav style={{ background: 'white', padding: '16px 24px', boxShadow: 'var(--shadow-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div className="logo">
          SERPR<span>+</span>VE <span style={{ fontSize: '1rem', color: 'var(--color-text-light)', marginLeft: '8px' }}>| Panel Admin</span>
        </div>
        
        {/* Session Info */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '16px',
          padding: '8px 16px',
          backgroundColor: 'var(--color-bg)',
          borderRadius: 'var(--radius-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>
              {sessionInfo.username || 'Admin'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: sessionInfo.timeRemaining < 300 ? '#dc2626' : 'var(--color-text-light)' }}>
            <Clock size={14} />
            <span style={{ fontSize: '0.8rem' }}>
              {sessionInfo.timeRemaining > 60 
                ? `${Math.floor(sessionInfo.timeRemaining / 60)}m` 
                : `${sessionInfo.timeRemaining}s`}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
           <button onClick={() => navigate('/')} className="btn btn-outline" style={{ padding: '8px 16px' }}>
            Ver Sitio Público
          </button>
          <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogOut size={16} /> Salir
          </button>
        </div>
      </nav>

      {/* Edit Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={20} className="text-primary" /> Editar Producto
              </h2>
              <button onClick={handleCancelEdit} style={{ padding: '8px', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Nombre</label>
                <input required type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Categoría</label>
                <select required value={editingProduct.category} onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})} style={selectStyle}>
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Laboratorio / Marca</label>
                <input required type="text" value={editingProduct.laboratorio} onChange={(e) => setEditingProduct({...editingProduct, laboratorio: e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Precio (ARS)</label>
                <input required type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})} style={inputStyle} min="0" step="0.01" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Stock (unidades)</label>
                <input required type="number" value={editingProduct.stock || 0} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} style={inputStyle} min="0" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Estado del Producto</label>
                <select value={editingProduct.featured || 'none'} onChange={(e) => setEditingProduct({...editingProduct, featured: e.target.value})} style={selectStyle}>
                  <option value="none">Normal</option>
                  <option value="nuevo">🏆 Nuevo</option>
                  <option value="oferta">🔥 Oferta</option>
                  <option value="popular">⭐ Popular</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Descripción</label>
                <textarea required value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Imagen del Producto</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input type="text" value={editingProduct.image} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} style={inputStyle} placeholder="O ingresa una URL" />
                  </div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #ddd', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: '#fafafa' }}>
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5000000) {
                            toast.error('La imagen es muy grande. Máximo 5MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => setEditingProduct(prev => ({ ...prev, image: reader.result }));
                          reader.readAsDataURL(file);
                        }
                      }} style={{ display: 'none' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>📷 Cambiar imagen</span>
                    </label>
                  </div>
                </div>
                {editingProduct.image && (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    <img src={editingProduct.image} alt="Preview" style={{ maxHeight: '80px', maxWidth: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} /> Guardar Cambios
                </button>
                <button type="button" onClick={handleCancelEdit} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} className="text-primary" /> Nuevo Producto
              </h2>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '8px', background: 'transparent', cursor: 'pointer', borderRadius: '4px', border: 'none' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Nombre</label>
                <input required type="text" name="name" value={newProduct.name} onChange={handleChange} style={inputStyle} placeholder="Ej: Suplemento vitamínico" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Categoría de Producto</label>
                <select required name="category" value={newProduct.category} onChange={handleChange} style={selectStyle}>
                  {categories.length === 0 && <option value="">Sin categorías. ¡Crea una primero!</option>}
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Laboratorio / Marca</label>
                <input required type="text" name="laboratorio" value={newProduct.laboratorio} onChange={handleChange} style={inputStyle} placeholder="Ej: VetNatura" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Precio (ARS)</label>
                <input required type="number" name="price" value={newProduct.price} onChange={handleChange} style={inputStyle} placeholder="Ej: 5500" min="0" step="0.01" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Stock (unidades)</label>
                <input required type="number" name="stock" value={newProduct.stock} onChange={handleChange} style={inputStyle} placeholder="Ej: 50" min="0" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Estado del Producto</label>
                <select name="featured" value={newProduct.featured} onChange={(e) => handleFeaturedChange(e, setNewProduct, newProduct)} style={selectStyle}>
                  <option value="none">Normal</option>
                  <option value="nuevo">🏆 Nuevo</option>
                  <option value="oferta">🔥 Oferta</option>
                  <option value="popular">⭐ Popular</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Descripción</label>
                <textarea required name="description" value={newProduct.description} onChange={handleChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} placeholder="Breve descripción del producto..." />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Imagen del Producto</label>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <input type="text" name="image" value={newProduct.image} onChange={handleChange} style={inputStyle} placeholder="O ingresa una URL de imagen" />
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>URL de imagen externa</p>
                  </div>
                  <div style={{ flex: '1', minWidth: '200px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: '2px dashed #ddd', borderRadius: 'var(--radius-sm)', cursor: 'pointer', backgroundColor: '#fafafa', transition: 'all 0.2s' }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          const reader = new FileReader();
                          reader.onloadend = () => setNewProduct(prev => ({ ...prev, image: reader.result }));
                          reader.readAsDataURL(file);
                        }
                      }}>
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, null, setNewProduct)} style={{ display: 'none' }} />
                      <span style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>📷 Subir imagen</span>
                    </label>
                    <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '4px' }}>Arrastrá o seleccioná (máx 5MB)</p>
                  </div>
                </div>
                {newProduct.image && (
                  <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: 'var(--radius-sm)', display: 'inline-block' }}>
                    <img src={newProduct.image} alt="Preview" style={{ maxHeight: '80px', maxWidth: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <Check size={18} /> Guardar Producto
                </button>
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn btn-outline" style={{ flex: 1 }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '40px 24px' }}>
        
        {/* Tabs */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <BarChart3 size={18} /> Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('products')} 
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Package size={18} /> Productos
          </button>
          <button 
            onClick={() => setActiveTab('categories')} 
            className={`btn ${activeTab === 'categories' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Tags size={18} /> Categorías
          </button>
          <button 
            onClick={() => setActiveTab('settings')} 
            className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-outline'}`}
            style={{ display: 'flex', gap: '8px', alignItems: 'center' }}
          >
            <Settings size={18} /> Configuración
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginBottom: '24px', fontSize: '1.5rem' }}>Panel de Estadísticas</h2>
            
            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {/* Total Productos */}
              <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Total Productos</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--color-secondary)', wordBreak: 'break-word', lineHeight: '1.2' }}>{products.length}</p>
                  </div>
                  <div style={{ backgroundColor: 'rgba(233,30,99,0.1)', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <Package size={24} style={{ color: 'var(--color-primary)' }} />
                  </div>
                </div>
              </div>

              {/* Valor Inventario */}
              <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Valor Inventario</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#2e7d32', wordBreak: 'break-word', lineHeight: '1.2' }}>
                      ${products.reduce((acc, p) => acc + (Number(p.price) || 0) * (p.stock || 0), 0).toLocaleString('es-AR')}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#e8f5e9', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <DollarSign size={24} style={{ color: '#2e7d32' }} />
                  </div>
                </div>
              </div>

              {/* Stock Bajo */}
              <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Stock Bajo</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#e65100', wordBreak: 'break-word', lineHeight: '1.2' }}>
                      {products.filter(p => p.stock > 0 && p.stock <= 5).length}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#fff3e0', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <TrendingUp size={24} style={{ color: '#e65100' }} />
                  </div>
                </div>
              </div>

              {/* Agotados */}
              <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Agotados</p>
                    <p style={{ fontSize: '1.75rem', fontWeight: '700', color: '#d32f2f', wordBreak: 'break-word', lineHeight: '1.2' }}>
                      {products.filter(p => p.stock === 0).length}
                    </p>
                  </div>
                  <div style={{ backgroundColor: '#ffebee', padding: '12px', borderRadius: 'var(--radius-sm)' }}>
                    <PackageX size={24} style={{ color: '#d32f2f' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts Section */}
            {products.filter(p => p.stock === 0).length > 0 && (
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <AlertTriangle size={20} style={{ color: '#d32f2f' }} />
                  <h3 style={{ margin: 0, color: '#d32f2f', fontSize: '1.1rem' }}>Productos Agotados que necesitan reposición</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {products.filter(p => p.stock === 0).map(p => (
                    <div key={p.id} style={{ background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '600', margin: 0 }}>{p.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '4px 0 0' }}>{p.category}</p>
                      </div>
                      <span className="badge" style={{ margin: 0, backgroundColor: '#d32f2f', color: 'white' }}>Agotado</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Bajo Alert */}
            {products.filter(p => p.stock > 0 && p.stock <= 5).length > 0 && (
              <div style={{ background: '#fff8e1', border: '1px solid #ffe082', borderRadius: 'var(--radius-md)', padding: '20px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <TrendingUp size={20} style={{ color: '#e65100' }} />
                  <h3 style={{ margin: 0, color: '#e65100', fontSize: '1.1rem' }}>Stock Bajo - Reponer soon</h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {products.filter(p => p.stock > 0 && p.stock <= 5).map(p => (
                    <div key={p.id} style={{ background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: '600', margin: 0 }}>{p.name}</p>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: '4px 0 0' }}>{p.category}</p>
                      </div>
                      <span style={{ backgroundColor: '#fff3e0', color: '#e65100', padding: '4px 12px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '600' }}>
                        {p.stock} unidades
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products by Category */}
            <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ marginBottom: '20px' }}>Productos por Categoría</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {categories.map(cat => {
                  const count = products.filter(p => p.category === cat.name).length;
                  const totalValue = products.filter(p => p.category === cat.name).reduce((acc, p) => acc + (Number(p.price) || 0) * (p.stock || 0), 0);
                  return (
                    <div key={cat.id} style={{ background: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontWeight: '600', marginBottom: '8px' }}>{cat.name}</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)', margin: '0 0 4px' }}>{count}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-light)', margin: 0 }}>
                        ${totalValue.toLocaleString('es-AR')}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div style={{ display: 'block' }}>

            {/* Product List */}
            <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Catálogo Actual ({products.length})</h2>
                  <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.9rem' }}>
                    <Plus size={16} /> Nuevo
                  </button>
                </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select 
                  value={filterCategory} 
                  onChange={(e) => setFilterCategory(e.target.value)}
                  style={{ ...selectStyle, padding: '8px 12px', width: 'auto', minWidth: '150px' }}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <select 
                  value={filterStock} 
                  onChange={(e) => setFilterStock(e.target.value)}
                  style={{ ...selectStyle, padding: '8px 12px', width: 'auto', minWidth: '150px' }}
                >
                  <option value="">Cualquier estado</option>
                  <option value="in_stock">En stock (&gt;5)</option>
                  <option value="low_stock">Stock bajo (1-5)</option>
                  <option value="out_of_stock">Agotado (0)</option>
                </select>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-light)' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar producto..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ ...inputStyle, paddingLeft: '40px', width: '200px' }}
                  />
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>Cargando productos...</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-bg)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Producto</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Laboratorio</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Categoría</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Precio</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Stock</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 && (
                      <tr><td colSpan="6" style={{ padding: '24px', textAlign: 'center' }}>No hay productos.</td></tr>
                    )}
                    {products
                      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   p.laboratorio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                   p.category?.toLowerCase().includes(searchTerm.toLowerCase()))
                      .filter(p => filterCategory === '' || p.category === filterCategory)
                      .filter(p => {
                        if (filterStock === '') return true;
                        if (filterStock === 'out_of_stock') return Number(p.stock) === 0;
                        if (filterStock === 'low_stock') return Number(p.stock) > 0 && Number(p.stock) <= 5;
                        if (filterStock === 'in_stock') return Number(p.stock) > 5;
                        return true;
                      })
                      .map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--color-bg)' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img src={p.image || '/product.jpg'} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', backgroundColor: 'var(--color-bg)' }} />
                            <div>
                              <div style={{ fontWeight: '600' }}>{p.name}</div>
                              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.description}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontSize: '0.9rem' }}>
                          {p.laboratorio}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span className="badge" style={{ margin: 0 }}>{p.category}</span>
                          {p.featured && p.featured !== 'none' && (
                            <span className="badge" style={{ margin: '4px 0 0 0', backgroundColor: p.featured === 'oferta' ? '#FF5722' : p.featured === 'nuevo' ? '#4CAF50' : '#FFC107', color: p.featured === 'popular' ? '#333' : 'white' }}>
                              {p.featured === 'nuevo' && '🏆 Nuevo'}
                              {p.featured === 'oferta' && '🔥 Oferta'}
                              {p.featured === 'popular' && '⭐ Popular'}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', fontWeight: '600', color: 'var(--color-primary)' }}>
                          {p.price ? `$${Number(p.price).toLocaleString('es-AR')}` : '-'}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            backgroundColor: p.stock === 0 ? '#ffebee' : p.stock <= 5 ? '#fff3e0' : '#e8f5e9',
                            color: p.stock === 0 ? '#d32f2f' : p.stock <= 5 ? '#e65100' : '#2e7d32'
                          }}>
                            <span style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: p.stock === 0 ? '#d32f2f' : p.stock <= 5 ? '#e65100' : '#2e7d32'
                            }}></span>
                            {p.stock === 0 ? 'Agotado' : p.stock <= 5 ? `Bajo (${p.stock})` : p.stock}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleEditProduct(p)} style={{ padding: '8px', color: 'var(--color-primary)', background: 'rgba(233,30,99,0.1)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Editar">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => handleDelete(p.id)} style={{ padding: '8px', color: 'red', background: 'rgba(255,0,0,0.1)', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Eliminar">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        )}

        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '32px' }}>
            {/* Add Category Form */}
            <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', height: 'fit-content' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Plus size={20} className="text-primary" /> Nueva Categoría
              </h2>
              <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Nombre de la Categoría</label>
                  <input required type="text" value={newCategory.name} onChange={(e) => setNewCategory({ name: e.target.value })} style={inputStyle} placeholder="Ej: Nutrición" />
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Crear Categoría</button>
              </form>
            </div>

            {/* Category List */}
            <div style={{ background: 'white', padding: '24px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Categorías Actuales ({categories.length})</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-bg)' }}>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500' }}>Nombre</th>
                      <th style={{ padding: '12px 16px', color: 'var(--color-text-light)', fontWeight: '500', width: '100px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length === 0 && (
                      <tr><td colSpan="2" style={{ padding: '24px', textAlign: 'center' }}>No hay categorías.</td></tr>
                    )}
                    {categories.map(c => (
                      <tr key={c.id} style={{ borderBottom: '1px solid var(--color-bg)' }}>
                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{c.name}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <button onClick={() => handleDeleteCategory(c.id)} style={{ padding: '8px', color: 'red', background: 'transparent', cursor: 'pointer', borderRadius: '4px' }} title="Eliminar">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
            <form onSubmit={handleSaveSettings}>
              {/* Global Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
                  <Settings size={20} className="text-primary" /> Configuración Global
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Color Principal (Botones y Acentos)</label>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <input type="color" name="global_primaryColor" value={settings.global_primaryColor || ''} onChange={handleSettingsChange} style={{ width: '50px', height: '40px', padding: '0', border: 'none', cursor: 'pointer' }} />
                      <input type="text" name="global_primaryColor" value={settings.global_primaryColor || ''} onChange={handleSettingsChange} style={inputStyle} />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Número de WhatsApp (Sin el +)</label>
                    <input required type="text" name="global_whatsappPhone" value={settings.global_whatsappPhone || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="3794895845" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Provincias con Cobertura (Separadas por coma)</label>
                    <input
                      type="text"
                      name="coverage_provinces"
                      value={settings.coverage_provinces || ''}
                      onChange={handleSettingsChange}
                      style={inputStyle}
                      placeholder="Ej: Chaco, Corrientes, Misiones, Formosa"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>Estas provincias se resaltarán en el mapa de contacto con el color principal.</p>
                  </div>
                </div>
              </div>

              {/* Catalog Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
                  <ShoppingCart size={20} className="text-primary" /> Configuración del Catálogo
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Show Prices Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', margin: 0, marginBottom: '4px', fontSize: '0.95rem' }}>Mostrar Precios</p>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.85rem' }}>Visible para todos los visitantes del sitio</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ target: { name: 'show_prices', value: !settings.show_prices } })}
                      style={{
                        width: '52px',
                        height: '28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: settings.show_prices ? '#22c55e' : '#ccc',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: settings.show_prices ? '27px' : '3px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>

                  {/* Show Stock Toggle */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '8px' }}>
                    <div>
                      <p style={{ fontWeight: '600', margin: 0, marginBottom: '4px', fontSize: '0.95rem' }}>Mostrar Stock</p>
                      <p style={{ color: '#666', margin: 0, fontSize: '0.85rem' }}>Mostrar la cantidad disponible de cada producto</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSettingsChange({ target: { name: 'show_stock', value: !settings.show_stock } })}
                      style={{
                        width: '52px',
                        height: '28px',
                        borderRadius: '14px',
                        border: 'none',
                        background: settings.show_stock ? '#22c55e' : '#ccc',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'background 0.2s',
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '3px',
                        left: settings.show_stock ? '27px' : '3px',
                        transition: 'left 0.2s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }} />
                    </button>
                  </div>
                </div>

                {/* Show Cart Toggle */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9f9f9', borderRadius: '8px', marginTop: '20px' }}>
                  <div>
                    <p style={{ fontWeight: '600', margin: 0, marginBottom: '4px', fontSize: '0.95rem' }}>Activar Carrito de Compras</p>
                    <p style={{ color: '#666', margin: 0, fontSize: '0.85rem' }}>Permite agregar productos al carrito y hacer pedidos completos por WhatsApp</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSettingsChange({ target: { name: 'show_cart', value: !settings.show_cart } })}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      background: settings.show_cart !== false ? '#22c55e' : '#ccc',
                      cursor: 'pointer',
                      position: 'relative',
                      transition: 'background 0.2s',
                      flexShrink: 0
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: 'white',
                      position: 'absolute',
                      top: '3px',
                      left: settings.show_cart !== false ? '27px' : '3px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }} />
                  </button>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '16px', marginBottom: 0 }}>
                  Cuando un ítem está desactivado, no se mostrará en el catálogo público ni en la página de ofertas.
                </p>
              </div>

              {/* Contacto y Redes Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
                  <Settings size={20} className="text-primary" /> Datos de Contacto y Redes Sociales
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Email</label>
                    <input type="email" name="contact_email" value={settings.contact_email || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="contacto@serprove.com" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Teléfono</label>
                    <input type="text" name="contact_phone" value={settings.contact_phone || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="+54 9 379 489-5845" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Dirección</label>
                    <input type="text" name="contact_address" value={settings.contact_address || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="Corrientes, Argentina" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Horarios de Atención</label>
                    <input type="text" name="contact_schedule" value={settings.contact_schedule || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="Lunes a Viernes: 8:00 - 18:00" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Instagram URL</label>
                    <input type="url" name="social_instagram" value={settings.social_instagram || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://instagram.com/tu_usuario" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Facebook URL</label>
                    <input type="url" name="social_facebook" value={settings.social_facebook || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://facebook.com/tu_pagina" />
                  </div>
                </div>
              </div>

              {/* Inicio Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>1. Sección: Inicio</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Título Principal</label>
                    <input required type="text" name="inicio_title" value={settings.inicio_title || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Subtítulo</label>
                    <textarea required name="inicio_subtitle" value={settings.inicio_subtitle || ''} onChange={handleSettingsChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>URL de Imagen de Fondo</label>
                    <input required type="text" name="inicio_image" value={settings.inicio_image || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Banner Promocional */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px', borderLeft: '4px solid var(--color-primary)' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>🏷️ Banner Promocional (Ofertas)</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>
                      <input 
                        type="checkbox" 
                        name="banner_active" 
                        checked={settings.banner_active} 
                        onChange={(e) => setSettings(prev => ({ ...prev, banner_active: e.target.checked }))}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      ¿Mostrar Banner?
                    </label>
                  </div>
                  <div></div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Título del Banner</label>
                    <input type="text" name="banner_title" value={settings.banner_title || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="¡Ofertas Especiales!" />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Subtítulo del Banner</label>
                    <input type="text" name="banner_subtitle" value={settings.banner_subtitle || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="Hasta 30% de descuento" />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>URL de Imagen del Banner</label>
                    <input type="text" name="banner_image" value={settings.banner_image || ''} onChange={handleSettingsChange} style={inputStyle} placeholder="https://..." />
                  </div>
                </div>
              </div>

              {/* Nosotros Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>2. Sección: Sobre Nosotros</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Título de Sección</label>
                    <input required type="text" name="nosotros_title" value={settings.nosotros_title || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Texto Principal</label>
                    <textarea required name="nosotros_text" value={settings.nosotros_text || ''} onChange={handleSettingsChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              {/* Catalogo Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>3. Sección: Catálogo</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Título de Sección</label>
                    <input required type="text" name="catalogo_title" value={settings.catalogo_title || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Subtítulo</label>
                    <input required type="text" name="catalogo_subtitle" value={settings.catalogo_subtitle || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                </div>
              </div>

              {/* Capacitaciones Settings */}
              <div style={{ background: 'white', padding: '32px', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', color: 'var(--color-secondary)' }}>4. Sección: Capacitaciones</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Título de Sección</label>
                    <input required type="text" name="capacitaciones_title" value={settings.capacitaciones_title || ''} onChange={handleSettingsChange} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Texto Descriptivo</label>
                    <textarea required name="capacitaciones_text" value={settings.capacitaciones_text || ''} onChange={handleSettingsChange} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
                  Guardar Todos los Cambios
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid #bbb',
  fontFamily: 'inherit',
  fontSize: '0.95rem',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  backgroundColor: 'white'
};

const selectStyle = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  MozAppearance: 'none',
  paddingRight: '36px',
  cursor: 'pointer',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='%23666' strokeWidth='1.5' fill='none' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center'
};

export default Admin;
