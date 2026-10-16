import { NextRequest, NextResponse } from 'next/server';
import { joinDebateRoom, getRoomByCode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { roomCode, userId, userLang } = body;

    if (!roomCode || !userId) {
      return NextResponse.json({ success: false, error: 'Room code and user are required.' }, { status: 400 });
    }

    const room = await joinDebateRoom({
      roomCode: roomCode.trim().toUpperCase(),
      userId,
      userLang: userLang || 'de-DE',
    });

    if (!room) {
      return NextResponse.json({ success: false, error: 'Room not found with provided code.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error('[API /api/rooms/join] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to join debate room.' }, { status: 500 });
  }
}
