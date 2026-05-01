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

    const { name, description } = await req.json();
    if (!name) return NextResponse.json({ error: 'Project name is required' }, { status: 400 });

    const { data, error } = await supabase
      .from('projects')
      .insert([{ name, description, admin_id: user.id }])
      .select()
      .single();

    if (error) throw error;

    // Add admin as first member
    await supabase.from('project_members').insert([{ project_id: data.id, user_id: user.id }]);

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Projects where user is admin or member
    // Using a join or separate queries
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles:admin_id(name, email), project_members!inner(user_id)')
      .or(`admin_id.eq.${user.id},project_members.user_id.eq.${user.id}`);

    if (error) throw error;

    // Format to match old structure
    const projects = data.map(p => ({
      ...p,
      admin: p.profiles,
      members_count: p.project_members.length // Simplified for now
    }));

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
