import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FiPlus, FiFolder, FiClock, FiUsers } from 'react-icons/fi';

const Dashboard = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/projects', config);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.post('http://localhost:5000/api/projects', {
                name: newProjectName,
                description: newProjectDesc,
                members: [],
            }, config);
            setShowModal(false);
            setNewProjectName('');
            setNewProjectDesc('');
            fetchProjects();
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Workspace...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', letterSpacing: '-0.025em' }}>My Workspace</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.username}. Here's what's happening.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                    <FiPlus />
                    <span>New Project</span>
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
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

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
                }}>
                    <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', width: '480px', background: 'white' }}>
                        <h2 style={{ marginBottom: '8px' }}>Create New Project</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.875rem' }}>Set up a new workspace for your team.</p>
                        <form onSubmit={handleCreateProject}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Project Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Website Redesign"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                                <textarea
                                    placeholder="Briefly describe the project goals..."
                                    value={newProjectDesc}
                                    onChange={(e) => setNewProjectDesc(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', minHeight: '100px', outline: 'none', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: 'var(--text-main)', borderRadius: '10px' }}>Cancel</button>
                                <button type="submit" className="btn-primary">Create Project</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

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
