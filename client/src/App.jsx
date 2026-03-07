import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProjectView from './pages/ProjectView';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ProjectManagement from './pages/admin/ProjectManagement';
import GlobalKanban from './pages/admin/GlobalKanban';
import ActivityFeed from './pages/admin/ActivityFeed';
import TeamManagement from './pages/admin/TeamManagement';
import Team from './pages/Team';
import Settings from './pages/Settings';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
};

const AuthRedirect = () => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />;
};

const RoleBasedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    if (!user) return <Navigate to="/login" />;
    if (user.role !== allowedRole) {
        return <Navigate to={user.role === 'admin' ? "/admin" : "/dashboard"} replace />;
    }
    return children;
};

function App() {
    return (
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes inside Layout */}
                    <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                        <Route index element={
                            <AuthRedirect />
                        } />
                        <Route path="dashboard" element={
                            <RoleBasedRoute allowedRole="member">
                                <Dashboard />
                            </RoleBasedRoute>
                        } />
                        <Route path="project/:id" element={<ProjectView />} />
                        <Route path="team" element={<Team />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>

                    {/* Admin Specific Routes */}
                    <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={
                            <RoleBasedRoute allowedRole="admin">
                                <AdminDashboard />
                            </RoleBasedRoute>
                        } />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="projects" element={<ProjectManagement />} />
                        <Route path="tasks" element={<GlobalKanban />} />
                        <Route path="teams" element={<TeamManagement />} />
                        {/* Placeholder for other admin pages */}
                        <Route path="activity" element={<ActivityFeed />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
