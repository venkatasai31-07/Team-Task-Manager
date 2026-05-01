import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Project from '@/models/Project';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userPayload = await getAuthUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (userPayload as any).id;

    // Find projects where user is involved
    const projects = await Project.find({
      $or: [{ admin: userId }, { members: userId }]
    });

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const allTasks = await Task.find({ project: { $in: projectIds } });

    // Filter tasks based on role if needed, 
    // but the requirement for dashboard seems to be overall stats.
    
    const totalTasks = allTasks.length;
    const tasksByStatus = {
      todo: allTasks.filter(t => t.status === 'To Do').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      done: allTasks.filter(t => t.status === 'Done').length,
    };

    const now = new Date();
    const overdueTasks = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'Done').length;

    // Tasks per user (only for project admins to see?)
    // Let's just calculate it for all involved users in those projects
    const tasksPerUser: Record<string, number> = {};
    for (const task of allTasks) {
      if (task.assignedTo) {
        const id = task.assignedTo.toString();
        tasksPerUser[id] = (tasksPerUser[id] || 0) + 1;
      }
    }

    // Resolve user names for tasksPerUser
    const userIds = Object.keys(tasksPerUser);
    const users = await User.find({ _id: { $in: userIds } }, 'name');
    const tasksPerUserName = users.map(u => ({
      name: u.name,
      count: tasksPerUser[u._id.toString()]
    }));

    return NextResponse.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser: tasksPerUserName
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
