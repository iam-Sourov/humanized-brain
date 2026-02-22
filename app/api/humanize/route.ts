import { NextRequest, NextResponse } from 'next/server';
import { humanizeText, verifyAndRefine } from '@/lib/ai/claude';

export async function POST(req: NextRequest) {
  try {
    const { text, fileType } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Step 1: Humanize
    // In a production app, we would also extract style metadata here
    const humanized = await humanizeText(text);

    // Step 2: AI Detector Verification & Refinement
    const refined = await verifyAndRefine(humanized);

    return NextResponse.json({
      original: text,
      humanized: refined,
      score: 0.98, // Simulated human score
      metadata: {
        fileType,
        appliedStyles: ['high-perplexity', 'varied-burstiness']
      }
    });
  } catch (error: any) {
    console.error('Humanization Error:', error);
    return NextResponse.json({ error: 'Failed to process document' }, { status: 500 });
  }
}
