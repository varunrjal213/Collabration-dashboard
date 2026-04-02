import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiGrid, FiSettings, FiLogOut, FiUsers, FiShield } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', icon: <FiGrid />, path: user?.role === 'admin' ? '/admin/dashboard' : '/dashboard' },
        { name: 'Team', icon: <FiUsers />, path: user?.role === 'admin' ? '/admin/teams' : '/team' },
        { name: 'Settings', icon: <FiSettings />, path: user?.role === 'admin' ? '/admin/settings' : '/settings' },
    ];

    if (user?.role === 'admin') {
        menuItems.push({ name: 'Admin Portal', icon: <FiShield />, path: '/admin' });
    }

    return (
        <aside style={{
            width: 'var(--sidebar-w)',
            background: '#ffffff',
            borderRight: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            height: '100vh',
            overflow: 'hidden',
            flexShrink: 0
        }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>CollabHub</h2>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {menuItems.map((item) => (
                        <li key={item.name} style={{ marginBottom: '8px' }}>
                            <Link to={item.path} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                textDecoration: 'none',
                                color: location.pathname === item.path ? 'var(--primary)' : 'var(--text-muted)',
                                background: location.pathname === item.path ? '#f5f3ff' : 'transparent',
                                fontWeight: 600,
                                transition: 'all 0.2s'
                            }}>
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: '#e2e8f0', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#64748b'
                    }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.username}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.role}</p>
                    </div>
                </div>
                <button onClick={logout} style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    color: '#ef4444',
                    background: '#fef2f2',
                    borderRadius: '10px',
                    fontSize: '0.875rem'
                }}>
                    <FiLogOut />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
