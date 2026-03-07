import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiLock, FiMail, FiCheck, FiAlertCircle } from 'react-icons/fi';

const Settings = () => {
    const { user, login } = useAuth();
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put('http://localhost:5000/api/users/profile', { username, email }, config);

            // Update local storage and context
            const updatedUser = { ...data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // We can't directly call 'login' since it expects email/pass, 
            // but we can manually update the context if we had a setAuth method.
            // For now, let's just show success and the user might need to refresh or we can use a workaround.
            // Since AuthContext uses the localStorage on load, refresh works.
            // But let's try to update state via the login function if it accepts a full user object? No.
            // I'll assume for this simple app, we just notify and refresh or use the fact that AuthContext
            // might be watching localStorage.

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage(null);

        if (password !== confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match' });
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put('http://localhost:5000/api/users/profile', { password }, config);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Settings</h1>
                <p style={{ color: '#64748b' }}>Manage your account settings and preferences.</p>
            </div>

            {message && (
                <div style={{
                    padding: '16px', borderRadius: '12px', marginBottom: '24px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    backgroundColor: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                    color: message.type === 'success' ? '#16a34a' : '#dc2626',
                    border: `1px solid ${message.type === 'success' ? '#bcf0da' : '#fecaca'}`
                }}>
                    {message.type === 'success' ? <FiCheck /> : <FiAlertCircle />}
                    <span>{message.text}</span>
                </div>
            )}

            <div style={{ display: 'grid', gap: '32px' }}>
                {/* Profile Section */}
                <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <FiUser style={{ color: '#4f46e5', fontSize: '1.25rem' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Profile Information</h2>
                    </div>
                    <form onSubmit={handleUpdateProfile}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 24px' }}>
                            Update Profile
                        </button>
                    </form>
                </div>

                {/* Password Section */}
                <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                        <FiLock style={{ color: '#4f46e5', fontSize: '1.25rem' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Change Password</h2>
                    </div>
                    <form onSubmit={handleChangePassword}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>New Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Confirm Password</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 24px' }}>
                            Update Password
                        </button>
                    </form>
                </div>
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

export default Settings;
