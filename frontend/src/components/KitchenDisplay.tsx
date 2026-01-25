import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X, Filter, Monitor } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';

type OrderItem = {
    id: number;
    product_name: string;
    quantity: number;
    category_name?: string; // If available from backend
    completed: boolean; 
};

type Order = {
    id: number;
    customer_name?: string;
    created_at: string;
    status: 'pending' | 'preparing' | 'completed';
    items: OrderItem[];
};

export default function KitchenDisplay() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'preparing' | 'completed'>('pending');
    const [searchTerm, setSearchTerm] = useState('');
    
    // Filters
    const [selectedProductFilter, setSelectedProductFilter] = useState<string | null>(null);
    const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/orders', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // Fetch details for each order to get items
            // In a real production app, this should be a single query 'orders?include=items'
            const rawOrders = res.data;
            const fullOrders = await Promise.all(rawOrders.map(async (o: any) => {
                 try {
                     const detail = await axios.get(`http://localhost:3001/orders/${o.id}`, {
                         headers: { Authorization: `Bearer ${token}` }
                     });
                     
                     // Merge items with local completion state if defined, else default false
                     // We need to persist local state if we are polling. 
                     // For this simple version, we might lose strikethrough on poll if not saved.
                     // A simple fix for demo: don't overwrite local 'completed' flag if we already have it in state?
                     // Or just rely on backend. since we don't save Item completion to backend yet, it's fleeting.
                     
                     return { 
                         ...o, 
                         items: detail.data.items.map((i: any) => ({ 
                             ...i, 
                             product_name: i.product_name || 'Unknown',
                             completed: false 
                         })) 
                     };
                 } catch (e) {
                     return { ...o, items: [] };
                 }
            }));
            
            // Merge with existing state to preserve 'completed' strikethroughs if order ID matches
            setOrders(prev => {
                const prevMap = new Map(prev.map(o => [o.id, o]));
                return fullOrders.map(newOrder => {
                    const existing = prevMap.get(newOrder.id);
                    if (!existing) return newOrder;
                    
                    // Restore item completion status
                    const mergedItems = newOrder.items.map((newItem: OrderItem) => {
                         const existingItem = existing.items.find(ei => ei.id === newItem.id);
                         return existingItem ? { ...newItem, completed: existingItem.completed } : newItem;
                    });
                    
                    return { ...newOrder, items: mergedItems };
                });
            });
            
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, currentStatus: string) => {
        let nextStatus = '';
        if (currentStatus === 'pending') nextStatus = 'preparing';
        else if (currentStatus === 'preparing') nextStatus = 'completed';
        else return; // Already completed

        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus as any } : o));
            
            // API call
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:3001/orders/${orderId}/status`, {
                status: nextStatus
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err);
        }
    };

    const toggleItemComplete = (orderId: number, itemId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setOrders(prev => prev.map(o => {
            if (o.id !== orderId) return o;
            return {
                ...o,
                items: o.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
            };
        }));
    };

    // --- FILTER & SEARCH LOGIC ---
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            // Tab Filter
            if (activeTab !== 'all' && o.status !== activeTab) return false;
            
            // Search Filter
            if (searchTerm) {
                const lowerSearch = searchTerm.toLowerCase();
                const matchesId = o.id.toString().includes(lowerSearch);
                const matchesItem = o.items.some(i => i.product_name.toLowerCase().includes(lowerSearch));
                if (!matchesId && !matchesItem) return false;
            }

            // Sidebar Filters (Product)
            if (selectedProductFilter) {
                if (!o.items.some(i => i.product_name === selectedProductFilter)) return false;
            }
            
            // Sidebar Filters (Category) - Assuming we had categories, for now skipping or mocking logic
            // if (selectedCategoryFilter) ...

            return true;
        });
    }, [orders, activeTab, searchTerm, selectedProductFilter, selectedCategoryFilter]);

    // --- PAGINATION ---
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Extract Unique Products for Sidebar
    const uniqueProducts = Array.from(new Set(orders.flatMap(o => o.items.map(i => i.product_name)))).sort();

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'var(--text-main)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            {/* MAIN KDS CONTAINER */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                
                {/* SIDEBAR FILTERS */}
                <div style={{ width: '250px', background: 'var(--surface)', borderRight: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column' }}>
                     <div style={{ padding: '20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                         <span style={{ fontWeight: '600', color: 'var(--text-muted)' }}>Filter</span>
                         {(selectedProductFilter || selectedCategoryFilter) && (
                             <button 
                                onClick={() => { setSelectedProductFilter(null); setSelectedCategoryFilter(null); }}
                                style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                             >
                                 Clear <X size={12} />
                             </button>
                         )}
                     </div>

                     <div style={{ flex: 1, overflowY: 'auto' }}>
                         {/* Product List */}
                         <div style={{ padding: '10px 0' }}>
                             <div style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' }}>Product</div>
                             {uniqueProducts.map(prod => (
                                 <div 
                                    key={prod}
                                    onClick={() => setSelectedProductFilter(prod === selectedProductFilter ? null : prod)}
                                    style={{ 
                                        padding: '10px 20px', 
                                        cursor: 'pointer', 
                                        background: selectedProductFilter === prod ? 'var(--primary-glow)' : 'transparent',
                                        color: selectedProductFilter === prod ? 'var(--primary)' : 'var(--text-muted)',
                                        fontSize: '0.9rem'
                                    }}
                                 >
                                     {prod}
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>

                {/* CONTENT AREA */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    
                    {/* TOP BAR: TABS & SEARCH */}
                    <div style={{ 
                        height: '70px', 
                        background: 'var(--surface)', 
                        borderBottom: '1px solid var(--surface-border)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '0 30px'
                    }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {[
                                { id: 'all', label: 'All', color: '#999' },
                                { id: 'pending', label: 'To Cook', color: '#3b82f6' },
                                { id: 'preparing', label: 'Preparing', color: '#f59e0b' },
                                { id: 'completed', label: 'Completed', color: '#10b981' }
                            ].map(tab => {
                                const count = orders.filter(o => tab.id === 'all' ? true : o.status === tab.id).length;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button 
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        style={{
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: isActive ? tab.color : 'rgba(0,0,0,0.05)',
                                            color: isActive ? 'white' : 'var(--text-muted)',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {tab.label}
                                        <span style={{ 
                                            background: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)', 
                                            padding: '2px 8px', 
                                            borderRadius: '4px', 
                                            fontSize: '0.8rem' 
                                        }}>
                                            {count}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search & Pagination */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                             <div style={{ position: 'relative', width: '250px' }}>
                                 <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                                 <input 
                                    type="text" 
                                    placeholder="Search order or item..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{ 
                                        background: 'var(--background)', 
                                        border: '1px solid var(--surface-border)', 
                                        borderRadius: '6px', 
                                        padding: '8px 10px 8px 35px', 
                                        color: 'var(--text-main)', 
                                        width: '100%',
                                        outline: 'none'
                                    }}
                                 />
                             </div>
                             
                             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#888', fontSize: '0.9rem' }}>
                                 <span>{currentPage}-{totalPages || 1}</span>
                                 <div style={{ display: 'flex' }}>
                                     <button 
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p-1))}
                                        style={{ background: 'none', border: 'none', color: currentPage === 1 ? '#444' : '#aaa', cursor: 'pointer' }}
                                     >
                                         <ChevronLeft size={20} />
                                     </button>
                                     <button 
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                                        style={{ background: 'none', border: 'none', color: currentPage >= totalPages ? '#444' : '#aaa', cursor: 'pointer' }}
                                     >
                                         <ChevronRight size={20} />
                                     </button>
                                 </div>
                             </div>
                        </div>
                    </div>

                    {/* TICKET GRID */}
                    <div style={{ flex: 1, padding: '30px', overflowY: 'auto', background: 'var(--background)' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                             <AnimatePresence>
                                {paginatedOrders.map(order => (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        onClick={() => updateOrderStatus(order.id, order.status)}
                                        className="kitchen-ticket"
                                        style={{ 
                                            background: 'var(--surface)', 
                                            borderRadius: '16px', 
                                            overflow: 'hidden', 
                                            border: '1px solid var(--surface-border)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                                            position: 'relative'
                                        }}
                                    >
                                        {/* Status Line Top */}
                                        <div style={{ 
                                            height: '4px', 
                                            width: '100%', 
                                            background: order.status === 'pending' ? '#3b82f6' : order.status === 'preparing' ? '#f59e0b' : '#10b981' 
                                        }} />
                                        
                                        {/* Header */}
                                        <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--text-main)' }}>#{order.id}</span>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                                {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>

                                        {/* Items List */}
                                        <div style={{ padding: '20px', flex: 1 }}>
                                            {order.items.map((item, i) => (
                                                <div 
                                                    key={i} 
                                                    onClick={(e) => toggleItemComplete(order.id, item.id, e)}
                                                    style={{ 
                                                        display: 'flex', 
                                                        gap: '12px', 
                                                        marginBottom: '12px',
                                                        fontSize: '1.1rem',
                                                        color: item.completed ? 'var(--text-muted)' : 'var(--text-main)',
                                                        textDecoration: item.completed ? 'line-through' : 'none',
                                                        transition: 'all 0.2s',
                                                        opacity: item.completed ? 0.6 : 1
                                                    }}
                                                >
                                                    <span style={{ fontWeight: '700', color: item.completed ? 'var(--text-muted)' : 'var(--primary)' }}>{item.quantity} x</span>
                                                    <span>{item.product_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Footer Hint */}
                                        <div style={{ padding: '10px 20px', background: 'var(--background)', borderTop: '1px solid var(--surface-border)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                            {order.status === 'pending' && "Tap to Start Preparing"}
                                            {order.status === 'preparing' && "Tap to Complete"}
                                            {order.status === 'completed' && "Completed"}
                                        </div>
                                    </motion.div>
                                ))}
                             </AnimatePresence>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
