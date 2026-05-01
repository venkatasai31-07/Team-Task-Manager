'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/context/ToastContext';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session, user } = useAuth();
  const { showToast } = useToast();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskSaving, setTaskSaving] = useState(false);
  
  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignedTo, setTaskAssignedTo] = useState('');

  // Member form state
  const [memberEmail, setMemberEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

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

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskSaving(true);
    const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
    const method = editingTask ? 'PUT' : 'POST';
    
    try {
      const res = await fetch(url, {
        method,
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
        setEditingTask(null);
        resetTaskForm();
        fetchTasks();
        showToast(editingTask ? 'Task updated!' : 'Task created successfully!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to save task', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    } finally {
      setTaskSaving(false);
    }
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskDueDate('');
    setTaskAssignedTo('');
  };

  const openEditModal = (task: any) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDesc(task.description || '');
    setTaskPriority(task.priority);
    setTaskDueDate(task.due_date ? task.due_date.split('T')[0] : '');
    setTaskAssignedTo(task.assigned_to || '');
    setShowTaskModal(true);
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
    if (res.ok) {
      fetchTasks();
      showToast('Status updated');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (res.ok) {
      fetchTasks();
      showToast('Task deleted', 'info');
    }
  };

  const deleteProject = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: Are you sure you want to delete this project?\n\n' +
      'This will PERMANENTLY delete:\n' +
      '• All tasks associated with this project\n' +
      '• All member associations\n' +
      '• All project data\n\n' +
      'This action cannot be undone.'
    );
    if (!confirmed) return;
    const res = await fetch(`/api/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (res.ok) {
       router.push('/projects');
    }
  };
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setMemberError('');
    setMemberLoading(true);
    const res = await fetch(`/api/projects/${id}/members`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: memberEmail })
    });
    const data = await res.json();
    setMemberLoading(false);
    if (res.ok) {
      setMemberEmail('');
      showToast('Member added to project!');
      fetchProject(); // Refresh member list
    } else {
      setMemberError(data.error);
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!window.confirm('Remove this member from the project?')) return;
    const res = await fetch(`/api/projects/${id}/members?userId=${targetUserId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (res.ok) {
      showToast('Member removed');
      fetchProject();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to remove member', 'error');
    }
  };

  if (loading) return <DashboardLayout><div className="text-gray-900 font-bold text-center mt-10">Loading project...</div></DashboardLayout>;
  if (!project) return <DashboardLayout><div>Project not found.</div></DashboardLayout>;

  const isAdmin = project.admin_id === user?.id;

  return (
    <DashboardLayout>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">{project.description}</p>
        </div>
        <div className="flex space-x-3">
          {isAdmin && (
            <>
              <button 
                onClick={deleteProject}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition border border-red-200 text-sm font-medium"
              >
                Delete Project
              </button>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                + New Task
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Project Members</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {project.members?.map((m: any) => (
            <div key={m.id} className="group flex items-center bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
              {m.name} {m.id === user?.id && '(You)'}
              {isAdmin && m.id !== user?.id && (
                <button 
                  onClick={() => handleRemoveMember(m.id)}
                  className="ml-2 text-indigo-300 hover:text-red-500 transition-colors"
                  title="Remove member"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        
        {isAdmin && (
          <form onSubmit={handleAddMember} className="flex space-x-2 max-w-md">
            <input 
              type="email" 
              placeholder="Enter member email"
              required
              className="flex-grow border border-gray-300 rounded-lg p-2 text-sm text-gray-900"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={memberLoading}
              className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-black transition disabled:opacity-50"
            >
              {memberLoading ? 'Adding...' : 'Add Member'}
            </button>
          </form>
        )}
        {memberError && <p className="text-red-600 text-xs mt-2">{memberError}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <TaskColumn 
          title="To Do" 
          tasks={tasks.filter(t => t.status === 'To Do')} 
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
          onEdit={openEditModal}
          isAdmin={isAdmin}
          currentUserId={user?.id || ''}
        />
        <TaskColumn 
          title="In Progress" 
          tasks={tasks.filter(t => t.status === 'In Progress')} 
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
          onEdit={openEditModal}
          isAdmin={isAdmin}
          currentUserId={user?.id || ''}
        />
        <TaskColumn 
          title="Done" 
          tasks={tasks.filter(t => t.status === 'Done')} 
          onStatusChange={updateTaskStatus}
          onDelete={deleteTask}
          onEdit={openEditModal}
          isAdmin={isAdmin}
          currentUserId={user?.id || ''}
        />
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="Task title"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Description</label>
                <textarea 
                  placeholder="What needs to be done?"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Priority</label>
                  <select 
                    value={taskPriority} 
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800">Due Date</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800">Assign To</label>
                <select 
                  value={taskAssignedTo} 
                  onChange={(e) => setTaskAssignedTo(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-gray-900 bg-white"
                >
                  <option value="">Unassigned</option>
                  {project.members?.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    resetTaskForm();
                  }} 
                  className="px-4 py-2 text-gray-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={taskSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
                >
                  {taskSaving ? 'Saving...' : (editingTask ? 'Save Changes' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function TaskColumn({ title, tasks, onStatusChange, onDelete, onEdit, isAdmin, currentUserId }: { title: string, tasks: any[], onStatusChange: any, onDelete: any, onEdit: any, isAdmin: boolean, currentUserId: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
      <h3 className="text-lg font-bold mb-4 flex items-center text-gray-800">
        {title} <span className="ml-2 bg-gray-200 text-gray-600 text-xs px-2 py-0.5 rounded-full">{tasks.length}</span>
      </h3>
      <div className="space-y-4">
        {tasks.map(task => {
          const isAssignedToMe = task.assigned_to === currentUserId;
          const canManage = isAdmin || isAssignedToMe;

          return (
            <div key={task.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 group relative">
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {canManage && (
                  <>
                    <button 
                       onClick={() => onEdit(task)}
                       className="text-gray-400 hover:text-indigo-600"
                       title="Edit task"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {isAdmin && (
                      <button 
                         onClick={() => onDelete(task.id)}
                         className="text-gray-400 hover:text-red-600"
                         title="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>
              <h4 className="font-bold text-gray-900 pr-12">{task.title}</h4>
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
              <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                 <span className="text-[10px] text-gray-500 italic">
                   {task.assigned_profile ? `Assigned to ${task.assigned_profile.name}` : 'Unassigned'}
                 </span>
                 {canManage ? (
                   <div className="flex items-center space-x-1">
                     <span className="text-[10px] text-gray-400 font-medium">Move to:</span>
                     <select 
                       className="text-[11px] font-bold border border-gray-200 bg-gray-50 rounded-md p-1.5 text-indigo-700 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-white transition"
                       value={task.status}
                       onChange={(e) => onStatusChange(task.id, e.target.value)}
                     >
                       <option value="To Do">To Do</option>
                       <option value="In Progress">In Progress</option>
                       <option value="Done">Done</option>
                     </select>
                   </div>
                 ) : (
                   <span className="text-[10px] bg-gray-100 px-2 py-1 rounded text-gray-400">Locked</span>
                 )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
