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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email is required' }, { status: 400 });

    const { data: targetUser, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: 'User not found. Ask them to sign up first!' }, { status: 404 });
    }

    const { error: memberError } = await supabase
      .from('project_members')
      .insert([{ project_id: params.id, user_id: targetUser.id }]);

    if (memberError) {
      if (memberError.code === '23505') {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
      }
      throw memberError;
    }

    return NextResponse.json({ message: 'Member added successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('userId');
    if (!targetUserId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 });

    // Verify requesting user is Admin of the project
    const { data: project } = await supabase.from('projects').select('admin_id').eq('id', params.id).single();
    if (project?.admin_id !== user.id) return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });

    // Don't allow admin to remove themselves
    if (targetUserId === user.id) return NextResponse.json({ error: 'Admin cannot be removed' }, { status: 400 });

    const { error } = await supabase
      .from('project_members')
      .delete()
      .eq('project_id', params.id)
      .eq('user_id', targetUserId);

    if (error) throw error;
    return NextResponse.json({ message: 'Member removed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
