# 💎 TaskFlow: Ultra-Premium Team Task Manager

TaskFlow is a production-grade, full-stack collaborative platform designed for high-performance teams. Built with a focus on **Ultra-Premium Aesthetics** and **Robust Security**, it allows organizations to manage projects and tasks with granular control.

---

## ✨ Features

### 🎨 Ultra-Premium Experience
- **Glassmorphism Design**: Frosted glass interfaces with deep-space indigo gradients.
- **Dynamic Dashboard**: Real-time analytics with glowing stat cards and hover-lift effects.
- **Responsive Layout**: Seamless experience across mobile, tablet, and desktop.

### 🛡️ Secure Auth & RBAC
- **One-Click Login**: Optimized session handling for instant access.
- **Role-Based Access Control**:
  - **Admin**: Full system oversight, project creation, and user management.
  - **Member**: Focused workspace for assigned tasks and collaboration.

### 🛠️ Core Functionality
- **Project Boards**: Intuitive Kanban-style task management.
- **Admin Console**: Global user management with role toggling and account deletion.
- **Real-time Analytics**: Live tracking of overdue tasks, team workload, and project health.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 13.5 (App Router), React 18
- **Styling**: Tailwind CSS (Premium Theme)
- **Backend**: Next.js API Routes (Serverless)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (SSR Optimized)
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

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 🌐 Deployment

The application is optimized for **Railway**. Simply connect your GitHub repository and ensure your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` variables are added to the Railway dashboard.

---

## 🎥 Demonstration
[Link to Demo Video] (Upload your video and replace this link)

---
Built for the Ethara AI Full-Stack Assessment with 💎 Ultra-Premium Design Standards.
