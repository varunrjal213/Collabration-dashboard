import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FiUsers, FiPlus, FiTrash2, FiSearch, FiUserPlus, FiX, FiCheck, FiAlertTriangle } from 'react-icons/fi';

const TeamManagement = () => {
    const { user } = useAuth();
    const [teams, setTeams] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // New Team Form State
    const [newTeamName, setNewTeamName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [teamsRes, usersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/teams', config),
                axios.get('http://localhost:5000/api/admin/users', config)
            ]);
            setTeams(teamsRes.data);
            setAllUsers(usersRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.post('http://localhost:5000/api/teams', {
                name: newTeamName,
                members: selectedMembers
            }, config);

            setNewTeamName('');
            setSelectedMembers([]);
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create team');
        }
    };

    const handleDeleteTeam = (teamId) => {
        setDeleteConfirmId(teamId);
    };

    const confirmDeleteTeam = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`http://localhost:5000/api/teams/${deleteConfirmId}`, config);
            setDeleteConfirmId(null);
            fetchData();
        } catch (error) {
            console.error('Failed to delete team');
        }
    };

    const toggleMember = (userId) => {
        setSelectedMembers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredTeams = teams.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Teams...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Team Management</h1>
                    <p style={{ color: '#64748b' }}>Organize your workforce into specialized teams.</p>
                </div>
                <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input
                            type="text"
                            placeholder="Search teams..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                padding: '12px 16px 12px 40px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                outline: 'none',
                                width: '240px',
                                background: 'white'
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiPlus /> New Team
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
                {filteredTeams.map(team => (
                    <div key={team._id} className="glass-card" style={{ padding: '24px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{
                                width: '48px', height: '48px',
                                background: '#f5f3ff', color: '#4f46e5',
                                borderRadius: '12px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center',
                                fontSize: '1.5rem'
                            }}>
                                <FiUsers />
                            </div>
                            <button
                                onClick={() => handleDeleteTeam(team._id)}
                                style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                            >
                                <FiTrash2 />
                            </button>
                        </div>

                        <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{team.name}</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '20px' }}>{team.members.length} members assigned</p>

                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '-8px' }}>
                                {team.members.map((m, idx) => (
                                    <div
                                        key={m._id}
                                        title={m.username}
                                        style={{
                                            width: '32px', height: '32px',
                                            background: '#e2e8f0', border: '2px solid white',
                                            borderRadius: '50%', color: '#475569',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 700,
                                            marginLeft: idx > 0 ? '-10px' : '0'
                                        }}
                                    >
                                        {m.username[0].toUpperCase()}
                                    </div>
                                ))}
                                {team.members.length === 0 && <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No members yet</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Team Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ padding: '32px', borderRadius: '24px', width: '500px', background: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Create New Team</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}><FiX /></button>
                        </div>

                        <form onSubmit={handleCreateTeam}>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>Team Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Design Team"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '12px' }}>Select Members</label>
                                <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    {allUsers.filter(u => u.role === 'member').map(u => (
                                        <div
                                            key={u._id}
                                            onClick={() => toggleMember(u._id)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: '12px',
                                                padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                                background: selectedMembers.includes(u._id) ? '#f5f3ff' : 'transparent',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <div style={{
                                                width: '20px', height: '20px', borderRadius: '6px',
                                                border: '2px solid #4f46e5',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: selectedMembers.includes(u._id) ? '#4f46e5' : 'transparent'
                                            }}>
                                                {selectedMembers.includes(u._id) && <FiCheck style={{ color: 'white' }} />}
                                            </div>
                                            <span style={{ fontSize: '0.925rem', fontWeight: 600 }}>{u.username}</span>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{u.email}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', borderRadius: '10px', fontWeight: 600 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ padding: '10px 24px' }}>Create Team</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease-out'
                }} onClick={() => setDeleteConfirmId(null)}>
                    <div onClick={(e) => e.stopPropagation()} style={{
                        background: 'white', borderRadius: '20px', padding: '32px',
                        width: '420px', maxWidth: '90vw', boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                        textAlign: 'center'
                    }}>
                        <div style={{
                            width: '56px', height: '56px', borderRadius: '50%',
                            background: '#fef2f2', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 20px', color: '#ef4444',
                            fontSize: '1.5rem'
                        }}>
                            <FiAlertTriangle />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>Delete Team</h3>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '28px' }}>
                            Are you sure you want to delete this team?<br />All members will be unassigned from this team.
                        </p>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: '1px solid #e2e8f0', background: 'white',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    color: '#475569'
                                }}
                            >Cancel</button>
                            <button
                                onClick={confirmDeleteTeam}
                                style={{
                                    flex: 1, padding: '12px', borderRadius: '12px',
                                    border: 'none', background: '#ef4444', color: 'white',
                                    fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                                }}
                            ><FiTrash2 /> Yes, Delete</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default TeamManagement;
