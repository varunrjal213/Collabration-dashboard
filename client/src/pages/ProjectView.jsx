import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMessageCircle, FiPaperclip, FiX, FiSend, FiArrowLeft } from 'react-icons/fi';

const ENDPOINT = "http://localhost:5000";

const ProjectView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([]);
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io(ENDPOINT);
        socketRef.current.emit('joinProject', id);

        socketRef.current.on('taskUpdated', (updatedTask) => {
            setTasks((prevTasks) => {
                const taskExists = prevTasks.find(t => t._id === updatedTask._id);
                if (taskExists) {
                    return prevTasks.map(t => t._id === updatedTask._id ? updatedTask : t);
                } else {
                    return [...prevTasks, updatedTask];
                }
            });
        });

        socketRef.current.on('commentAdded', (newComment) => {
            if (selectedTask?._id === newComment.task) {
                setComments(prev => [...prev, newComment]);
            }
        });

        return () => {
            socketRef.current.emit('leaveProject', id);
            socketRef.current.disconnect();
        };
    }, [id, selectedTask]);

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const projectRes = await axios.get(`${ENDPOINT}/api/projects/${id}`, config);
                setProject(projectRes.data);

                const tasksRes = await axios.get(`${ENDPOINT}/api/tasks/${id}`, config);
                setTasks(tasksRes.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        if (user) fetchProjectData();
    }, [id, user]);

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const updatedTask = tasks.find(t => t._id === draggableId);
            const oldStatus = updatedTask.status;
            updatedTask.status = destination.droppableId;

            setTasks(prev => prev.map(t => t._id === draggableId ? { ...updatedTask } : t));

            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.put(`${ENDPOINT}/api/tasks/${draggableId}`, { status: updatedTask.status }, config);
                socketRef.current.emit('taskUpdated', updatedTask);
            } catch (error) {
                console.error("Error updating task status:", error);
                updatedTask.status = oldStatus;
                setTasks(prev => prev.map(t => t._id === draggableId ? { ...updatedTask } : t));
            }
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${ENDPOINT}/api/tasks`, {
                title: newTaskTitle,
                description: '',
                project: id,
                status: 'To-Do'
            }, config);

            setNewTaskTitle('');
            setTasks([...tasks, data]);
            socketRef.current.emit('taskUpdated', data);
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const fetchComments = async (taskId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${ENDPOINT}/api/comments/${taskId}`, config);
            setComments(data);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`${ENDPOINT}/api/comments`, {
                text: commentText,
                taskId: selectedTask._id
            }, config);
            setCommentText('');
            // Real-time broadcast
            socketRef.current.emit('commentAdded', { ...data, project: id });
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const openTaskModal = (task) => {
        setSelectedTask(task);
        fetchComments(task._id);
    };

    if (!project) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Project...</div>;

    const columns = {
        'To-Do': { color: '#64748b', tasks: tasks.filter(t => t.status === 'To-Do') },
        'In-Progress': { color: '#4f46e5', tasks: tasks.filter(t => t.status === 'In-Progress') },
        'Done': { color: '#10b981', tasks: tasks.filter(t => t.status === 'Done') }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ marginBottom: '32px' }}>
                <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>
                    <FiArrowLeft /> Back to Workspace
                </button>
                <h1 style={{ fontSize: '2rem' }}>{project.name}</h1>
                <p style={{ color: 'var(--text-muted)' }}>{project.description}</p>
            </div>

            {user?.role === 'admin' && (
                <form onSubmit={handleCreateTask} style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
                    <input
                        type="text"
                        placeholder="Create a new task..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{
                            padding: '12px 16px',
                            width: '400px',
                            borderRadius: '12px',
                            border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-sm)',
                            outline: 'none'
                        }}
                    />
                    <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiPlus /> Add Task
                    </button>
                </form>
            )}

            <div style={{ display: 'flex', gap: '24px', overflowX: 'auto', paddingBottom: '20px' }}>
                <DragDropContext onDragEnd={onDragEnd}>
                    {Object.entries(columns).map(([columnId, columnData]) => (
                        <div key={columnId} style={{ minWidth: '320px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnData.color }}></div>
                                <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                                    {columnId} <span style={{ marginLeft: '6px', fontWeight: 400 }}>{columnData.tasks.length}</span>
                                </h3>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        style={{
                                            background: snapshot.isDraggingOver ? '#f1f5f9' : '#f8fafc',
                                            padding: '12px',
                                            minHeight: '600px',
                                            borderRadius: '16px',
                                            border: '1px dashed #cbd5e1',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        {columnData.tasks.map((task, index) => (
                                            <Draggable key={task._id} draggableId={task._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => openTaskModal(task)}
                                                        style={{
                                                            padding: '20px',
                                                            marginBottom: '12px',
                                                            background: 'white',
                                                            borderRadius: '12px',
                                                            boxShadow: snapshot.isDragging ? '0 10px 25px -5px rgba(0,0,0,0.1)' : 'var(--shadow-sm)',
                                                            border: '1px solid var(--border)',
                                                            cursor: 'pointer',
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <h4 style={{ fontSize: '1rem', marginBottom: '12px', color: 'var(--text-main)' }}>{task.title}</h4>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FiMessageCircle /> <span>4</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <FiPaperclip /> <span>2</span>
                                                            </div>
                                                            <div style={{ marginLeft: 'auto', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                                                                H
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </DragDropContext>
            </div>

            {/* Task Detail Modal (Comments/Files) */}
            {selectedTask && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'flex-end', zIndex: 100
                }}>
                    <div style={{
                        width: '500px', background: 'white', height: '100%',
                        padding: '40px', boxShadow: '-10px 0 30px rgba(0,0,0,0.1)',
                        display: 'flex', flexDirection: 'column', animation: 'slideIn 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                            <div style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>TASK DETAIL</div>
                            <button onClick={() => setSelectedTask(null)} style={{ background: 'transparent', fontSize: '1.25rem' }}><FiX /></button>
                        </div>

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '24px' }}>{selectedTask.title}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '40px' }}>{selectedTask.description || 'No description provided for this task.'}</p>

                        <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FiMessageCircle /> Activity
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {comments.map((c, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', background: 'var(--primary)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, flexShrink: 0 }}>
                                            {c.user?.username?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>{c.user?.username}</span>
                                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                            <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', background: '#f8fafc', padding: '12px', borderRadius: '0 12px 12px 12px', border: '1px solid var(--border)' }}>{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Write a comment..."
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--border)', outline: 'none' }}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '12px' }}><FiSend /></button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default ProjectView;
