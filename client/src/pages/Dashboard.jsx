import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder, FiClock, FiUsers } from 'react-icons/fi';
import ProjectModal from '../components/admin/ProjectModal';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const [projectsRes, tasksRes] = await Promise.all([
                axios.get('http://localhost:5000/api/projects', config),
                axios.get('http://localhost:5000/api/tasks/my-tasks', config)
            ]);
            setProjects(projectsRes.data);
            setTasks(tasksRes.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);



    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Workspace...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}>My Workspace</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username}. Here's what's happening.</p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiPlus />
                        <span>New Project</span>
                    </button>
                )}
            </div>

            {/* My Tasks Section */}
            {tasks.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiClock style={{ color: 'var(--primary)' }} />
                        Tasks Assigned to You
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {tasks.map(task => (
                            <div key={task._id} className="glass-card" style={{ padding: '20px', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '4px 8px', background: '#f1f5f9', borderRadius: '6px', color: '#64748b' }}>
                                        {task.project?.name}
                                    </span>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: task.status === 'Done' ? '#10b981' : '#f59e0b' }}>
                                        {task.status}
                                    </span>
                                </div>
                                <h3 style={{ fontSize: '0.925rem', marginBottom: '16px' }}>{task.title}</h3>
                                {task.deadline && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        <FiClock />
                                        <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                <h2 style={{ gridColumn: '1 / -1', fontSize: '1.25rem', fontWeight: 700, marginBottom: '0px' }}>Active Projects</h2>
                {projects.map((project) => (
                    <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none' }}>
                        <div className="glass-card" style={{
                            padding: '24px',
                            borderRadius: '16px',
                            height: '100%',
                            transition: 'transform 0.2s',
                            cursor: 'pointer'
                        }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: '#f5f3ff', color: 'var(--primary)',
                                borderRadius: '10px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                marginBottom: '20px'
                            }}>
                                <FiFolder fontSize="1.25rem" />
                            </div>
                            <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{project.name}</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', marginBottom: '24px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{project.description}</p>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
                                    <FiClock />
                                    <span>Updated 2h ago</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <div style={{ width: '24px', height: '24px', background: '#e2e8f0', borderRadius: '50%', border: '2px solid white' }}></div>
                                    <div style={{ width: '24px', height: '24px', background: '#cbd5e1', borderRadius: '50%', border: '2px solid white', marginLeft: '-8px' }}></div>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginLeft: '4px' }}>+3</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <ProjectModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                onSuccess={fetchProjects}
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

export default Dashboard;
