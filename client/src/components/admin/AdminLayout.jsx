import { Outlet, Navigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    // Direct protection: if not admin, redirect to normal dashboard
    if (!user || user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            <AdminSidebar />
            <main style={{
                flex: 1,
                marginLeft: 'var(--sidebar-w)',
                padding: '40px',
                minWidth: 0 // Prevent content from overflowing flex parent
            }}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
