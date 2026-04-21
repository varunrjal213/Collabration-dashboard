import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiX, FiCheck, FiCalendar, FiUser, FiLayers, FiTrash2 } from 'react-icons/fi';

const TaskModal = ({ isOpen, onClose, onSuccess, initialProjectId = null, user, task = null }) => {
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [taskNotes, setTaskNotes] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        project: initialProjectId || '',
        assignedTo: '',
        deadline: '',
        status: 'To-Do'
    });

    const fetchTaskNotes = async (taskId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/${taskId}`, config);
            setTaskNotes(data);
        } catch (error) {
            console.error('Error fetching task notes:', error);
        }
    };

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                project: task.project?._id || task.project || '',
                assignedTo: task.assignedTo?._id || task.assignedTo || '',
                deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
                status: task.status || 'To-Do'
            });
            fetchTaskNotes(task._id);
        } else {
            setFormData({
                title: '',
                description: '',
                project: initialProjectId || '',
                assignedTo: '',
                deadline: '',
                status: 'To-Do'
            });
            setTaskNotes([]);
        }
    }, [task, isOpen, initialProjectId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const [projectsRes, usersRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/projects`, config),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/admin/users`, config)
                ]);

                setProjects(projectsRes.data);
                setAllUsers(usersRes.data);
            } catch (error) {
                console.error('Error fetching modal data:', error);
            }
        };
        if (isOpen) fetchData();
    }, [isOpen, user]);

    const handleProjectChange = (projectId) => {
        setFormData({ ...formData, project: projectId });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (task) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, formData, config);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/tasks`, formData, config);
            }
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || `Failed to ${task ? 'update' : 'create'} task`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${task._id}`, config);
            onSuccess();
            onClose();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete task');
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
                maxWidth: '600px',
                borderRadius: '24px',
                padding: '32px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                animation: 'modalFadeIn 0.3s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{task ? 'Task Details' : 'Create New Task'}</h2>
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

                    {task && (
                        <div style={{ marginBottom: '32px', borderTop: '1px solid #f1f5f9', paddingTop: '24px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '16px', color: '#1e293b' }}>Member Updates</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {taskNotes.length === 0 ? (
                                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', textAlign: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px' }}>No updates from members yet.</p>
                                ) : (
                                    taskNotes.map((n) => (
                                        <div key={n._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '0.825rem', fontWeight: 800, color: '#4f46e5' }}>{n.author?.username}</span>
                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString()}</span>
                                            </div>
                                            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>{n.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px' }}>
                        {task && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={loading}
                                style={{
                                    padding: '14px',
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '12px',
                                    fontWeight: 700,
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    flexShrink: 0
                                }}
                            >
                                <FiTrash2 /> Delete
                            </button>
                        )}
                        <button
                            disabled={loading}
                            type="submit"
                            style={{
                                flex: 1,
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
                            {loading ? (task ? 'Updating...' : 'Creating...') : <><FiCheck /> {task ? 'Update Task' : 'Create Task'}</>}
                        </button>
                    </div>
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
