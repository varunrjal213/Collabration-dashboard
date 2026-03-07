import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiSearch, FiSend, FiSmile, FiPaperclip, FiMoreVertical, FiUsers } from 'react-icons/fi';
import io from 'socket.io-client';

const ENDPOINT = "http://localhost:5000";

const AVATAR_COLORS = [
    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6',
    '#ef4444', '#06b6d4', '#f97316', '#14b8a6', '#a855f7'
];

const getColor = (name) => {
    if (!name) return AVATAR_COLORS[0];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const Avatar = ({ name, size = 40 }) => {
    const color = getColor(name);
    return (
        <div style={{
            width: size, height: size, borderRadius: '50%',
            background: color, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontWeight: 700,
            fontSize: size * 0.4, flexShrink: 0, letterSpacing: '-0.02em'
        }}>
            {name?.[0]?.toUpperCase() || '?'}
        </div>
    );
};

const Team = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const socketRef = useRef();
    const chatEndRef = useRef(null);

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`${ENDPOINT}/api/teams`, config);
                if (data && data.length > 0) {
                    const currentTeam = data[0];
                    setTeam(currentTeam);
                    const msgRes = await axios.get(`${ENDPOINT}/api/team-messages/${currentTeam._id}`, config);
                    setMessages(msgRes.data);
                }
            } catch (error) {
                console.error('Error fetching team data:', error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (!team?._id) return;
        socketRef.current = io(ENDPOINT);
        const socket = socketRef.current;
        socket.emit('joinTeam', team._id);
        socket.on('teamMessage', (message) => {
            setMessages((prev) => [...prev, message]);
        });
        return () => {
            socket.emit('leaveTeam', team._id);
            socket.off('teamMessage');
            socket.disconnect();
        };
    }, [team?._id]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !team) return;
        socketRef.current.emit('teamMessage', {
            team: team._id,
            sender: user,
            content: newMessage
        });
        setNewMessage('');
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading your team...</div>;

    if (!team) {
        return (
            <div style={{
                height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexDirection: 'column', gap: '16px', color: '#94a3b8'
            }}>
                <FiUsers style={{ fontSize: '3rem', opacity: 0.4 }} />
                <h2 style={{ fontSize: '1.25rem', color: '#475569' }}>No Team Assigned</h2>
                <p>Contact your administrator to be added to a team.</p>
            </div>
        );
    }

    const filteredMembers = team.members.filter(m =>
        m.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group messages by date
    const groupByDate = (msgs) => {
        const groups = {};
        msgs.forEach(msg => {
            const d = new Date(msg.createdAt).toLocaleDateString();
            if (!groups[d]) groups[d] = [];
            groups[d].push(msg);
        });
        return groups;
    };
    const groupedMessages = groupByDate(messages);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--header-h) - 48px)', gap: '20px' }}>
            {/* ──── TEAM INFO CARD ──── */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 28px', borderRadius: '20px',
                background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                color: 'white', flexShrink: 0,
                boxShadow: '0 8px 24px rgba(99,102,241,0.25)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem'
                    }}>
                        <FiUsers />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>{team.name}</h1>
                        <p style={{ fontSize: '0.8rem', opacity: 0.85 }}>{team.members.length} members in this team</p>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {team.members.slice(0, 5).map((m, i) => (
                        <div key={m._id} title={m.username} style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: getColor(m.username),
                            border: '3px solid rgba(99,102,241,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.8rem',
                            marginLeft: i > 0 ? '-10px' : '0', zIndex: 5 - i
                        }}>
                            {m.username?.[0]?.toUpperCase()}
                        </div>
                    ))}
                    {team.members.length > 5 && (
                        <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)',
                            border: '3px solid rgba(99,102,241,0.8)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '0.7rem',
                            marginLeft: '-10px'
                        }}>
                            +{team.members.length - 5}
                        </div>
                    )}
                </div>
            </div>

            {/* ──── CHAT AREA ──── */}
            <div style={{
                display: 'flex', flex: 1, minHeight: 0,
                borderRadius: '20px', overflow: 'hidden',
                border: '1px solid #e2e8f0', background: 'white'
            }}>
                {/* ──── LEFT PANEL: Team Members ──── */}
                <div style={{
                    width: '320px', borderRight: '1px solid #e2e8f0',
                    display: 'flex', flexDirection: 'column', flexShrink: 0, background: '#fff'
                }}>
                    {/* Left Header */}
                    <div style={{ padding: '20px 20px 0' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px' }}>Chats</h2>
                        <div style={{ position: 'relative', marginBottom: '20px' }}>
                            <FiSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input
                                type="text"
                                placeholder="Search members..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 14px 10px 38px',
                                    borderRadius: '10px', border: '1px solid #e2e8f0',
                                    outline: 'none', fontSize: '0.85rem', background: '#f8fafc'
                                }}
                            />
                        </div>
                    </div>

                    {/* Horizontal Avatars */}
                    <div style={{
                        display: 'flex', gap: '16px', padding: '0 20px 16px',
                        borderBottom: '1px solid #f1f5f9', overflowX: 'auto', flexShrink: 0
                    }}>
                        {team.members.slice(0, 6).map(m => (
                            <div key={m._id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                <div style={{ position: 'relative' }}>
                                    <Avatar name={m.username} size={44} />
                                    <span style={{
                                        position: 'absolute', bottom: '1px', right: '1px',
                                        width: '10px', height: '10px', borderRadius: '50%',
                                        background: '#22c55e', border: '2px solid white'
                                    }} />
                                </div>
                                <span style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                                    {m.username?.split(' ')[0]}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Members List */}
                    <div style={{ padding: '12px 12px 0' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#94a3b8', padding: '0 8px 8px' }}>
                            Team Members
                        </p>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredMembers.map(member => (
                            <div key={member._id} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '12px 20px', cursor: 'pointer',
                                transition: 'background 0.15s',
                                borderLeft: '3px solid transparent'
                            }}
                                onMouseEnter={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderLeftColor = '#6366f1'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderLeftColor = 'transparent'; }}
                            >
                                <div style={{ position: 'relative' }}>
                                    <Avatar name={member.username} size={42} />
                                    <span style={{
                                        position: 'absolute', bottom: '1px', right: '1px',
                                        width: '9px', height: '9px', borderRadius: '50%',
                                        background: '#22c55e', border: '2px solid white'
                                    }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{member.username}</h4>
                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                                            {member.role === 'admin' ? 'Admin' : 'Member'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {member.email}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ──── RIGHT PANEL: Chat ──── */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Chat Header */}
                    <div style={{
                        padding: '16px 24px', borderBottom: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: 'white', flexShrink: 0
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: '#6366f1', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', color: 'white', fontWeight: 700
                            }}>
                                {team.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {team.name}
                                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                                </h3>
                                <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{team.members.length} members online</p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#64748b' }}>
                            <FiSearch style={{ fontSize: '1.1rem', cursor: 'pointer' }} />
                            <FiUsers style={{ fontSize: '1.1rem', cursor: 'pointer' }} />
                            <FiMoreVertical style={{ fontSize: '1.1rem', cursor: 'pointer' }} />
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{
                        flex: 1, overflowY: 'auto', padding: '24px',
                        display: 'flex', flexDirection: 'column', gap: '4px',
                        background: '#f8fafc'
                    }}>
                        {messages.length === 0 && (
                            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0', fontSize: '0.875rem' }}>
                                <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💬</p>
                                <p>No messages yet. Start the conversation!</p>
                            </div>
                        )}

                        {Object.entries(groupedMessages).map(([date, msgs]) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div style={{
                                    textAlign: 'center', margin: '16px 0',
                                    display: 'flex', alignItems: 'center', gap: '12px'
                                }}>
                                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                    <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
                                        {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </span>
                                    <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                                </div>

                                {msgs.map((msg, idx) => {
                                    const isMine = msg.sender?._id === user?._id;
                                    const showAvatar = idx === 0 || msgs[idx - 1]?.sender?._id !== msg.sender?._id;
                                    return (
                                        <div key={msg._id || idx} style={{
                                            display: 'flex', gap: '10px',
                                            flexDirection: isMine ? 'row-reverse' : 'row',
                                            alignItems: 'flex-end',
                                            marginTop: showAvatar ? '16px' : '4px'
                                        }}>
                                            {/* Avatar */}
                                            <div style={{ width: '34px', flexShrink: 0 }}>
                                                {showAvatar && <Avatar name={msg.sender?.username} size={34} />}
                                            </div>

                                            {/* Bubble */}
                                            <div style={{ maxWidth: '65%' }}>
                                                {showAvatar && !isMine && (
                                                    <p style={{
                                                        fontSize: '0.72rem', fontWeight: 700, color: getColor(msg.sender?.username),
                                                        marginBottom: '4px', paddingLeft: '4px'
                                                    }}>
                                                        {msg.sender?.username}
                                                    </p>
                                                )}
                                                <div style={{
                                                    padding: '10px 16px',
                                                    borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                    background: isMine
                                                        ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                                                        : '#ffffff',
                                                    color: isMine ? 'white' : '#1e293b',
                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                                                    border: isMine ? 'none' : '1px solid #e2e8f0',
                                                    position: 'relative'
                                                }}>
                                                    <p style={{ fontSize: '0.875rem', lineHeight: 1.55 }}>{msg.content}</p>
                                                    <span style={{
                                                        fontSize: '0.6rem',
                                                        color: isMine ? 'rgba(255,255,255,0.7)' : '#94a3b8',
                                                        display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start',
                                                        marginTop: '4px', gap: '4px', alignItems: 'center'
                                                    }}>
                                                        🕐 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input Bar */}
                    <form onSubmit={handleSendMessage} style={{
                        padding: '16px 24px', borderTop: '1px solid #e2e8f0',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: 'white', flexShrink: 0
                    }}>
                        <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>
                            <FiSmile />
                        </button>
                        <input
                            type="text"
                            placeholder="Enter Message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{
                                flex: 1, padding: '12px 16px', borderRadius: '12px',
                                border: '1px solid #e2e8f0', outline: 'none',
                                fontSize: '0.875rem', background: '#f8fafc',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => { e.target.style.borderColor = '#6366f1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                            onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                        />
                        <button type="button" style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer' }}>
                            <FiPaperclip />
                        </button>
                        <button type="submit" style={{
                            width: '42px', height: '42px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                            color: 'white', border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                            transition: 'transform 0.15s, box-shadow 0.15s'
                        }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                            <FiSend />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Team;
