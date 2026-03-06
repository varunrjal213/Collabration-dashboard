const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/userModel');
const Project = require('./models/projectModel');
const Task = require('./models/taskModel');
const Comment = require('./models/commentModel'); // Added
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

dotenv.config();

const importData = async () => {
    try {
        await connectDB();

        console.log('Cleaning database...');
        await User.deleteMany();
        await Project.deleteMany();
        await Task.deleteMany();
        await Comment.deleteMany();

        console.log('Generating password hashes...');
        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('password123', salt);
        const memberPass = await bcrypt.hash('password123', salt);

        console.log('Creating users...');
        const users = await User.insertMany([
            { username: 'admin', email: 'admin@example.com', password: adminPass, role: 'admin' },
            { username: 'varun', email: 'varun@example.com', password: memberPass, role: 'member' },
            { username: 'jane_smith', email: 'jane@example.com', password: memberPass, role: 'member' },
        ]);

        const adminUser = users[0]._id;
        const memberUser = users[1]._id;

        console.log('Creating projects...');
        const projects = await Project.insertMany([
            { name: 'Dashboard Redesign', description: 'Upgrading the collaboration portal to a premium glassmorphic UI.', createdBy: adminUser, members: [memberUser] },
            { name: 'Mobile App API', description: 'Developing the backend services for the upcoming React Native application.', createdBy: adminUser, members: [memberUser] },
        ]);

        console.log('Creating tasks...');
        const tasksArr = await Task.insertMany([
            { title: 'Implement Glassmorphism', status: 'Done', project: projects[0]._id, assignedTo: memberUser, description: 'Apply backdrop-filter and translucency to cards.' },
            { title: 'Setup Real-time Comments', status: 'In-Progress', project: projects[0]._id, assignedTo: adminUser, description: 'Integrate Socket.IO for instant activity feed.' },
            { title: 'Optimization Check', status: 'To-Do', project: projects[0]._id, assignedTo: memberUser, description: 'Test performance on 4G networks.' },
        ]);

        console.log('Adding demo activity...');
        await Comment.insertMany([
            { text: 'The new UI looks amazing!', user: memberUser, task: tasksArr[0]._id },
            { text: 'Agreed. Let’s finish the socket logic next.', user: adminUser, task: tasksArr[0]._id },
            { text: 'I am starting on the Socket.IO integration now.', user: adminUser, task: tasksArr[1]._id },
        ]);

        console.log('Seeding Complete! Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`Error seeding data: ${error.message}`);
        process.exit(1);
    }
};

importData();
