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

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = user.id;

    // Parallel Fetching for maximum speed
    const [ { data: projectMembers }, { data: profile } ] = await Promise.all([
      supabase.from('project_members').select('project_id').eq('user_id', userId),
      supabase.from('profiles').select('role').eq('id', userId).single()
    ]);
    
    if (!projectMembers) throw new Error('Failed to fetch project members');
    const projectIds = projectMembers.map(pm => pm.project_id);

    // Fetch tasks and system users (if admin) in parallel
    const [ { data: allTasks }, systemUsersData ] = await Promise.all([
      supabase.from('tasks').select('*').in('project_id', projectIds),
      profile?.role === 'Admin' 
        ? supabase.from('profiles').select('id, name, email, role') 
        : Promise.resolve({ data: [] })
    ]);

    if (!allTasks) throw new Error('Failed to fetch tasks');
    const allSystemUsers = systemUsersData.data || [];

    const totalTasks = allTasks.length;
    const tasksByStatus = {
      todo: allTasks.filter(t => t.status === 'To Do').length,
      inProgress: allTasks.filter(t => t.status === 'In Progress').length,
      done: allTasks.filter(t => t.status === 'Done').length,
    };

    const now = new Date().toISOString();
    const overdueTasks = allTasks.filter(t => t.due_date && t.due_date < now && t.status !== 'Done').length;

    // Tasks per user
    const tasksPerUser: Record<string, number> = {};
    allTasks.forEach(t => {
      if (t.assigned_to) {
        tasksPerUser[t.assigned_to] = (tasksPerUser[t.assigned_to] || 0) + 1;
      }
    });

    // Resolve names
    const { data: users, error: uError } = await supabase
      .from('profiles')
      .select('id, name')
      .in('id', Object.keys(tasksPerUser));
    
    const tasksPerUserName = (users || []).map(u => ({
      name: u.name,
      count: tasksPerUser[u.id]
    }));

    return NextResponse.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser: tasksPerUserName,
      allSystemUsers,
      recentTasks: allTasks.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        project_id: t.project_id
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
