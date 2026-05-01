'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { session, user } = useAuth();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  useEffect(() => {
    if (session && id) {
      fetchProject();
      fetchTasks();
    }
  }, [session, id]);

  const fetchProject = async () => {
    const res = await fetch(`/api/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    setProject(data);
  };

  const fetchTasks = async () => {
    const res = await fetch(`/api/tasks?projectId=${id}`, {
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    const data = await res.json();
    if (Array.isArray(data)) setTasks(data);
    setLoading(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        title: taskTitle, 
        description: taskDesc, 
        priority: taskPriority, 
        due_date: taskDueDate, 
        project_id: id,
        assigned_to: taskAssignedTo || null
      })
    });
    if (res.ok) {
      setShowTaskModal(false);
      setTaskTitle('');
      setTaskDesc('');
      fetchTasks();
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (res.ok) fetchTasks();
  };

  if (loading) return <DashboardLayout><div>Loading project...</div></DashboardLayout>;
  if (!project) return <DashboardLayout><div>Project not found.</div></DashboardLayout>;

  const isAdmin = project.admin_id === user?.id;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="text-gray-500 mt-2">{project.description}</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setShowTaskModal(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + New Task
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TaskColumn 
          title="To Do" 
          tasks={tasks.filter(t => t.status === 'To Do')} 
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn 
          title="In Progress" 
          tasks={tasks.filter(t => t.status === 'In Progress')} 
          onStatusChange={updateTaskStatus}
        />
        <TaskColumn 
          title="Done" 
          tasks={tasks.filter(t => t.status === 'Done')} 
          onStatusChange={updateTaskStatus}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input 
                  type="text" 
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <select 
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Assign To</label>
                <select 
                  value={taskAssignedTo} 
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Unassigned</option>
                  {project.members?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-700">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function TaskColumn({ title, tasks, onStatusChange }: { title: string, tasks: any[], onStatusChange: any }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center">
        {title} <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
      </h3>
      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-bold text-gray-900">{task.title}</h4>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
            <div className="mt-3 flex justify-between items-center">
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                task.priority === 'High' ? 'bg-red-100 text-red-700' : 
                task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {task.priority}
              </span>
              <span className="text-[10px] text-gray-400">
                {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}
              </span>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between items-center">
               <span className="text-[10px] text-gray-500 italic">
                 {task.assigned_profile ? `Assigned to ${task.assigned_profile.name}` : 'Unassigned'}
               </span>
               <select 
                 className="text-[10px] border-none bg-gray-50 rounded p-1"
                 value={task.status}
                 onChange={(e) => onStatusChange(task.id, e.target.value)}
               >
                 <option value="To Do">To Do</option>
                 <option value="In Progress">In Progress</option>
                 <option value="Done">Done</option>
               </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
