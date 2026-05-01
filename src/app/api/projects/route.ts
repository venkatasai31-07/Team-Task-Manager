import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Project from '@/models/Project';
import { getAuthUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const userPayload = await getAuthUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    const project = await Project.create({
      name,
      description,
      admin: (userPayload as any).id,
      members: [(userPayload as any).id], // Admin is also a member
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const userPayload = await getAuthUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Projects where user is admin or member
    const projects = await Project.find({
      $or: [
        { admin: (userPayload as any).id },
        { members: (userPayload as any).id }
      ]
    }).populate('admin', 'name email').populate('members', 'name email');

    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
