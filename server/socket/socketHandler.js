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

        socket.on('joinAdmin', () => {
            socket.join('adminRoom');
            console.log(`Admin joined monitoring: ${socket.id}`);
        });

        socket.on('taskUpdated', (updatedTask) => {
            // Broadcast to everyone in the project room
            io.to(updatedTask.project).emit('taskUpdated', updatedTask);
            // Broadcast to admin monitoring room
            io.to('adminRoom').emit('admin:activity', {
                type: 'TASK_UPDATE',
                data: updatedTask,
                timestamp: new Date()
            });
        });

        socket.on('commentAdded', (newComment) => {
            // Broadcast new comment to the project room
            io.to(newComment.project).emit('commentAdded', newComment);
            // Broadcast to admin monitoring room
            io.to('adminRoom').emit('admin:activity', {
                type: 'COMMENT_ADDED',
                data: newComment,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
};

module.exports = socketHandler;
