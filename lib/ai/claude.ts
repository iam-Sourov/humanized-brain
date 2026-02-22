import Anthropic from '@anthropic-ai/sdk';

const apiKey = process.env.ANTHROPIC_API_KEY;

if (!apiKey && typeof window === 'undefined') {
  console.warn('Warning: ANTHROPIC_API_KEY is not set. AI humanization will fail.');
}

const anthropic = new Anthropic({
  apiKey: apiKey || 'dummy-key-for-init',
});

export async function humanizeText(text: string, context: string = '') {
  if (!apiKey) throw new Error('AI Service not configured. Please add ANTHROPIC_API_KEY to your environment.');

  const humanizeResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 4000,
    temperature: 0.7,
    system: `You are a Senior Content Humanizer. Your goal is to rewrite AI-generated text to sound 100% human.
    Requirements:
    - Increase perplexity (sentence complexity variety).
    - Increase burstiness (varied sentence lengths).
    - Maintain 100% of the original meaning and factual accuracy.
    - Preserve all formatting cues (headers, bold text, lists).
    - Avoid typical AI "fingerprints".
    - Output in Markdown format.`,
    messages: [
      {
        role: 'user',
        content: `Humanize the following text while preserving its meaning: \n\n${text}`,
      },
    ],
  });

  const humanizedContent = humanizeResponse.content[0].type === 'text' 
    ? humanizeResponse.content[0].text 
    : '';

  return humanizedContent;
}

export async function verifyAndRefine(text: string) {
  if (!apiKey) throw new Error('AI Service not configured.');

  const refinementResponse = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20240620',
    max_tokens: 4000,
    temperature: 0.4,
    system: `You are an AI Detection Specialist. Your task is to review text and refine it to ensure it passes advanced AI detectors.
    Focus on:
    - Removing any remaining robotic patterns.
    - Enhancing the natural flow and idiomatic expressions.`,
    messages: [
      {
        role: 'user',
        content: `Refine this text to pass AI detection: \n\n${text}`,
      },
    ],
  });

  return refinementResponse.content[0].type === 'text' 
    ? refinementResponse.content[0].text 
    : '';
}
