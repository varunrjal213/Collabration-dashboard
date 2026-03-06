import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiClock, FiCheckSquare, FiMessageSquare } from 'react-icons/fi';
import io from 'socket.io-client';

const ActivityFeed = () => {
    const { user } = useAuth();
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const socket = io('http://localhost:5000');
        socket.emit('joinAdmin');

        socket.on('admin:activity', (activity) => {
            setActivities(prev => [activity, ...prev].slice(0, 50)); // Keep more in full view
        });

        return () => socket.disconnect();
    }, [user]);

    const getActivityIcon = (type) => {
        switch (type) {
            case 'TASK_UPDATE': return <FiCheckSquare />;
            case 'COMMENT_ADDED': return <FiMessageSquare />;
            default: return <FiActivity />;
        }
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'TASK_UPDATE': return '#6d28d9';
            case 'COMMENT_ADDED': return '#059669';
            default: return '#4b5563';
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Live Activity Log</h1>
                <p style={{ color: '#64748b' }}>Technical log of all significant events occurring on CollabHub.</p>
            </div>

            <div style={{
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                padding: '32px',
                minHeight: '60vh',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activities.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                            <FiActivity style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                            <p>No activity recorded since you logged in.</p>
                        </div>
                    ) : (
                        activities.map((activity, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '20px',
                                padding: '16px 24px',
                                borderLeft: `4px solid ${getActivityColor(activity.type)}`,
                                background: idx % 2 === 0 ? '#f8fafc' : 'white',
                                borderRadius: '0 12px 12px 0',
                                animation: 'slideRight 0.3s ease-out'
                            }}>
                                <div style={{
                                    width: '36px', height: '36px',
                                    background: `${getActivityColor(activity.type)}10`,
                                    color: getActivityColor(activity.type),
                                    borderRadius: '10px',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: '1.1rem'
                                }}>
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                        <span style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: getActivityColor(activity.type) }}>
                                            {activity.type.replace('_', ' ')}
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiClock /> {new Date(activity.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.925rem', color: '#1e293b' }}>
                                        {activity.type === 'TASK_UPDATE'
                                            ? `Task "${activity.data.title}" was moved to ${activity.data.status}`
                                            : `A new comment was posted: "${activity.data.text}"`
                                        }
                                    </p>
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px' }}>
                                    ID: {activity.data._id?.slice(-6)}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideRight {
                    from { opacity: 0; transform: translateX(-15px); }
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

export default ActivityFeed;
