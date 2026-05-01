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

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { title, description, due_date, priority, project_id, assigned_to } = await req.json();

    if (!title || !project_id) {
      return NextResponse.json({ error: 'Title and Project ID are required' }, { status: 400 });
    }

    // Verify if admin of project
    const { data: project, error: pError } = await supabase
      .from('projects')
      .select('admin_id')
      .eq('id', project_id)
      .single();
    
    if (pError || project.admin_id !== user.id) {
      return NextResponse.json({ error: 'Only Project Admin can create tasks' }, { status: 403 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, description, due_date, priority, project_id, assigned_to }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('tasks')
      .select('*, assigned_profile:assigned_to(name, email)')
      .eq('project_id', projectId);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
