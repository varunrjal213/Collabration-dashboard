const TeamMessage = require('../models/teamMessageModel');

const socketHandler = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        socket.on('joinProject', (projectId) => {
            socket.join(projectId);
            console.log(`User joined project: ${projectId}`);
        });

        socket.on('leaveProject', (projectId) => {
            socket.leave(projectId);
            console.log(`User left project: ${projectId}`);
        });

        socket.on('joinTeam', (teamId) => {
            socket.join(teamId);
            console.log(`User joined team: ${teamId}`);
        });

        socket.on('leaveTeam', (teamId) => {
            socket.leave(teamId);
            console.log(`User left team: ${teamId}`);
        });

        socket.on('joinAdmin', () => {
            socket.join('adminRoom');
            console.log(`Admin joined monitoring: ${socket.id}`);
        });

        socket.on('taskUpdated', (updatedTask) => {
            io.to(updatedTask.project).emit('taskUpdated', updatedTask);
            io.to('adminRoom').emit('admin:activity', {
                type: 'TASK_UPDATE',
                data: updatedTask,
                timestamp: new Date()
            });
        });

        socket.on('commentAdded', (newComment) => {
            io.to(newComment.project).emit('commentAdded', newComment);
            io.to('adminRoom').emit('admin:activity', {
                type: 'COMMENT_ADDED',
                data: newComment,
                timestamp: new Date()
            });
        });

        socket.on('teamMessage', async (data) => {
            try {
                const newMessage = await TeamMessage.create({
                    team: data.team,
                    sender: data.sender._id,
                    content: data.content
                });

                const populatedMessage = await TeamMessage.findById(newMessage._id).populate('sender', 'username email');
                io.to(data.team).emit('teamMessage', populatedMessage);
            } catch (error) {
                console.error('Error saving team message:', error);
            }
        });

        socket.on('noteAdded', (data) => {
            io.to(data.projectId).emit('noteAdded', data);
            io.to('adminRoom').emit('admin:activity', {
                type: 'NOTE_ADDED',
                data: data,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
