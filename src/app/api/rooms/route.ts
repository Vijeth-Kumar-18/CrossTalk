import { NextRequest, NextResponse } from 'next/server';
import { createDebateRoom, getUserDebateRooms } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, createdBy, creatorLang } = body;

    if (!topic || !createdBy) {
      return NextResponse.json({ success: false, error: 'Topic and User are required.' }, { status: 400 });
    }

    const room = await createDebateRoom({
      topic: topic.trim(),
      createdBy,
      creatorLang: creatorLang || 'en-US',
    });

    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error('[API /api/rooms] POST error:', err);
    return NextResponse.json({ success: false, error: 'Failed to create debate room.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
    }

    const rooms = await getUserDebateRooms(userId);
    return NextResponse.json({ success: true, rooms });
  } catch (err) {
    console.error('[API /api/rooms] GET error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch rooms.' }, { status: 500 });
  }
}
