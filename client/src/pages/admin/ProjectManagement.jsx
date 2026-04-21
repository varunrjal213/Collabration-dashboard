import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiLayers, FiFolder, FiUser, FiCalendar, FiExternalLink, FiSearch, FiPlus, FiTrash2, FiAlertTriangle } from 'react-icons/fi';
import TaskModal from '../../components/admin/TaskModal';
import ProjectModal from '../../components/admin/ProjectModal';
import { Link } from 'react-router-dom';

const ProjectManagement = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const fetchProjects = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/projects`, config);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching admin projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = (projectId) => {
        setDeleteConfirmId(projectId);
    };

    const confirmDelete = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/projects/${deleteConfirmId}`, config);
            setDeleteConfirmId(null);
            fetchProjects();
        } catch (error) {
            console.error('Failed to delete project');
        }
    };

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Projects...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Project Management</h1>
                    <p style={{ color: '#64748b' }}>Monitor and manage all active projects across the platform.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <button
                        onClick={() => setIsProjectModalOpen(true)}
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
                        <FiPlus /> Create Project
                    </button>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search projects..."
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {filteredProjects.map((p) => (
                    <div key={p._id} style={{
                        background: 'white',
                        padding: '24px',
                        borderRadius: '24px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                        position: 'relative',
                        transition: 'transform 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{
                                width: '40px', height: '40px',
                                background: '#f0f9ff', color: '#0369a1',
                                borderRadius: '10px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.25rem'
                            }}>
                                <FiFolder />
                            </div>
                            <Link to={`/project/${p._id}`} style={{ color: '#64748b', fontSize: '1.25rem' }}>
                                <FiExternalLink />
                            </Link>
                        </div>

                        <h3 style={{ marginBottom: '8px', fontSize: '1.25rem' }}>{p.name}</h3>
                        <p style={{
                            color: '#64748b',
                            fontSize: '0.875rem',
                            lineHeight: '1.5',
                            marginBottom: '24px',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}>
                            {p.description}
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                <FiUser style={{ color: '#94a3b8' }} />
                                <span style={{ fontWeight: 600 }}>Created by:</span>
                                <span style={{ color: '#1e293b' }}>{p.createdBy?.username || 'Unknown'}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                <FiCalendar style={{ color: '#94a3b8' }} />
                                <span style={{ fontWeight: 600 }}>Created on:</span>
                                <span style={{ color: '#1e293b' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.875rem' }}>
                                <FiLayers style={{ color: '#94a3b8' }} />
                                <span style={{ fontWeight: 600 }}>Members:</span>
                                <span style={{ color: '#1e293b' }}>{p.members?.length || 0} users</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => {
                                    setSelectedProjectId(p._id);
                                    setIsModalOpen(true);
                                }}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#4f46e5',
                                    color: 'white',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                <FiPlus /> Task
                            </button>
                            <button style={{
                                flex: 1,
                                padding: '10px',
                                background: '#f1f5f9',
                                color: '#475569',
                                borderRadius: '10px',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                border: 'none'
                            }}>
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteProject(p._id)}
                                style={{
                                    padding: '10px 16px',
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    borderRadius: '10px',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <FiTrash2 /> Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProjectId(null);
                }}
                onSuccess={() => {
                    fetchProjects();
                    // Optional: show a toast or message
                }}
                initialProjectId={selectedProjectId}
                user={user}
            />

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
                onSuccess={fetchProjects}
                user={user}
            />

            {filteredProjects.length === 0 && (
                <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
                    <FiLayers style={{ fontSize: '4rem', marginBottom: '20px', opacity: 0.2 }} />
                    <p style={{ fontSize: '1.25rem' }}>No projects found.</p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setDeleteConfirmId(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'white', borderRadius: '20px', padding: '32px',
                        width: '420px', maxWidth: '90vw', boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: '#fef2f2', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444',
                            fontSize: '1.5rem'
                        }}>
                            <FiAlertTriangle />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Delete Project</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '28px' }}>
                            Are you sure you want to delete this project?<br />All tasks within it will also be permanently removed.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    color: '#475569'
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmDelete}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: 'none', background: '#ef4444', color: 'white',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            ><FiTrash2 /> Yes, Delete</button>
                        </div>
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

export default ProjectManagement;
