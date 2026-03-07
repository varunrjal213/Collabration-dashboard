import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCheck, FiCalendar, FiUser, FiLayers } from 'react-icons/fi';

const TaskModal = ({ isOpen, onClose, onSuccess, initialProjectId = null, user }) => {
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: initialProjectId || '',
        assignedTo: '',
        deadline: '',
        status: 'To-Do'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [projectsRes, usersRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/admin/projects', config),
                    axios.get('http://localhost:5000/api/admin/users', config)
                ]);

                setProjects(projectsRes.data);
                setAllUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching modal data:', error);
            }
        };
        if (isOpen) fetchData();
    }, [isOpen, user, initialProjectId]);

    const handleProjectChange = (projectId) => {
        setFormData({ ...formData, project: projectId });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/tasks', formData, config);
            onSuccess();
            onClose();
            setFormData({
                title: '',
                description: '',
                project: '',
                assignedTo: '',
                deadline: '',
                status: 'To-Do'
            });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create task');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
        }}>
            <div style={{
                background: 'white',
                width: '100%',
                maxWidth: '500px',
                borderRadius: '24px',
                padding: '32px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'modalFadeIn 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Task</h2>
                    <button onClick={onClose} style={{ border: 'none', background: '#f1f5f9', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Task Title</label>
                        <input
                            required
                            type="text"
                            placeholder="e.g., Design UI components"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            style={inputStyle}
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Description</label>
                        <textarea
                            rows="3"
                            placeholder="Task details..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{ ...inputStyle, resize: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Project</label>
                            <div style={{ position: 'relative' }}>
                                <FiLayers style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <select
                                    required
                                    value={formData.project}
                                    onChange={(e) => handleProjectChange(e.target.value)}
                                    style={{ ...inputStyle, paddingLeft: '40px' }}
                                >
                                    <option value="">Select Project</option>
                                    {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Assign To</label>
                            <div style={{ position: 'relative' }}>
                                <FiUser style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <select
                                    required
                                    value={formData.assignedTo}
                                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: '40px' }}
                                >
                                    <option value="">Assign User</option>
                                    {allUsers.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Deadline</label>
                            <div style={{ position: 'relative' }}>
                                <FiCalendar style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    style={{ ...inputStyle, paddingLeft: '40px' }}
                                />
                            </div>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Initial Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                style={inputStyle}
                            >
                                <option value="To-Do">To-Do</option>
                                <option value="In-Progress">In-Progress</option>
                                <option value="Done">Done</option>
                            </select>
                        </div>
                    </div>

                    <button
                        disabled={loading}
                        type="submit"
                        style={{
                            width: '100%',
                            padding: '14px',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Creating...' : <><FiCheck /> Create Task</>}
                    </button>
                </form>
            </div>
            <style>{`
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '0.925rem',
    background: '#f8fafc'
};

export default TaskModal;
