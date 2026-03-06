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

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    return user ? children : <Navigate to="/login" />;
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
                        <Route index element={<Navigate to="/dashboard" replace />} />
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="project/:id" element={<ProjectView />} />
                    </Route>

                    {/* Admin Specific Routes */}
                    <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="users" element={<UserManagement />} />
                        <Route path="projects" element={<ProjectManagement />} />
                        <Route path="tasks" element={<GlobalKanban />} />
                        {/* Placeholder for other admin pages */}
                        <Route path="activity" element={<ActivityFeed />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
