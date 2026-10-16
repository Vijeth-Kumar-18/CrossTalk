import { NextRequest, NextResponse } from 'next/server';
import { getRoomById } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const room = await getRoomById(id);

    if (!room) {
      return NextResponse.json({ success: false, error: 'Debate room not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, room });
  } catch (err) {
    console.error('[API /api/rooms/[id]] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch room.' }, { status: 500 });
  }
}
