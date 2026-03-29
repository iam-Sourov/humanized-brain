import { GoogleGenerativeAI } from "@google/generative-ai";
import Anthropic from "@anthropic-ai/sdk";
import { injectLinguisticNoise } from "./dictionary";
import { analyzeLinguistics } from "./detector";

const geminiKey = process.env.GEMINI_API_KEY || null;
const anthropicKey = process.env.ANTHROPIC_API_KEY || null;

const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;
const anthropic = anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : null;

// The simulated humanization function is kept only as an absolute last resort 
// if the keys are truly invalid during physical generation attempt.
function simulateHumanization(text: string): string {
  if (!text) return "";
  const sentences = text.split('. ');
  return sentences.map(s => {
    let processed = s.trim()
      .replace(/^The /i, "That particular ")
      .replace(/^AI /i, "Automated systems ")
      .replace(/furthermore/i, "also")
      .replace(/moreover/i, "plus");
    
    if (processed.endsWith("ly")) processed = processed.replace(/ly$/, "ly, depending on how you look at it");
    return processed;
  }).join('. ');
}

export async function humanizeText(text: string, intensity: string = 'Standard', maxRetries = 2): Promise<string> {
  let attempts = 0;
  let currentText = text;

  while (attempts <= maxRetries) {
    try {
      // 1. Try Claude 3.5 Sonnet (Premium Tier) - The Humanizer
      if (anthropic && anthropicKey) {
        const message = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20240620",
          max_tokens: 4096,
          system: `You are an expert at breaking down AI text and rewriting it with a specific unfiltered human persona. Your goal is to increase perplexity and burstiness by intentionally varying sentence structures. You MUST enforce a strictly '${intensity}' tone.`,
          messages: [{
            role: "user",
            content: `Perform a multi-stage pipeline on this text:
            1. Deconstruction: Break the AI text into core ideas.
            2. Persona Injection: Rewrite those ideas using a strong '${intensity}' human persona. Ensure vocabulary matches this intensity perfectly.
            
            Keep the original meaning but completely overhaul the delivery. Output ONLY the final humanized text in pure Markdown. No explanations.
            
            Text to humanize: \n\n${currentText}`
          }],
        });
        
        const content = message.content[0];
        if ('text' in content) {
          let humanizedContent = content.text;
          
          // 3. Linguistic Noise Injection
          humanizedContent = injectLinguisticNoise(humanizedContent);
          
          const heuristics = analyzeLinguistics(humanizedContent);
          const aiProbability = heuristics.aiProbability;
          console.log(`[Attempt ${attempts + 1}] Math AI Detection Score: ${aiProbability}%`);
          
          if (aiProbability < 40) {
            return humanizedContent; // Success! It passes as human
          } else {
            currentText = humanizedContent; // Retry
          }
        }
      } 
      // 2. Fallback to Gemini if Claude isn't available
      else if (genAI && geminiKey) {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          You are a Content Humanizer. Rewrite this text to sound 100% human.
          Requirements:
          - Increase perplexity and burstiness.
          - Use a strictly '${intensity}' persona and vocabulary.
          - Output as pure Markdown.
          Text to humanize: \n\n${currentText}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let humanizedContent = response.text();
        humanizedContent = injectLinguisticNoise(humanizedContent);
        
        const heuristics = analyzeLinguistics(humanizedContent);
        if (heuristics.aiProbability < 40) {
          return humanizedContent;
        } else {
          currentText = humanizedContent;
        }
      } else {
        // BREAK EARLY intentionally if no keys exist. The user MUST attach keys for 100% accuracy.
        console.error("CRITICAL FATAL: User requested 100% real humanization but no API keys were found in environment.");
        return simulateHumanization(text); 
      }
    } catch (error) {
      console.error("AI Generation Error", error);
      break;
    }
    attempts++;
  }

  // 3. Fallback to Simulation (Zero Error Mode)
  return simulateHumanization(text);
}

export async function verifyAndRefine(text: string, intensity: string): Promise<string> {
  const heuristics = analyzeLinguistics(text);
  if (heuristics.aiProbability > 40) {
    if (geminiKey || anthropicKey) {
       return humanizeText(text, intensity, 1);
    }
  }
  return text; 
}

