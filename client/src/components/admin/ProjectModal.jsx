import { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const ProjectModal = ({ isOpen, onClose, onSuccess, user }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.post('http://localhost:5000/api/projects', {
                name,
                description,
                members: [],
            }, config);

            setName('');
            setDescription('');
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error creating project:', error);
            alert('Failed to create project. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div className="glass-card" style={{
                padding: '32px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '480px',
                background: 'white',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute', top: '24px', right: '24px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#64748b', fontSize: '1.25rem'
                    }}
                >
                    <FiX />
                </button>

                <h2 style={{ marginBottom: '8px', fontSize: '1.5rem', fontWeight: 700 }}>Create New Project</h2>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.875rem' }}>Set up a new workspace for your team.</p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Project Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Website Redesign"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e2e8f0', outline: 'none',
                                fontSize: '0.925rem'
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Description</label>
                        <textarea
                            placeholder="Briefly describe the project goals..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{
                                width: '100%', padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e2e8f0', minHeight: '120px',
                                outline: 'none', resize: 'none',
                                fontSize: '0.925rem'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '10px 20px', background: '#f1f5f9',
                                color: '#475569', borderRadius: '10px',
                                border: 'none', fontWeight: 600, cursor: 'pointer'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 24px', background: '#4f46e5',
                                color: 'white', borderRadius: '10px',
                                border: 'none', fontWeight: 600, cursor: 'pointer',
                                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.4)',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProjectModal;
