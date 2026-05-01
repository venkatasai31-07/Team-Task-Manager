import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Task from '@/models/Task';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userPayload = await getAuthUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findById(params.id).populate('project');
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const project = task.project as any;
    const isAdmin = project.admin.toString() === (userPayload as any).id;
    const isAssigned = task.assignedTo && task.assignedTo.toString() === (userPayload as any).id;

    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: 'You can only update tasks assigned to you' }, { status: 403 });
    }

    const { title, description, status, priority, dueDate, assignedTo } = await req.json();

    // Members can ONLY update status
    if (!isAdmin) {
      if (status) task.status = status;
      // Ignore other fields for members
    } else {
      // Admins can update everything
      if (title) task.title = title;
      if (description) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (dueDate) task.dueDate = dueDate;
      if (assignedTo) task.assignedTo = assignedTo;
    }

    await task.save();
    return NextResponse.json(task);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const userPayload = await getAuthUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const task = await Task.findById(params.id).populate('project');
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const project = task.project as any;
    if (project.admin.toString() !== (userPayload as any).id) {
      return NextResponse.json({ error: 'Only Project Admin can delete tasks' }, { status: 403 });
    }

    await Task.deleteOne({ _id: params.id });
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
