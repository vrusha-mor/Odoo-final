


import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, CreditCard, LayoutGrid, Trash2, Calculator, Send, Search, Star, Plus, Minus, Menu } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PaymentModal from './payment/PaymentModal';
import Navbar from './Navbar';

// Assets
import pizzaBg from '../assets/auth_bg_custom.jpg';
import dosaImg from '../assets/dosa.png';

type Product = {
  id: number;
  name: string;
  price: number;
  category_id: number;
  is_active: boolean;
};

type Category = {
  id: number;
  name: string;
  is_active: boolean;
};

// Product Image Dictionary
const PRODUCT_IMAGES: Record<string, string> = {
    // Assets
    'dosa': dosaImg, 
    
    // Fast Food / Snacks
    'pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=320&q=80',
    'margherita pizza': 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=320&q=80',
    'corn pizza': 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=320&q=80',
    'burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&q=80',
    'veg burger': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=320&q=80',
    'chicken burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=320&q=80',
    'club sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=320&q=80',
    'paneer wrap': 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=320&q=80',
    'nachos with salsa': 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=320&q=80',
    'french fries': 'https://images.unsplash.com/photo-1518013431117-e737089c35f3?auto=format&fit=crop&w=320&q=80',
    'peri peri fries': 'https://images.unsplash.com/photo-1630384060421-a4323ceca041?auto=format&fit=crop&w=320&q=80',
    'garlic bread': 'https://images.unsplash.com/photo-1619531040576-f39a9abbd29c?auto=format&fit=crop&w=320&q=80',
    'chicken nuggets': 'https://images.unsplash.com/photo-1562967914-608f8262971d?auto=format&fit=crop&w=320&q=80',
    'maggie': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=320&q=80',
    'maggie masala': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=320&q=80',
    'cheese maggie': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=320&q=80',

    // Main Course
    'paneer butter masala': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=320&q=80',
    'dal makhani': 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=320&q=80',
    'butter naan': 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=320&q=80',
    'jeera rice': 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=320&q=80',
    'chicken curry': 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=320&q=80',

    // Desserts
    'waffle': 'https://images.unsplash.com/photo-1568051243851-f9b136146e97?auto=format&fit=crop&w=320&q=80',
    'chocolate cake': 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=320&q=80',
    'tiramisu': 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=320&q=80',
    'cheesecake': 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?auto=format&fit=crop&w=320&q=80',
    'brownie with ice cream': 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?auto=format&fit=crop&w=320&q=80',
    'fruit salad': 'https://images.unsplash.com/photo-1511690656952-34342d5c2895?auto=format&fit=crop&w=320&q=80',
    'ice-cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=320&q=80',
    'ice cream': 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?auto=format&fit=crop&w=320&q=80',

    // Shakes & Drinks
    'kitkat shake': 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?auto=format&fit=crop&w=320&q=80', 
    'oreo shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=320&q=80',
    'chocolate shake': 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=320&q=80',
    'strawberry shake': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=320&q=80',
    'mango shake': 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=320&q=80',
    'cold coffee': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=320&q=80',
    'cappuccino': 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=320&q=80',
    'iced latte': 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=320&q=80',
    'orange juice': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=320&q=80',
    'masala chai': 'https://images.unsplash.com/photo-1619066045029-5c7e8537bd8c?auto=format&fit=crop&w=320&q=80',
    'milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=320&q=80',
    'coke': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=320&q=80',
    'blue lagoon': 'https://images.unsplash.com/photo-1546171753-97d7676e4602?auto=format&fit=crop&w=320&q=80',
    'mojito': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=320&q=80',
    'fruit punch': 'https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?auto=format&fit=crop&w=320&q=80',
};

const getImageUrl = (name: string) => {
  // Case insensitive match
  const lowerName = name.toLowerCase().trim();
  if (PRODUCT_IMAGES[lowerName]) {
      return PRODUCT_IMAGES[lowerName];
  }
  
  // Fallback to specific keywords or loremflickr
  return `https://loremflickr.com/320/240/${encodeURIComponent(name)},food/all`;
};


