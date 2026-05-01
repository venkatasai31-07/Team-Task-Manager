# TaskFlow: Team Task Manager

TaskFlow is a collaborative platform designed for efficient team project management. It features a modern user interface, role-based access control, and real-time task tracking.

---

## ✨ Features

### 🎨 Modern Design
- **Clean Interface**: Professional slate-themed UI with high-contrast layouts.
- **Intuitive Dashboard**: At-a-glance analytics for team productivity.
- **Responsive Layout**: Works seamlessly across desktop and mobile devices.

### 🛡️ Security & Roles
- **Role-Based Access Control**:
  - **Admin**: Full oversight, project management, and user controls.
  - **Member**: Workspace for assigned tasks and collaboration.
- **Secure Authentication**: Built with Supabase Auth for robust data protection.

### 🛠️ Core Functionality
- **Project Kanban Boards**: Simple drag-and-drop workflow tracking.
- **User Management**: Admin tools for role toggling and account management.
- **Performance**: Parallel data fetching for fast page loads.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 13.5 (App Router), React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Railway

---

## 📦 Setup & Installation

1. **Clone & Install**:
   ```bash
   git clone https://github.com/venkatasai31-07/Team-Task-Manager.git
   cd team-task-manager
   npm install
   ```

2. **Environment Configuration**:
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Development Mode**:
   ```bash
   npm run dev
   ```

---

## 🌐 Deployment

Connect your GitHub repository to **Railway** and add the Supabase environment variables in the dashboard for automatic deployment.

---

## 🎥 Demonstration
[Click here to watch the Demo Video] (Replace this with your link)

---
Built for the Ethara AI Full-Stack Assessment.
