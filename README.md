# Real-time Collaboration Dashboard

A web-based Collaboration Dashboard that allows teams to manage projects, assign tasks, communicate in real time, and track progress. Built with the MERN stack and Socket.IO.

## Tech Stack
- **Frontend:** React.js, Vite, Socket.IO Client, React Beautiful DnD
- **Backend:** Node.js, Express.js, Socket.IO
- **Database:** MongoDB
- **Authentication:** JSON Web Tokens (JWT)

## Prerequisites
- Node.js installed
- MongoDB Atlas connection string (already configured in `.env`)

## Installation Steps

1.  **Clone/Open the project**
    ```bash
    cd "c:/Users/varun/OneDrive/Desktop/cd project"
    ```

2.  **Install Backend Dependencies**
    ```bash
    cd server
    npm install
    ```

3.  **Install Frontend Dependencies**
    ```bash
    cd ../client
    npm install
    ```

## Running the Project

1.  **Start the Backend Server**
    Open a terminal in the `server` folder:
    ```bash
    npm run dev
    ```
    (Runs on http://localhost:5000)

2.  **Start the Frontend**
    Open a new terminal in the `client` folder:
    ```bash
    npm run dev
    ```
    (Runs on http://localhost:5173)

3.  **Open in Browser**
    Go to `http://localhost:5173`

## Troubleshooting
- **`'npm' is not recognized`**: Ensure Node.js is installed.
- **`vite: command not found`**: Run `npm install` in the `client` folder.
- **Drag and Drop not working**: Ensure `React.StrictMode` is removed (already done in `src/main.jsx`).

## Sample Data (Optional)
To seed the database with dummy data (Users, Projects, Tasks):
```bash
cd server
node seed.js
```
*Default login: `admin@example.com` / `password123`*

## Features
- **User Auth:** Register/Login with JWT.
- **Projects:** Create and view projects.
- **Kanban Board:** Drag and drop tasks between To-Do, In-Progress, and Done.
- **Real-time:** Updates on one client are instantly reflected on others via Socket.IO.
