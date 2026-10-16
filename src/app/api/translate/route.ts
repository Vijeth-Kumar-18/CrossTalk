import { NextRequest, NextResponse } from 'next/server';
import { processDisputeTurn } from '@/services/translateService';
import { addDebateTurn, getRoomById } from '@/lib/db';
import { TranslateRequest } from '@/types/clashTypes';

export async function POST(req: NextRequest) {
  try {
    const body: TranslateRequest = await req.json();
    const { roomId, speakerId, text, fromLang, toLang, didInterrupt } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Text content cannot be empty.' }, { status: 400 });
    }

    if (!roomId || !speakerId) {
      return NextResponse.json({ success: false, error: 'Room ID and Speaker ID are required.' }, { status: 400 });
    }

    // Process emotional argument translation and stance analysis
    const analysis = await processDisputeTurn({
      text: text.trim(),
      fromLang: fromLang || 'en-US',
      toLang: toLang || 'de-DE',
      didInterrupt: Boolean(didInterrupt),
    });

    // Save turn into database
    const turn = await addDebateTurn({
      roomId,
      speakerId,
      originalText: text.trim(),
      translatedText: analysis.translatedText,
      sentiment: analysis.sentiment,
      heatScore: analysis.heatScore,
      isConcession: analysis.isConcession,
      didInterrupt: Boolean(didInterrupt),
    });

    return NextResponse.json({
      success: true,
      data: {
        turn,
        analysis,
      },
    });
  } catch (err) {
    console.error('[API /api/translate] Error:', err);
    return NextResponse.json({ success: false, error: 'Translation processing failed.' }, { status: 500 });
  }
}
