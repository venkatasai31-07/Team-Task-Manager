import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

async function getAuthUser(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: task, error: tError } = await supabase
      .from('tasks')
      .select('*, projects(admin_id)')
      .eq('id', params.id)
      .single();
    
    if (tError || !task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const project = task.projects as any;
    const isAdmin = project.admin_id === user.id;
    const isAssigned = task.assigned_to === user.id;

    if (!isAdmin && !isAssigned) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await req.json();
    const updateData: any = {};

    if (!isAdmin) {
      if (body.status) updateData.status = body.status;
    } else {
      if (body.title) updateData.title = body.title;
      if (body.description) updateData.description = body.description;
      if (body.status) updateData.status = body.status;
      if (body.priority) updateData.priority = body.priority;
      if (body.due_date) updateData.due_date = body.due_date;
      if (body.assigned_to) updateData.assigned_to = body.assigned_to;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: task } = await supabase.from('tasks').select('projects(admin_id)').eq('id', params.id).single();
    const project = task?.projects as any;
    
    if (project?.admin_id !== user.id) {
      return NextResponse.json({ error: 'Only Project Admin can delete tasks' }, { status: 403 });
    }

    await supabase.from('tasks').delete().eq('id', params.id);
    return NextResponse.json({ message: 'Task deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
