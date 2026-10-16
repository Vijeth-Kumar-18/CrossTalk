import { NextRequest, NextResponse } from 'next/server';
import { getRoomTurns } from '@/lib/db';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const turns = await getRoomTurns(id);

    return NextResponse.json({ success: true, turns });
  } catch (err) {
    console.error('[API /api/rooms/[id]/turns] Error:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch turns.' }, { status: 500 });
  }
}