export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | 'ALL'>('ALL');
  const [cart, setCart] = useState<{id: number, name: string, price: number, quantity: number}[]>([]);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Numpad state
  const [numpadValue, setNumpadValue] = useState('');
  
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user_email') || '';
  const terminalName = localStorage.getItem('pos_terminal_name') || 'Odoo Cafe';
  
  const activeTableString = localStorage.getItem('activeTable');
  const activeTable = activeTableString ? JSON.parse(activeTableString) : null;
  const tableName = activeTable ? `Table ${activeTable.table_number}` : '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        
        const [prodRes, catRes] = await Promise.all([
          axios.get('http://localhost:3001/products', { headers }),
          axios.get('http://localhost:3001/categories', { headers })
        ]);

        setProducts(prodRes.data.filter((p: Product) => p.is_active));
        setCategories(catRes.data.filter((c: Category) => c.is_active));
      } catch (err) {
        console.error("Error fetching POS data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: Number(product.price), quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
  
  // Calculator Logic
  const handleNumpadClick = (val: string) => {
      if (val === 'C') {
          setNumpadValue('');
      } else if (val === 'Back') {
          setNumpadValue(prev => prev.slice(0, -1));
      } else {
          setNumpadValue(prev => prev + val);
      }
  };

  const handleUpdateQuantity = () => {
      const qty = parseInt(numpadValue);
      if (!isNaN(qty) && qty > 0 && cart.length > 0) {
          setCart(prev => {
              const newCart = [...prev];
              const lastItem = newCart[newCart.length - 1];
              lastItem.quantity = qty;
              return newCart;
          });
          setNumpadValue('');
      }
  };

  // Tax and Totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const taxRate = 0.05; // 5% GST
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  // SEND to Kitchen
  const handleSendToKitchen = async () => {
      if(cart.length === 0) return;
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3001/orders', {
            customer_id: null, 
            items: cart,
            total_amount: total,
            tax_amount: taxAmount,
            status: 'pending', 
            payment_method: null,
            table_id: activeTable?.id || null 
        }, { headers: { Authorization: `Bearer ${token}` } });
        
        navigate('/kitchen');
        setCart([]);
      } catch (err) {
        console.error("Error sending order:", err);
        alert("Failed to send order.");
      }
  };

  const filteredProducts = products.filter(p => {
      const matchesCategory = selectedCategoryId === 'ALL' || p.category_id === selectedCategoryId;
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  // Theme Constants
  const theme = {
      bg: '#f7f7f7',
      cardBg: 'white',
      textMain: '#333',
      textMuted: '#888',
      accent: '#e91e63',
      border: '#eee',
      shadow: '0 10px 40px rgba(0, 0, 0, 0.05)'
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: theme.bg, color: theme.textMain }}>
      <Navbar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* LEFT SIDEBAR: Categories */}
        <div style={{ 
            width: '240px', 
            margin: '20px 0 20px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            borderRadius: '20px',
            background: theme.cardBg,
            boxShadow: theme.shadow
        }}>
             <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}` }}>
                 <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: theme.textMain }}>Menu</h2>
                 <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>{products.length} Items Available</p>
             </div>

             <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                 <button 
                    onClick={() => setSelectedCategoryId('ALL')}
                    style={{ 
                        width: '100%',
                        padding: '15px 20px', 
                        marginBottom: '8px',
                        borderRadius: '12px', 
                        border: 'none', 
                        background: selectedCategoryId === 'ALL' ? theme.accent : 'transparent',
                        color: selectedCategoryId === 'ALL' ? 'white' : theme.textMuted,
                        fontWeight: '600',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s',
                        boxShadow: selectedCategoryId === 'ALL' ? '0 4px 10px rgba(233, 30, 99, 0.2)' : 'none'
                    }}
                 >
                     <LayoutGrid size={18} /> All Items
                 </button>
                 {categories.map(cat => (
                     <button 
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        style={{ 
                            width: '100%',
                            padding: '15px 20px', 
                            marginBottom: '8px',
                            borderRadius: '12px', 
                            border: 'none', 
                            background: selectedCategoryId === cat.id ? theme.accent : 'transparent',
                            color: selectedCategoryId === cat.id ? 'white' : theme.textMuted,
                            fontWeight: '600',
                            textAlign: 'left',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            transition: 'all 0.2s',
                            boxShadow: selectedCategoryId === cat.id ? '0 4px 10px rgba(233, 30, 99, 0.2)' : 'none'
                        }}
                     >
                         <Menu size={18} /> {cat.name}
                     </button>
                 ))}
             </div>
        </div>

        {/* CENTER CONTENT: Search & Products */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflow: 'hidden' }}>
            {/* Header / Search */}
            <div style={{ 
                padding: '15px 25px', 
                marginBottom: '20px', 
                borderRadius: '20px', 
                background: theme.cardBg,
                boxShadow: theme.shadow,
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center' 
            }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                     <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: theme.textMain }}>
                         {tableName || 'Walk-In Customer'}
                     </h2>
                     <span style={{ fontSize: '0.8rem', color: theme.textMuted }}>Select items to add to order</span>
                 </div>

                 <div style={{ position: 'relative', width: '300px' }}>
                     <Search style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted }} size={18} />
                     <input 
                        type="text" 
                        placeholder="Search by food name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ 
                            width: '100%', 
                            padding: '12px 12px 12px 45px', 
                            borderRadius: '50px', 
                            border: `1px solid ${theme.border}`, 
                            background: '#fafafa', 
                            color: theme.textMain,
                            outline: 'none',
                            fontSize: '0.95rem'
                        }}
                     />
                 </div>
            </div>

            {/* Product Grid */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: theme.textMuted }}>Loading...</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px', paddingBottom: '20px' }}>
                        {filteredProducts.map(product => (
                            <motion.div 
                                key={product.id}
                                whileHover={{ scale: 1.02, translateY: -5 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                style={{ 
                                    padding: '0', 
                                    cursor: 'pointer', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    overflow: 'hidden',
                                    borderRadius: '20px',
                                    background: theme.cardBg,
                                    boxShadow: theme.shadow,
                                    border: 'none'
                                }}
                            >
                                <div style={{ height: '140px', width: '100%', position: 'relative' }}>
                                    <img 
                                        src={getImageUrl(product.name)} 
                                        alt={product.name}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                    />
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', color: 'black', display: 'flex', alignItems: 'center', gap: '2px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                        <Star size={10} fill="orange" color="orange" /> 4.5
                                    </div>
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '8px', color: theme.textMain }}>{product.name}</h3>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                         <span style={{ fontWeight: '800', fontSize: '1.2rem', color: theme.accent }}>₹{product.price}</span>
                                         <div style={{ background: theme.accent, padding: '6px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(233, 30, 99, 0.2)' }}>
                                             <Plus size={16} color="white" />
                                         </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* RIGHT SIDEBAR: Cart & Checkout */}
        <div style={{ 
            width: '380px', 
            margin: '20px 20px 20px 0', 
            borderRadius: '20px', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            background: theme.cardBg,
            boxShadow: theme.shadow
        }}>
             <div style={{ padding: '20px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: theme.textMain }}>Order #1023</h2>
                 <div style={{ background: '#fce4ec', color: theme.accent, padding: '5px 12px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '600' }}>
                     Table: {activeTable?.table_number || 'N/A'}
                 </div>
             </div>

             {/* Cart Items */}
             <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                <AnimatePresence>
                {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', color: theme.textMuted, marginTop: '50px' }}>
                    <Package size={48} style={{ opacity: 0.3, marginBottom: '10px' }} />
                    <p>No items added yet</p>
                    </div>
                ) : (
                    cart.map(item => (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={item.id} 
                        style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '12px',
                        background: '#fafafa',
                        borderRadius: '12px',
                        marginBottom: '10px'
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <h4 style={{ fontSize: '0.95rem', marginBottom: '4px', color: theme.textMain, fontWeight: '600' }}>{item.name}</h4>
                            <p style={{ fontSize: '0.8rem', color: theme.textMuted }}>₹{item.price} x {item.quantity}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: '700', color: theme.textMain }}>₹{item.price * item.quantity}</span>
                            <button 
                                onClick={() => removeFromCart(item.id)}
                                style={{ background: '#fee2e2', border: 'none', color: '#ef4444', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </motion.div>
                    ))
                )}
                </AnimatePresence>
             </div>

            {/* Calculations & Numpad */}
            <div style={{ padding: '20px', background: 'white' }}>
                {/* Numpad Display */}
                 <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                     <div style={{ background: '#fafafa', padding: '8px 15px', borderRadius: '10px', minWidth: '80px', textAlign: 'right', fontWeight: 'bold', border: `1px solid ${theme.border}`, color: theme.textMain }}>
                         {numpadValue || '0'}
                     </div>
                 </div>

                 {/* Numpad Grid */}
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '20px' }}>
                     <button onClick={handleUpdateQuantity} style={{ gridColumn: 'span 4', background: theme.accent, color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 10px rgba(233, 30, 99, 0.2)' }}>
                        Quantity
                     </button>
                     {['1','2','3','Back','4','5','6','C','7','8','9','0'].map(key => (
                         <button
                            key={key}
                            onClick={() => handleNumpadClick(key)}
                            style={{
                                background: '#f5f5f5',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '12px 0',
                                color: key === 'C' ? '#ef4444' : theme.textMain,
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '1rem',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                            }}
                         >
                             {key === 'Back' ? '←' : key}
                         </button>
                     ))}
                 </div>

                 {/* Totals */}
                 <div style={{ marginBottom: '20px', padding: '15px', background: '#fafafa', borderRadius: '12px' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textMuted, marginBottom: '5px', fontSize: '0.9rem' }}>
                         <span>Subtotal</span>
                         <span>₹{subtotal.toFixed(2)}</span>
                     </div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textMuted, marginBottom: '10px', fontSize: '0.9rem' }}>
                         <span>Tax (5%)</span>
                         <span>₹{taxAmount.toFixed(2)}</span>
                     </div>
                     <div style={{ borderTop: `1px dashed ${theme.border}`, margin: '10px 0' }} />
                     <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: '800', color: theme.textMain }}>
                         <span>Total</span>
                         <span style={{ color: theme.accent }}>₹{total.toFixed(2)}</span>
                     </div>
                 </div>

                 {/* Actions */}
                 <div style={{ display: 'flex', gap: '10px' }}>
                     <button 
                        onClick={handleSendToKitchen}
                        disabled={cart.length === 0}
                        style={{ flex: 1, background: '#fff', border: `2px solid ${theme.border}`, color: theme.textMuted, borderRadius: '50px', padding: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                     >
                         <Send size={18} /> Kitchen
                     </button>
                     <button 
                        onClick={() => setIsPaymentOpen(true)}
                        disabled={cart.length === 0}
                        style={{ flex: 1, background: theme.accent, border: 'none', color: 'white', borderRadius: '50px', padding: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)' }}
                     >
                         <CreditCard size={18} /> Pay Now
                     </button>
                 </div>
            </div>
        </div>

      </div>

      {isPaymentOpen && (
        <PaymentModal 
          amount={total} 
          email={userEmail}
          cart={cart}
          onClose={() => setIsPaymentOpen(false)} 
          onSuccess={() => {
            setCart([]);
            setIsPaymentOpen(false);
          }}
        />
      )}
    </div>
  );
}
