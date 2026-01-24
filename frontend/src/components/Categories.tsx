import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, List as ListIcon, X, Tag, Trash2, Edit2 } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

type Category = {
  id: number;
  name: string;
  is_active: boolean;
};

// UI Colors for valid selection
const COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8"];

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Partial<Category>>({});
  const [selectedColor, setSelectedColor] = useState(COLORS[0]); // UI only

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      // alert(`Failed to load categories: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCategory.name) return alert("Please enter a category name");
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const payload = {
        name: activeCategory.name,
        is_active: true
      };

      if (activeCategory.id) {
        await axios.put(`http://localhost:3001/categories/${activeCategory.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:3001/categories', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setIsEditing(false);
      fetchCategories();
    } catch (err: any) {
      alert(`Error saving category: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
      if(!confirm("Are you sure you want to delete this category?")) return;
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3001/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories();
      } catch (err: any) {
        console.error(err);
        // Common error: blocking delete due to existing products
        if (err.response?.status === 500) {
             alert("Cannot delete category: It may contain products. Delete all products in this category first.");
        } else {
             alert(`Failed to delete category: ${err.response?.data?.message || err.message}`);
        }
      }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />

      <div style={{ padding: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button 
                  onClick={() => { setActiveCategory({}); setIsEditing(true); }}
                  style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                >
                    <Plus size={18} /> New
                </button>
                <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Product Category</h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div className="glass-card" style={{ padding: '5px 15px', display: 'flex', alignItems: 'center', gap: '10px', borderRadius: '10px', width: '300px' }}>
                    <Search size={18} style={{ opacity: 0.5 }} />
                    <input 
                      type="text" 
                      placeholder="Search Category..." 
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
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Product Category</th>
                        <th style={{ padding: '20px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '500' }}>Color</th>
                        <th style={{ padding: '20px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: '500' }}>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</td></tr>
                    ) : filteredCategories.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>No categories found</td></tr>
                    ) : filteredCategories.map((cat, idx) => (
                        <tr 
                          key={cat.id} 
                          onClick={() => { setActiveCategory(cat); setIsEditing(true); }}
                          style={{ borderBottom: '1px solid var(--surface-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                          className="table-row-hover"
                        >
                            <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                                <input type="checkbox" />
                            </td>
                            <td style={{ padding: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Tag size={16} style={{ color: COLORS[idx % COLORS.length] }} />
                                {cat.name}
                            </td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: COLORS[idx % COLORS.length] }}></div>
                            </td>
                            <td style={{ padding: '20px', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}>
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
              style={{ width: '100%', maxWidth: '500px', padding: '40px', position: 'relative' }}
            >
                <button onClick={() => setIsEditing(false)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', opacity: 0.5 }}>
                    <X size={24} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                    <button style={{ background: 'var(--primary)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>New</button>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>Category</h2>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '0', top: '-10px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>:: Quick Bites</span>
                        <input 
                          type="text" 
                          placeholder="Category Name"
                          // removed required to handle manually
                          value={activeCategory.name || ''}
                          onChange={(e) => setActiveCategory({...activeCategory, name: e.target.value})}
                          style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--surface-border)', padding: '10px 0', color: 'var(--text-main)', fontSize: '1.1rem', outline: 'none' }}
                        />
                    </div>

                    <div>
                        <span style={{ display: 'block', marginBottom: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Color Code (UI Only)</span>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {COLORS.map(color => (
                                <div 
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    style={{ 
                                        width: '30px', 
                                        height: '30px', 
                                        borderRadius: '50%', 
                                        background: color, 
                                        cursor: 'pointer',
                                        border: selectedColor === color ? '2px solid white' : '2px solid transparent'
                                    }}
                                />
                            ))}
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
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '10px'
                      }}
                    >
                        {loading ? 'Saving...' : (activeCategory.id ? 'Update Category' : 'Create Category')}
                    </button>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
