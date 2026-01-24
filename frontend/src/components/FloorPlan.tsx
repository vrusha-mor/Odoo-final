import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { LayoutGrid, Users, Armchair, ChevronRight } from 'lucide-react';
import '../styles/app.css';

type Table = {
    id: number;
    table_number: string;
    seats: number;
    floor_id: number;
    is_active: boolean;
    is_occupied: boolean;
};

export default function FloorPlan() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFloor, setSelectedFloor] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:3001/tables', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTables(res.data);
        } catch (err) {
            console.error("Error fetching tables", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTableClick = (table: Table) => {
        // If occupied, maybe show order details? For now just go to POS
        localStorage.setItem('activeTable', JSON.stringify(table));
        navigate('/pos');
    };

    const filteredTables = tables.filter(t => (t.floor_id || 1) === selectedFloor);

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', display: 'flex', flexDirection: 'column' }}>
            <Navbar />
            
            <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                
                {/* Header Section */}
                <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Floor <span style={{ color: 'var(--primary)' }}>Plan</span>
                        </h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage restaurant seating layout</p>
                    </div>

                     <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ background: 'white', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Available</span>
                        </div>
                        <div style={{ background: 'white', padding: '8px 16px', borderRadius: '50px', border: '1px solid var(--surface-border)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--error)' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Occupied</span>
                        </div>
                    </div>
                </div>

                {/* Floor Tabs */}
                <div style={{ width: '100%', maxWidth: '1200px', marginBottom: '30px', display: 'flex', gap: '15px' }}>
                    {[1, 2].map(floor => (
                        <button
                            key={floor}
                            onClick={() => setSelectedFloor(floor)}
                            style={{
                                padding: '12px 25px',
                                borderRadius: '12px',
                                border: 'none',
                                background: selectedFloor === floor ? 'var(--primary)' : 'white',
                                color: selectedFloor === floor ? 'white' : 'var(--text-muted)',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: selectedFloor === floor ? '0 10px 20px -5px var(--primary-glow)' : '0 2px 5px rgba(0,0,0,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <LayoutGrid size={18} />
                            Floor {floor}
                        </button>
                    ))}
                </div>

                {/* Main Grid Container */}
                <div 
                    style={{ 
                        width: '100%', 
                        maxWidth: '1200px', 
                        flex: 1, 
                        background: 'white',
                        borderRadius: '24px',
                        padding: '40px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.05)',
                        border: '1px solid var(--surface-border)',
                        minHeight: '600px'
                    }}
                >
                    {loading ? (
                         <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                             <LayoutGrid className="animate-spin" />
                             <span>Loading layout...</span>
                         </div>
                    ) : filteredTables.length === 0 ? (
                        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                            <p>No tables found on Floor {selectedFloor}</p>
                        </div>
                    ) : (
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                            gap: '30px', 
                            width: '100%' 
                        }}>
                            <AnimatePresence mode='popLayout'>
                            {filteredTables.map((table) => (
                                <motion.div
                                    key={table.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.03, translateY: -5 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleTableClick(table)}
                                    style={{
                                        aspectRatio: '1',
                                        background: 'white',
                                        border: `2px solid ${table.is_occupied ? '#fee2e2' : '#ecfdf5'}`,
                                        borderRadius: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        boxShadow: table.is_occupied 
                                            ? '0 10px 30px -5px rgba(239, 68, 68, 0.15)' 
                                            : '0 10px 30px -5px rgba(16, 185, 129, 0.15)'
                                    }}
                                >
                                    {/* Top Accent Bar */}
                                    <div style={{ 
                                        position: 'absolute', 
                                        top: 0, 
                                        left: 0, 
                                        right: 0, 
                                        height: '6px', 
                                        background: table.is_occupied ? 'var(--error)' : 'var(--success)' 
                                    }} />

                                    {/* Status Badge */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '15px',
                                        right: '15px',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: table.is_occupied ? 'var(--error)' : 'var(--success)',
                                        boxShadow: `0 0 10px ${table.is_occupied ? 'var(--error)' : 'var(--success)'}`
                                    }} />

                                    <div style={{ 
                                        width: '80px', 
                                        height: '80px', 
                                        borderRadius: '50%', 
                                        background: table.is_occupied ? '#fef2f2' : '#f0fdf4', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        marginBottom: '20px',
                                        border: `1px solid ${table.is_occupied ? '#fee2e2' : '#dcfce7'}`
                                    }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: '800', color: table.is_occupied ? 'var(--error)' : 'var(--success)' }}>
                                            {table.table_number}
                                        </span>
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' }}>
                                        <Users size={16} />
                                        <span>{table.seats} Seats</span>
                                    </div>

                                    {table.is_occupied ? (
                                        <div style={{ marginTop: '15px', padding: '6px 12px', background: '#fee2e2', borderRadius: '8px', color: 'var(--error)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            OCCUPIED
                                        </div>
                                    ) : (
                                        <div style={{ marginTop: '15px', padding: '6px 12px', background: '#f0fdf4', borderRadius: '8px', color: 'var(--success)', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                            AVAILABLE
                                        </div>
                                    )}

                                </motion.div>
                            ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
