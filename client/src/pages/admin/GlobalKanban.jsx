import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiCheckSquare, FiUser, FiCalendar, FiFlag, FiSearch, FiPlus } from 'react-icons/fi';
import TaskModal from '../../components/admin/TaskModal';

const GlobalKanban = () => {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const fetchTasks = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/admin/tasks', config);
            setTasks(data);
        } catch (error) {
            console.error('Error fetching admin tasks:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchTasks();
    }, [user]);

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://localhost:5000/api/tasks/${taskId}`, { status: newStatus }, config);
            fetchTasks();
        } catch (error) {
            alert('Failed to update task status');
        }
    };

    const columns = ['To-Do', 'In-Progress', 'Done'];

    const filteredTasks = tasks.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.project?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Global Kanban...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Global Kanban Board</h1>
                    <p style={{ color: '#64748b' }}>Cross-project task management and oversight.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 24px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)'
                        }}
                    >
                        <FiPlus /> Create Task
                    </button>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search tasks or projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '12px 16px 12px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                width: '300px',
                                background: 'white'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', alignItems: 'start' }}>
                {columns.map(column => (
                    <div key={column} style={{
                        background: '#f8fafc',
                        borderRadius: '20px',
                        padding: '20px',
                        border: '1px solid #e2e8f0',
                        minHeight: '70vh'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', background: column === 'Done' ? '#10b981' : (column === 'In-Progress' ? '#f59e0b' : '#94a3b8'), borderRadius: '50%' }}></div>
                                {column}
                            </h3>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#e2e8f0', padding: '2px 8px', borderRadius: '10px', color: '#64748b' }}>
                                {filteredTasks.filter(t => t.status === column).length}
                            </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {filteredTasks.filter(t => t.status === column).map(task => (
                                <div key={task._id} style={{
                                    background: 'white',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    transition: 'transform 0.1s'
                                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            background: '#f0f9ff',
                                            color: '#0369a1',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            borderRadius: '6px',
                                            textTransform: 'uppercase'
                                        }}>
                                            {task.project?.name || 'No Project'}
                                        </span>
                                        <select
                                            value={task.status}
                                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                            style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', outline: 'none' }}
                                        >
                                            {columns.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <h4 style={{ fontSize: '0.925rem', marginBottom: '12px', color: '#1e293b' }}>{task.title}</h4>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f8fafc' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '24px', height: '24px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                                                {task.assignedTo?.username?.[0]?.toUpperCase() || '?'}
                                            </div>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{task.assignedTo?.username || 'Unassigned'}</span>
                                        </div>
                                        {task.deadline && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.7rem' }}>
                                                <FiCalendar />
                                                <span>{new Date(task.deadline).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTasks}
                user={user}
            />

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default GlobalKanban;
