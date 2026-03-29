import { NextRequest, NextResponse } from 'next/server';
import { analyzeLinguistics } from '@/lib/ai/detector';

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Run mathematical AI detector natively
    const heuristics = analyzeLinguistics(text);

    return NextResponse.json({ 
      detectorScore: heuristics.aiProbability
    });
  } catch (error) {
    console.error('Detection Error:', error);
    return NextResponse.json({ error: 'Processing Error', details: error instanceof Error ? error.message : "Unknown" }, { status: 500 });
  }
}
