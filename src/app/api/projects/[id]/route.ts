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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: project, error } = await supabase
      .from('projects')
      .select('*, profiles:admin_id(name, email), project_members(profiles:user_id(id, name, email))')
      .eq('id', params.id)
      .single();

    if (error || !project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Format
    const formatted = {
      ...project,
      admin: project.profiles,
      members: project.project_members.map((pm: any) => pm.profiles)
    };

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: project } = await supabase.from('projects').select('admin_id').eq('id', params.id).single();
    if (project?.admin_id !== user.id) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    const { name, description } = await req.json();
    const { data, error } = await supabase
      .from('projects')
      .update({ name, description })
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

    const { data: project } = await supabase.from('projects').select('admin_id').eq('id', params.id).single();
    if (project?.admin_id !== user.id) return NextResponse.json({ error: 'Admin access required' }, { status: 403 });

    await supabase.from('projects').delete().eq('id', params.id);
    return NextResponse.json({ message: 'Project deleted' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
