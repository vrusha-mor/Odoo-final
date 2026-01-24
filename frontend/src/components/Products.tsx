import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, List as ListIcon, X, Tag, Trash2, Box } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

type Product = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  price: number;
  tax_percent: number;
  is_active: boolean;
};

type Category = {
  id: number;
  name: string;
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeProduct, setActiveProduct] = useState<Partial<Product>>({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      const [prodRes, catRes] = await Promise.all([
        axios.get('http://localhost:3001/products', { headers }),
        axios.get('http://localhost:3001/categories', { headers })
      ]);

      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      // alert(`Failed to load data: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProduct.name) return alert("Enter Product Name");
    if (!activeProduct.category_id) return alert("Select a Category");
    if (!activeProduct.price) return alert("Enter Price");

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: activeProduct.name,
        category_id: Number(activeProduct.category_id),
        price: Number(activeProduct.price),
        tax_percent: Number(activeProduct.tax_percent || 0),
        is_active: true
      };

      if (activeProduct.id) {
        await axios.put(`http://localhost:3001/products/${activeProduct.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3001/products', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      fetchData();
    } catch (err: any) {
      alert(`Error saving product: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Are you sure you want to delete this product?")) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3001/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchData();
      } catch (err: any) {
        console.error(err);
        alert(`Failed to delete product: ${err.response?.data?.message || err.message}`);
      }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                  onClick={() => { setActiveProduct({}); setIsEditing(true); }}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                >
                    <Plus size={18} /> New
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Products</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="glass-card" style={{ padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', width: '300px' }}>
                    <Search size={18} style={{ opacity: 0.5 }} />
                    <input 
                      type="text" 
                      placeholder="Search Products..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ background: 'none', border: 'none', color: 'white', outline: 'none', width: '100%', padding: '8px 0' }}
                    />
                </div>
                <button style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                    <ListIcon size={20} />
                </button>
            </div>
        </div>

        <div className="glass-card table-card" style={{ padding: '0', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--surface-border)' }}>
                    <tr>
                        <th style={{ padding: '20px', textAlign: 'left', width: '50px' }}>
                             <input type="checkbox" />
                        </th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Product</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Price</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Tax</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Category</th>
                        <th style={{ padding: '20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products...</td></tr>
                    ) : filteredProducts.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No products found</td></tr>
                    ) : filteredProducts.map(prod => (
                        <tr 
                          key={prod.id} 
                          onClick={() => { setActiveProduct(prod); setIsEditing(true); }}
                          style={{ borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="table-row-hover"
                        >
                            <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" />
                            </td>
                            <td style={{ padding: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Box size={16} style={{ opacity: 0.7 }} />
                                {prod.name}
                            </td>
                            <td style={{ padding: '20px' }}>₹{prod.price}</td>
                            <td style={{ padding: '20px' }}>{prod.tax_percent}%</td>
                            <td style={{ padding: '20px' }}>
                                <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', fontSize: '0.85rem' }}>
                                    {prod.category_name || 'Uncategorized'}
                                </span>
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleDelete(prod.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
                                    <Trash2 size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isEditing && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card" 
              style={{ width: '100%', maxWidth: '600px', padding: '40px', position: 'relative' }}
            >
                <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>New</button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Product</h2>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', top: '-10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>e.g Burger with cheese</span>
                        <input 
                          type="text" 
                          placeholder="Product Name"
                          required
                          value={activeProduct.name || ''}
                          onChange={(e) => setActiveProduct({...activeProduct, name: e.target.value})}
                          style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--surface-border)', padding: '10px 0', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Category</label>
                            <select 
                                value={activeProduct.category_id || ''}
                                onChange={(e) => setActiveProduct({...activeProduct, category_id: Number(e.target.value)})}
                                required
                                style={{ width: '100%', padding: '10px', background: '#f5f5f5', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                            >
                                <option value="" disabled style={{ color: 'var(--text-muted)' }}>Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} style={{ color: 'black' }}>{cat.name}</option>
                                ))}
                            </select>
                            {categories.length === 0 && <p style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '5px' }}>No categories found. Create a category first!</p>}
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Price</label>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              required
                              value={activeProduct.price || ''}
                              onChange={(e) => setActiveProduct({...activeProduct, price: Number(e.target.value)})}
                              style={{ width: '100%', padding: '10px', background: '#f5f5f5', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                        </div>
                         <div style={{ width: '100px' }}>
                            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '5px', display: 'block' }}>Tax %</label>
                            <input 
                              type="number" 
                              placeholder="5"
                              value={activeProduct.tax_percent || ''}
                              onChange={(e) => setActiveProduct({...activeProduct, tax_percent: Number(e.target.value)})}
                              style={{ width: '100%', padding: '10px', background: '#f5f5f5', border: '1px solid var(--surface-border)', borderRadius: '8px', color: 'var(--text-main)' }}
                            />
                        </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={loading}
                      style={{ 
                          marginTop: '20px', 
                          background: loading ? '#555' : 'var(--primary)', 
                          color: 'white', 
                          border: 'none', 
                          padding: '15px', 
                          borderRadius: '12px', 
                          fontWeight: '700', 
                          cursor: loading ? 'not-allowed' : 'pointer', 
                          boxShadow: loading ? 'none' : '0 10px 20px rgba(255,107,107,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}
                    >
                        {loading ? 'Saving...' : (activeProduct.id ? 'Update Product' : 'Create Product')}
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
