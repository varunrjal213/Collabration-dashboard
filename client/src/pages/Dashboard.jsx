import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder, FiClock, FiUsers, FiCheckCircle, FiActivity, FiTrendingUp, FiCheckSquare } from 'react-icons/fi';
import ProjectModal from '../components/admin/ProjectModal';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_API_URL;

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [activities, setActivities] = useState([]);
    const [activeTab, setActiveTab] = useState('tasks');
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const [projectsRes, tasksRes] = await Promise.all([
                axios.get(`${ENDPOINT}/api/projects`, config),
                axios.get(`${ENDPOINT}/api/tasks/my-tasks`, config)
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
        if (user) {
            fetchProjects();

            const socket = io(ENDPOINT);
            
            // Join all project rooms the user is part of for live updates
            projects.forEach(p => socket.emit('joinProject', p._id));

            socket.on('taskUpdated', (data) => {
                // Add to live feed
                setActivities(prev => [{
                    type: 'TASK_UPDATE',
                    user: data.sender?.username || 'Team Member',
                    text: `Updated task: ${data.title}`,
                    timestamp: new Date()
                }, ...prev].slice(0, 10));
                
                // Refresh data to keep stats synced
                fetchProjects();
            });

            return () => socket.disconnect();
        }
    }, [user, projects.length]);

    const handleUpdateStatus = async (taskId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${ENDPOINT}/api/tasks/${taskId}`, { status: newStatus }, config);
            fetchProjects(); // Refresh dashboard
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };

    const stats = {
        totalProjects: projects.length,
        pendingTasks: tasks.filter(t => t.status !== 'Done').length,
        completedTasks: tasks.filter(t => t.status === 'Done').length,
        completionRate: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 100) : 0,
        upcomingDeadlines: tasks.filter(t => t.deadline && new Date(t.deadline) > new Date() && t.status !== 'Done').length
    };

    const getDayNumber = (deadline, project) => {
        if (project?.startDate) {
            const start = new Date(project.startDate);
            const end = new Date(deadline);
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            return diff > 0 ? diff : 1;
        }
        return new Date(deadline).getDate();
    };

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (loading) return (
        <div style={{ height: 'calc(100vh - 150px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div className="loading-spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Preparing your workspace...</p>
            </div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.04em', marginBottom: '8px' }}>
                        {getTimeGreeting()}, {user?.username.split(' ')[0]}!
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>
                        You have <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{stats.pendingTasks} tasks</span> in your focused backlog.
                    </p>
                </div>
                {user?.role === 'admin' && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)' }}
                    >
                        <FiPlus fontSize="1.25rem" />
                        <span style={{ fontWeight: 600 }}>Create Project</span>
                    </button>
                )}
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '48px' }}>
                {[
                    { label: 'Active Projects', value: stats.totalProjects, icon: <FiFolder />, color: '#6366f1' },
                    { label: 'Weekly Velocity', value: `${stats.completionRate}%`, icon: <FiTrendingUp />, color: '#8b5cf6' },
                    { label: 'Tasks Done', value: stats.completedTasks, icon: <FiCheckCircle />, color: '#10b981' },
                    { label: 'Deadlines', value: stats.upcomingDeadlines, icon: <FiClock />, color: '#ef4444' },
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '24px', borderRadius: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${s.color}10`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                            {s.icon}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</p>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800 }}>{s.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                {/* Main Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                    
                    {/* Performance Metrics Chart */}
                    <section className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'white' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiTrendingUp style={{ color: 'var(--primary)' }} />
                            Personal Performance
                        </h2>
                        <div style={{ height: '140px', display: 'flex', alignItems: 'flex-end', gap: '20px', padding: '10px 0' }}>
                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                                // Mock historical data for visual appeal
                                const heights = [40, 65, 30, 85, 55, 20, 10]; 
                                return (
                                    <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ 
                                            width: '100%', 
                                            height: `${heights[idx]}%`, 
                                            background: idx === 3 ? 'var(--primary)' : '#e0e7ff',
                                            borderRadius: '8px',
                                            transition: 'height 1s ease'
                                        }}></div>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{day}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </section>

                    {/* Active Projects Selection */}
                    <section>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '4px', height: '24px', background: 'var(--primary)', borderRadius: '2px' }}></div>
                                Managed Projects
                            </h2>
                            <Link to="/projects" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            gap: '28px', 
                            overflowX: 'auto', 
                            paddingBottom: '24px',
                            scrollBehavior: 'smooth',
                            WebkitOverflowScrolling: 'touch',
                            msOverflowStyle: 'none',
                            scrollbarWidth: 'none'
                        }} className="hide-scrollbar">
                            {projects.map((project) => {
                                const daysRemaining = project.endDate ? Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : null;
                                const isBehind = project.progress < 50 && daysRemaining < 7;
                                
                                return (
                                    <Link to={`/project/${project._id}`} key={project._id} style={{ textDecoration: 'none', flex: '0 0 350px' }}>
                                        <div className="glass-card" style={{ padding: '28px', borderRadius: '32px', height: '100%', position: 'relative', overflow: 'hidden', border: isBehind ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid var(--border)' }}>
                                            {/* Status Badge */}
                                            <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '8px' }}>
                                                {daysRemaining !== null && (
                                                    <span style={{ padding: '4px 10px', borderRadius: '10px', background: daysRemaining < 3 ? '#fee2e2' : '#f1f5f9', color: daysRemaining < 3 ? '#ef4444' : '#64748b', fontSize: '0.65rem', fontWeight: 800 }}>
                                                        {daysRemaining > 0 ? `${daysRemaining}D LEFT` : 'OVERDUE'}
                                                    </span>
                                                )}
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isBehind ? '#ef4444' : '#10b981', marginTop: '6px' }} title={isBehind ? 'Behind Schedule' : 'On Track'}></div>
                                            </div>

                                            <div style={{ width: '48px', height: '48px', background: isBehind ? '#fef2f2' : '#f5f3ff', color: isBehind ? '#ef4444' : 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                                <FiFolder fontSize="1.5rem" />
                                            </div>
                                            
                                            <h3 style={{ marginBottom: '8px', fontSize: '1.35rem', fontWeight: 800, color: '#1e293b' }}>{project.name}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {project.description}
                                            </p>

                                            {/* Progress Bar Section */}
                                            <div style={{ marginBottom: '24px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 800, marginBottom: '8px' }}>
                                                    <span style={{ color: '#94a3b8', letterSpacing: '0.05em' }}>COMPLETION</span>
                                                    <span style={{ color: isBehind ? '#ef4444' : 'var(--primary)' }}>{project.progress}%</span>
                                                </div>
                                                <div className="progress-container" style={{ height: '8px', background: '#f1f5f9' }}>
                                                    <div className="progress-fill" style={{ width: `${project.progress}%`, background: isBehind ? '#ef4444' : 'var(--primary)' }}></div>
                                                </div>
                                            </div>

                                            {/* Next Milestone / Task Section */}
                                            {project.nextTask && (
                                                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', marginBottom: '24px', border: '1px solid #f1f5f9' }}>
                                                    <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.05em' }}>NEXT MILESTONE</p>
                                                    <p style={{ fontSize: '0.825rem', fontWeight: 700, color: '#334155' }}>{project.nextTask.title}</p>
                                                </div>
                                            )}

                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {project.members?.slice(0, 3).map((m, i) => (
                                                        <div key={i} title={m.username} style={{ width: '32px', height: '32px', background: '#e2e8f0', borderRadius: '50%', border: '2px solid white', marginLeft: i > 0 ? '-12px' : '0', zIndex: 3 - i, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#64748b' }}>
                                                            {m.username?.[0].toUpperCase()}
                                                        </div>
                                                    ))}
                                                    {project.members?.length > 3 && (
                                                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>+{project.members.length - 3}</span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    Manage <FiActivity fontSize="1rem" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Sidebar Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                    {/* Activity & Tasks Shared Panel */}
                    <section className="glass-card" style={{ padding: '32px', borderRadius: '32px', background: 'white' }}>
                        <div style={{ display: 'flex', gap: '20px', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                            <button 
                                onClick={() => setActiveTab('tasks')}
                                style={{ background: 'transparent', fontSize: '1rem', fontWeight: 800, color: activeTab === 'tasks' ? 'var(--primary)' : '#94a3b8', borderBottom: activeTab === 'tasks' ? '3px solid var(--primary)' : '3px solid transparent', paddingBottom: '8px', cursor: 'pointer' }}>
                                Action Items
                            </button>
                            <button 
                                onClick={() => setActiveTab('feed')}
                                style={{ background: 'transparent', fontSize: '1rem', fontWeight: 800, color: activeTab === 'feed' ? 'var(--primary)' : '#94a3b8', borderBottom: activeTab === 'feed' ? '3px solid var(--primary)' : '3px solid transparent', paddingBottom: '8px', cursor: 'pointer' }}>
                                Live Feed
                            </button>
                        </div>

                        {activeTab === 'tasks' ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {tasks.filter(t => t.status !== 'Done').slice(0, 6).map(task => (
                                    <div key={task._id} style={{ padding: '16px', borderRadius: '16px', background: '#f8fafc', border: '1px solid #f1f5f9', transition: 'all 0.2s' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span className={`badge badge-warning`}>{task.status}</span>
                                            <button 
                                                onClick={(e) => { e.preventDefault(); handleUpdateStatus(task._id, 'Done'); }}
                                                style={{ background: 'white', color: '#10b981', padding: '4px 8px', borderRadius: '8px', border: '1px solid #dcfce7', fontSize: '0.7rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiCheckCircle /> Mark Done
                                            </button>
                                        </div>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>{task.title}</h4>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{task.project?.name}</p>
                                            {task.deadline && (
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <FiClock />
                                                    <span style={{ fontWeight: 800, color: 'var(--primary)' }}>
                                                        Day {getDayNumber(task.deadline, task.project)}
                                                    </span>
                                                    · {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {tasks.filter(t => t.status !== 'Done').length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                                        <FiCheckSquare style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.3 }} />
                                        <p style={{ fontSize: '0.875rem' }}>All caught up! No pending tasks.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {activities.map((activity, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '12px', padding: '12px', borderRadius: '12px', background: '#f8fafc' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <FiActivity />
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.825rem', fontWeight: 700 }}>{activity.user}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{activity.text}</p>
                                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>{activity.timestamp.toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                                {activities.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '32px', color: '#94a3b8' }}>
                                        <p style={{ fontSize: '0.875rem' }}>No recent activity to show.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </section>

                    {/* Achievement / Info Card */}
                    <section style={{ padding: '32px', borderRadius: '32px', background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '12px' }}>Personal Best</h3>
                            <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '24px' }}>
                                You've maintained a <span style={{ fontWeight: 800 }}>{stats.completionRate}% completion rate</span> this week. You're in the top 10% of contributors!
                            </p>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '0.875rem', fontWeight: 600 }}>
                                <div style={{ width: '8px', height: '8px', background: '#4ade80', borderRadius: '50%' }}></div>
                                Top Contributor
                            </div>
                        </div>
                        <FiTrendingUp style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '120px', opacity: 0.1 }} />
                    </section>
                </div>
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
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .glass-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-lg);
                    border-color: rgba(79, 70, 229, 0.2);
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
