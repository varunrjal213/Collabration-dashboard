import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiShield, FiTrash2, FiSearch } from 'react-icons/fi';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async () => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            const { data } = await axios.get('http://localhost:5000/api/admin/users', config);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchUsers();
    }, [user]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.put(`http://localhost:5000/api/admin/users/${userId}/role`, { role: newRole }, config);
            fetchUsers();
        } catch (error) {
            alert('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
            };
            await axios.delete(`http://localhost:5000/api/admin/users/${userId}`, config);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Users...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>User & Team Management</h1>
                    <p style={{ color: '#64748b' }}>Manage registered users and their permissions.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                        type="text"
                        placeholder="Search users..."
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

            <div style={{
                background: 'white',
                borderRadius: '24px',
                border: '1px solid #e2e8f0',
                overflow: 'hidden',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>USER</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>EMAIL</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>ROLE</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem' }}>STATUS</th>
                            <th style={{ padding: '16px 24px', color: '#64748b', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u._id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fcfdff'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px', height: '32px',
                                            background: '#e0e7ff', color: '#4f46e5',
                                            borderRadius: '8px', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center',
                                            fontWeight: 700, fontSize: '0.75rem'
                                        }}>
                                            {u.username[0].toUpperCase()}
                                        </div>
                                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{u.username}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', color: '#64748b', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiMail />
                                        {u.email}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <select
                                        value={u.role}
                                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                                        style={{
                                            padding: '6px 12px',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                            fontSize: '0.875rem',
                                            background: '#f8fafc',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#ecfdf5', color: '#059669', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                                        Active
                                    </div>
                                </td>
                                <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDeleteUser(u._id)}
                                        style={{
                                            padding: '8px',
                                            color: '#ef4444',
                                            background: 'transparent',
                                            borderRadius: '8px',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
                        <FiUser style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.3 }} />
                        <p>No users found matching your search.</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
