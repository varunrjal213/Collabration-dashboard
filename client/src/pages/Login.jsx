import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err || 'Failed to login. Please check your credentials.');
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
                maxWidth: '440px',
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
                    <FiLock style={{ color: 'white', fontSize: '1.5rem' }} />
                </div>

                <h1 style={{ fontSize: '1.875rem', marginBottom: '8px', letterSpacing: '-0.025em' }}>Welcome Back</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Enter your details to access your workspace</p>

                {error && (
                    <div style={{
                        padding: '12px',
                        background: '#fef2f2',
                        color: '#ef4444',
                        borderRadius: '10px',
                        fontSize: '0.875rem',
                        marginBottom: '24px',
                        fontWeight: 500
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Email Address</label>
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
                                    background: 'white',
                                    outline: 'none',
                                    fontSize: '1rem',
                                    transition: 'border-color 0.2s'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Password</label>
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
                                    background: 'white',
                                    outline: 'none',
                                    fontSize: '1rem'
                                }}
                            />
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
                        {loading ? 'Signing in...' : 'Sign in'}
                        {!loading && <FiArrowRight />}
                    </button>
                </form>

                <p style={{ marginTop: '32px', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    New here? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none' }}>Create an account</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
