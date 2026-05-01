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

    // Get project IDs where user is involved
    const { data: projectMembers, error: pmError } = await supabase
      .from('project_members')
      .select('project_id')
      .eq('user_id', userId);
    
    if (pmError) throw pmError;
    const projectIds = projectMembers.map(pm => pm.project_id);

    // Get all tasks for these projects
    const { data: allTasks, error: tError } = await supabase
      .from('tasks')
      .select('*')
      .in('project_id', projectIds);
    
    if (tError) throw tError;

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

    // If user is Admin, we should also return a list of ALL users in the system
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', userId).single();
    let allSystemUsers: any[] = [];
    if (profile?.role === 'Admin') {
      const { data: allUsers } = await supabase.from('profiles').select('id, name, email, role');
      allSystemUsers = allUsers || [];
    }

    return NextResponse.json({
      totalTasks,
      tasksByStatus,
      overdueTasks,
      tasksPerUser: tasksPerUserName,
      allSystemUsers, // New field for Admin Console
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
