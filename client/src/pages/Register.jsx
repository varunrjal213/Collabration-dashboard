import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('member');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register(username, email, password, role);
            navigate('/login');
        } catch (err) {
            setError(err || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            padding: '20px'
        }}>
            <div className="glass-card" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '48px',
                borderRadius: '24px',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '48px', height: '48px',
                    background: 'var(--primary)',
                    borderRadius: '12px',
                    margin: '0 auto 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.4)'
                }}>
                    <FiUser style={{ color: 'white', fontSize: '1.5rem' }} />
                </div>

                <h1 style={{ fontSize: '1.875rem', marginBottom: '8px', letterSpacing: '-0.025em' }}>Create Account</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Join our platform and start collaborating today</p>

                {error && (
                    <div style={{ padding: '12px', background: '#fef2f2', color: '#ef4444', borderRadius: '10px', fontSize: '0.875rem', marginBottom: '24px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <FiUser style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                placeholder="John Doe"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <FiMail style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Password</label>
                        <div style={{ position: 'relative' }}>
                            <FiLock style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white', outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '6px' }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <FiShield style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px 12px 48px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--border)',
                                    background: 'white', outline: 'none',
                                    appearance: 'none', cursor: 'pointer'
                                }}
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary" style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        fontSize: '1rem',
                        padding: '14px'
                    }}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <FiArrowRight />}
                    </button>
                </form>

                <p style={{ marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
