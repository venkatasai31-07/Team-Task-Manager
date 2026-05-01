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

    // 1. Create project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert([{ name, description, admin_id: user.id }])
      .select()
      .single();

    if (projectError) {
      console.error('Project Create Error:', projectError);
      throw projectError;
    }

    // 2. Add admin as first member
    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{ project_id: project.id, user_id: user.id }]);
    
    if (memberError) {
       console.error('Member Add Error:', memberError);
       // We don't necessarily want to fail project creation if member add fails, 
       // but here they are linked so it's important.
    }

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error('API POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Step 1: Get all projects where the user is a member
    const { data: membershipData, error: membershipError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', user.id);

    if (membershipError) throw membershipError;

    const projectIds = membershipData.map(m => m.project_id);

    // Step 2: Get projects where user is admin OR is in the projectIds list
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles:admin_id(name, email)')
      .or(`admin_id.eq.${user.id}${projectIds.length > 0 ? `,id.in.(${projectIds.join(',')})` : ''}`);

    if (error) throw error;

    // Format for frontend
    const projects = data.map(p => ({
      ...p,
      admin: p.profiles,
      members_count: 1 // We can enhance this later
    }));

    return NextResponse.json(projects);
  } catch (error: any) {
    console.error('Project Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
