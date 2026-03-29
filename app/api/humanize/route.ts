import { NextRequest, NextResponse } from 'next/server';
import { humanizeText, verifyAndRefine } from '@/lib/ai/humanizer';
import { analyzeLinguistics } from '@/lib/ai/detector';

export async function POST(req: NextRequest) {
  try {
    const { text, fileType, intensity = 'Standard' } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    // Step 1: Humanize
    const humanized = await humanizeText(text, intensity);

    // Step 2: AI Detector Verification & Refinement
    const refined = await verifyAndRefine(humanized, intensity);

    // Step 3: Run true AI detection logic against finalized text
    const heuristics = analyzeLinguistics(refined);

    const isSimulation = !process.env.GEMINI_API_KEY && !process.env.ANTHROPIC_API_KEY;

    return NextResponse.json({
      original: text,
      humanized: refined,
      detectorScore: heuristics.aiProbability, 
      perplexityScore: heuristics.perplexityScore,
      burstinessScore: heuristics.burstinessScore,
      mode: isSimulation ? 'simulation' : 'ai-premium',
      metadata: {
        fileType,
        intensity,
        engine: isSimulation ? 'Linguistic-Sim-V1' : 'AI-Premium-Nexus',
      }
    });
  } catch (error) {
    console.error('Humanization Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Processing Error';
    return NextResponse.json({ 
      error: 'Processing Error',
      details: errorMessage 
    }, { status: 500 });
  }
}

