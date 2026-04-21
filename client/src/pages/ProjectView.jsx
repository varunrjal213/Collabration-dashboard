import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FiPlus, FiMessageCircle, FiPaperclip, FiX, FiArrowLeft, FiChevronLeft, FiChevronRight, FiCalendar, FiClock, FiActivity } from 'react-icons/fi';

const ENDPOINT = "http://localhost:5000";

// Helper to get all calendar days in a month grid
const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    return cells;
};

const toMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const ProjectView = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);

    const [notes, setNotes] = useState([]);
    const [projectNotes, setProjectNotes] = useState([]); // Consolidated project feed
    const [newNote, setNewNote] = useState('');
    const [noteTaskId, setNoteTaskId] = useState(''); // Specific task to link a note to (from modal)
    const [taskDetailCalendarMonth, setTaskDetailCalendarMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
    const [taskDayNoteSelectedDate, setTaskDayNoteSelectedDate] = useState(null); // Date for the centered popup
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

        socketRef.current.on('noteAdded', () => {
            fetchProjectNotes();
            if (selectedTask) {
                fetchNotes(selectedTask._id);
            }
        });


        return () => {
            socketRef.current.emit('leaveProject', id);
            socketRef.current.disconnect();
        };
    }, [id, selectedTask]);

    const fetchProjectNotes = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${ENDPOINT}/api/notes/project/${id}`, config);
            setProjectNotes(data);
        } catch (error) {
            console.error("Error fetching project notes:", error);
        }
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const projectRes = await axios.get(`${ENDPOINT}/api/projects/${id}`, config);
                setProject(projectRes.data);

                const tasksRes = await axios.get(`${ENDPOINT}/api/tasks/${id}`, config);
                setTasks(tasksRes.data);
                
                fetchProjectNotes();
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


    const fetchNotes = async (taskId) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`${ENDPOINT}/api/notes/${taskId}`, config);
            setNotes(data);
        } catch (error) {
            console.error("Error fetching notes:", error);
        }
    };

    const handleAddNote = async (e, date = null) => {
        e.preventDefault();
        if (!newNote.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                content: newNote,
                projectId: id,
                date: date || new Date()
            };
            
            // Prioritize the task specifically selected for the note (e.g. in calendar modal)
            if (noteTaskId) {
                payload.taskId = noteTaskId;
            } else if (selectedTask) {
                payload.taskId = selectedTask._id;
            }

            const { data } = await axios.post(`${ENDPOINT}/api/notes`, payload, config);
            setNewNote('');
            setNoteTaskId(''); // Reset after adding

            if (selectedTask || noteTaskId) {
                setNotes([data, ...notes]);
            }
            setProjectNotes([data, ...projectNotes]);
            socketRef.current.emit('noteAdded', { projectId: id });
        } catch (error) {
            console.error("Error adding note:", error);
        }
    };

    const openTaskModal = (task) => {
        setSelectedTask(task);
        fetchNotes(task._id);
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
                {/* Main Kanban Area */}
                <div style={{ minWidth: 0 }}>
                    {user?.role === 'admin' && (
                        <form onSubmit={handleCreateTask} style={{ marginBottom: '32px', display: 'flex', gap: '12px' }}>
                            <input
                                type="text"
                                placeholder="Create a new task..."
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                style={{
                                    padding: '12px 16px',
                                    flex: 1,
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

                    <div style={{ 
                        display: 'flex', 
                        gap: '24px', 
                        alignItems: 'flex-start'
                    }}>
                        <DragDropContext onDragEnd={onDragEnd}>
                            {Object.entries(columns).map(([columnId, columnData]) => (
                                <div key={columnId} style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: columnData.color }}></div>
                                        <h3 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
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
                                                                <h4 style={{ fontSize: '0.95rem', marginBottom: '12px', color: 'var(--text-main)' }}>{task.title}</h4>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <FiMessageCircle /> <span>{projectNotes.filter(n => (n.task?._id || n.task) === task._id).length}</span>
                                                                    </div>
                                                                    {task.deadline && (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: new Date(task.deadline) < new Date() ? 'var(--danger)' : 'inherit' }}>
                                                                            <FiClock /> <span>{new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                                                        </div>
                                                                    )}
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
                </div>

                {/* Sidebar Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {/* Project Insights Card */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'white' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiActivity style={{ color: 'var(--primary)' }} /> Project Status
                        </h3>
                        
                        <div style={{ marginBottom: '24px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-muted)' }}>COMPLETION</span>
                                <span style={{ color: 'var(--primary)' }}>{project.progress || 0}%</span>
                            </div>
                            <div className="progress-container" style={{ height: '8px' }}>
                                <div className="progress-fill" style={{ width: `${project.progress || 0}%` }}></div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>TASKS DONE</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tasks.filter(t => t.status === 'Done').length}</p>
                            </div>
                            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                <p style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', marginBottom: '4px' }}>REMAINING</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 800 }}>{tasks.filter(t => t.status !== 'Done').length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Consolidated Project Feed */}
                    <div className="glass-card" style={{ padding: '24px', borderRadius: '24px', background: 'white', display: 'flex', flexDirection: 'column', maxHeight: '400px' }}>
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiMessageCircle style={{ color: 'var(--primary)' }} /> Project Notes
                        </h3>
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '8px' }}>
                            {projectNotes.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '20px' }}>No activity yet.</p>
                            ) : (
                                projectNotes.map((note) => (
                                    <div key={note._id} style={{ borderLeft: '2px solid var(--primary)', paddingLeft: '12px', paddingBottom: '4px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{note.author?.username}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(note.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                        </div>
                                        <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>{note.content}</p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>Re: {note.task?.title}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
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

                        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{selectedTask.title}</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.875rem' }}>{selectedTask.description || 'No description provided for this task.'}</p>

                        {/* Task-Specific Mini Calendar */}
                        <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '20px', border: '1px solid #f1f5f9', marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiCalendar style={{ color: 'var(--primary)' }} /> 
                                    {new Date(taskDetailCalendarMonth.year, taskDetailCalendarMonth.month).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                </h4>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => setTaskDetailCalendarMonth(prev => ({ ...prev, month: prev.month === 0 ? 11 : prev.month - 1, year: prev.month === 0 ? prev.year - 1 : prev.year }))} style={{ background: 'white', border: '1px solid #e2e8f0', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiChevronLeft size={14} /></button>
                                    <button onClick={() => setTaskDetailCalendarMonth(prev => ({ ...prev, month: prev.month === 11 ? 0 : prev.month + 1, year: prev.month === 11 ? prev.year + 1 : prev.year }))} style={{ background: 'white', border: '1px solid #e2e8f0', width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FiChevronRight size={14} /></button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <div key={d} style={{ fontSize: '0.6rem', fontWeight: 800, color: '#94a3b8' }}>{d}</div>)}
                                {getCalendarDays(taskDetailCalendarMonth.year, taskDetailCalendarMonth.month).map((date, idx) => {
                                    if (!date) return <div key={`empty-${idx}`} />;
                                    const isSelected = taskDayNoteSelectedDate && toMidnight(date).getTime() === toMidnight(taskDayNoteSelectedDate).getTime();
                                    const hasNotes = notes.some(n => toMidnight(new Date(n.date || n.createdAt)).getTime() === toMidnight(date).getTime());
                                    return (
                                        <div key={idx} 
                                            onClick={() => setTaskDayNoteSelectedDate(date)}
                                            style={{ 
                                            aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                                            borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                                            background: (taskDayNoteSelectedDate && toMidnight(date).getTime() === toMidnight(taskDayNoteSelectedDate).getTime()) ? 'var(--primary)' : 'transparent',
                                            color: (taskDayNoteSelectedDate && toMidnight(date).getTime() === toMidnight(taskDayNoteSelectedDate).getTime()) ? 'white' : 'var(--text-main)',
                                            position: 'relative', transition: 'all 0.2s'
                                        }}>
                                            {date.getDate()}
                                            {hasNotes && <div style={{ position: 'absolute', bottom: '4px', width: '3px', height: '3px', borderRadius: '50%', background: (taskDayNoteSelectedDate && toMidnight(date).getTime() === toMidnight(taskDayNoteSelectedDate).getTime()) ? 'white' : 'var(--primary)' }} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                            <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                                <p style={{ fontSize: '0.875rem' }}>Click any date in the calendar<br/>to view or add daily task updates.</p>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Task Day Note Popup */}
            {taskDayNoteSelectedDate && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 200
                }} onClick={() => setTaskDayNoteSelectedDate(null)}>
                    <div style={{
                        width: '500px', background: 'white', borderRadius: '24px',
                        padding: '32px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
                        display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease-out',
                        maxHeight: '80vh', overflowY: 'auto'
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Notes for {taskDayNoteSelectedDate.toLocaleDateString([], { month: 'long', day: 'numeric' })}</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{selectedTask?.title}</p>
                            </div>
                            <button onClick={() => setTaskDayNoteSelectedDate(null)} style={{ background: 'transparent', fontSize: '1.25rem', color: 'var(--text-muted)' }}><FiX /></button>
                        </div>

                        <form onSubmit={(e) => handleAddNote(e, taskDayNoteSelectedDate)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <textarea
                                placeholder={`Add a note for this date...`}
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                                style={{
                                    padding: '16px', borderRadius: '16px', border: '1px solid var(--border)',
                                    outline: 'none', resize: 'none', fontFamily: 'inherit', fontSize: '0.875rem',
                                    background: '#f8fafc'
                                }}
                            />
                            <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '12px', fontWeight: 700 }}>Save Update</button>
                        </form>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                            <h4 style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Daily Logs</h4>
                            {notes.filter(n => toMidnight(new Date(n.date || n.createdAt)).getTime() === toMidnight(taskDayNoteSelectedDate).getTime()).length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', padding: '24px', background: '#f8fafc', borderRadius: '16px' }}>No notes for this date yet.</p>
                            ) : (
                                notes.filter(n => toMidnight(new Date(n.date || n.createdAt)).getTime() === toMidnight(taskDayNoteSelectedDate).getTime()).map((note) => (
                                    <div key={note._id} style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.825rem', fontWeight: 800 }}>{note.author?.username}</span>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>{note.content}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectView;
