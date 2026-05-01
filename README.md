# Team Task Manager (Full-Stack)

A real-world collaborative application where users can manage projects and tasks efficiently with role-based access control.

## 🚀 Features
- **User Authentication**: Secure Signup/Login with JWT.
- **Project Management**: Create projects, add/remove members (Admin only).
- **Task Management**: Create, assign, and track tasks (Title, Description, Due Date, Priority, Status).
- **Role-Based Access Control**:
  - **Admin**: Can manage all tasks and users within their projects.
  - **Member**: Can view projects and update the status of tasks assigned to them.
- **Dashboard**: Real-time stats for Total Tasks, Tasks by Status, Overdue Tasks, and Tasks per User.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS.
- **Backend**: Next.js API Routes (Node.js).
- **Database**: MongoDB (via Mongoose).
- **Authentication**: JWT & Bcrypt.
- **Deployment**: Railway.

## 📦 Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <your-repo-link>
   cd team-task-manager
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Variables**:
   Create a `.env.local` file in the root and add:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open the app**:
   Visit `http://localhost:3000`.

## 🌐 Deployment on Railway

1. Push the code to a GitHub repository.
2. Link the repository to your [Railway](https://railway.app/) account.
3. Add the `MONGODB_URI` and `JWT_SECRET` environment variables in the Railway dashboard.
4. Railway will automatically detect the Next.js app and deploy it.

## 🎥 Demo Video
[Link to Demo Video] (Upload your video and replace this link)

---
Built for the Ethara AI Full-Stack Assessment.
