# Viva-Ready Explanations

## 1. MERN Architecture
**Q: Explain the architecture of your project.**
**A:** This project uses the MERN stack:
- **MongoDB**: A NoSQL database used to store flexible JSON-like data (documents) for users, projects, and tasks.
- **Express.js**: A backend web application framework for Node.js that handles API routing and middleware.
- **React.js**: A frontend library for building the user interface. It manages the state and renders components dynamically.
- **Node.js**: The runtime environment that allows JavaScript to run on the server side.

## 2. Real-time Communication (Socket.IO)
**Q: How does the real-time update work?**
**A:** I used **Socket.IO**.
- The server listens for a `connection` event.
- When a user joins a project page, the client emits a `joinProject` event with the project ID, placing them in a specific "room".
- When a task is updated (e.g., dragged to a new column), the client emits a `taskUpdated` event.
- The server receives this and broadcasts it back to everyone in that project's room using `io.to(projectId).emit('taskUpdated')`.
- Other clients listening for this event update their state immediately without reloading the page.

## 3. Database Schema Design
**Q: How are your database models designed?**
**A:** I have three main models:
- **User**: Stores username, email, password (hashed), and role.
- **Project**: Stores name, description, and an array of `members` (ObjectId references to User).
- **Task**: Stores title, status, deadline, and references to both `Project` and `User` (assignedTo).

## 4. Authentication Flow
**Q: How is security handled?**
**A:** I used **JWT (JSON Web Tokens)**.
- When a user logs in, the server validates credentials and generates a signed token.
- This token is sent to the client and stored (e.g., in localStorage).
- For protected routes (like creating a project), the client sends this token in the `Authorization` header.
- The backend middleware verifies the token before allowing access.

## 5. React Hooks Used
**Q: Which React hooks did you use?**
**A:**
- `useState`: For managing local component state (e.g., form inputs, task lists).
- `useEffect`: For side effects like fetching data from the API and setting up Socket.IO listeners on component mount.
- `useContext`: For managing global authentication state across the app.

## 6. Admin Dashboard Features
**Q: What can the Admin do in your application?**
**A:** The Admin has super-user privileges, including:
- **Platform Monitoring**: Real-time activity feed using Socket.IO to track every task update and comment system-wide.
- **User Management**: Viewing all users, promoting/demoting roles, and deleting users.
- **Project Oversight**: Monitoring all projects and their specific metadata.
- **Global Kanban**: A consolidated view of every task in the system to ensure deadlines are met and resources are distributed correctly.

## 7. Role-Based Access Control (RBAC)
**Q: How do you ensure only Admins access sensitive routes?**
**A:** 
- **Backend**: I added an `admin` middleware that checks if `req.user.role === 'admin'`. This middleware is applied to all `/api/admin` routes.
- **Frontend**: I created an `AdminLayout` component that uses the `useAuth` hook to verify the user's role. If a non-admin tries to access `/admin/*` routes, they are automatically redirected to their standard dashboard.
