import { Link, useLocation } from 'react-router-dom';
import { FiGrid, FiUsers, FiLayers, FiCheckSquare, FiActivity, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const menuItems = [
        { name: 'Admin Overview', icon: <FiGrid />, path: '/admin/dashboard' },
        { name: 'User Management', icon: <FiUsers />, path: '/admin/users' },
        { name: 'Team Management', icon: <FiUsers />, path: '/admin/teams' },
        { name: 'All Projects', icon: <FiLayers />, path: '/admin/projects' },
        { name: 'Global Kanban', icon: <FiCheckSquare />, path: '/admin/tasks' },
        { name: 'Live Activity', icon: <FiActivity />, path: '/admin/activity' },
        { name: 'Settings', icon: <FiSettings />, path: '/admin/settings' },
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-w)',
            background: '#1e293b', // Dark side for admin
            color: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            height: '100vh',
            position: 'fixed'
        }}>
            <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', background: '#4f46e5', borderRadius: '8px' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>Admin Portal</h2>
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
                                color: location.pathname === item.path ? 'white' : '#94a3b8',
                                background: location.pathname === item.path ? '#334155' : 'transparent',
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

            <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #334155' }}>
                <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px', height: '36px',
                        background: '#4f46e5', borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: 'white'
                    }}>
                        {user?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.username}</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Super Admin</p>
                    </div>
                </div>
                <button onClick={logout} style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    color: '#fca5a5',
                    background: '#450a0a',
                    borderRadius: '10px',
                    fontSize: '0.875rem'
                }}>
                    <FiLogOut />
                    <span>Exit Admin</span>
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
