import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiLayers, FiCheckSquare, FiActivity, FiArrowUpRight, FiClock } from 'react-icons/fi';
import io from 'socket.io-client';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${user.token}` },
                };
                const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/stats`, config);
                setStats(data);
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();

        // Socket logic for live activity
        const ENDPOINT = import.meta.env.VITE_API_URL;
        const socket = io(ENDPOINT);
        socket.emit('joinAdmin');

        socket.on('admin:activity', (activity) => {
            setActivities(prev => [activity, ...prev].slice(0, 10)); // Keep last 10
        });

        return () => socket.disconnect();
    }, [user]);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Admin Metrics...</div>;

    const cards = [
        { title: 'Total Users', value: stats?.totalUsers, icon: <FiUsers />, color: '#4f46e5' },
        { title: 'Total Projects', value: stats?.totalProjects, icon: <FiLayers />, color: '#0ea5e9' },
        { title: 'Active Tasks', value: stats?.pendingTasks, icon: <FiCheckSquare />, color: '#f59e0b' },
        { title: 'Completed', value: stats?.completedTasks, icon: <FiActivity />, color: '#10b981' },
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.025em' }}>Platform Overview</h1>
                <p style={{ color: '#64748b', fontSize: '1.1rem' }}>Real-time health and engagement metrics for CollabHub.</p>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                {cards.map((card, index) => (
                    <div key={index} style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '20px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '48px', height: '48px',
                            background: `${card.color}15`,
                            color: card.color,
                            borderRadius: '12px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.5rem'
                        }}>
                            {card.icon}
                        </div>
                        <div>
                            <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.title}</p>
                            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#1e293b' }}>{card.value}</h2>
                        </div>
                        <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.875rem', fontWeight: 600 }}>
                            <FiArrowUpRight />
                            <span>Live</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Live Activity Feed */}
                <div style={{
                    background: 'white',
                    padding: '32px',
                    borderRadius: '24px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ fontSize: '1.25rem' }}>Live Activity Feed</h3>
                        <div style={{ padding: '6px 12px', background: '#f8fafc', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', border: '1px solid #e2e8f0' }}>
                            REAL-TIME MONITORING
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {activities.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                <FiActivity style={{ fontSize: '2rem', marginBottom: '12px', opacity: 0.5 }} />
                                <p>Waiting for platform activity...</p>
                            </div>
                        ) : (
                            activities.map((activity, idx) => (
                                <div key={idx} style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    background: '#f8fafc',
                                    border: '1px solid #f1f5f9',
                                    animation: 'slideIn 0.3s ease-out'
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px',
                                        background: activity.type === 'TASK_UPDATE' ? '#f5f3ff' : '#ecfdf5',
                                        color: activity.type === 'TASK_UPDATE' ? '#6d28d9' : '#059669',
                                        borderRadius: '12px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        {activity.type === 'TASK_UPDATE' ? <FiCheckSquare /> : <FiActivity />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.925rem' }}>
                                            {activity.type === 'TASK_UPDATE' ? 'Task Updated' : 'New Comment Added'}
                                        </p>
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            {activity.type === 'TASK_UPDATE' ? activity.data.title : activity.data.text}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.75rem' }}>
                                        <FiClock />
                                        <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Quick Actions / Platform Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{
                        background: '#4f46e5',
                        padding: '32px',
                        borderRadius: '24px',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '12px', position: 'relative', zIndex: 1 }}>System Health</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '24px', position: 'relative', zIndex: 1 }}>All systems operational. Database and Socket servers are running optimally.</p>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
                            <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                            Operational
                        </div>
                        <FiActivity style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '120px', opacity: 0.1 }} />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
