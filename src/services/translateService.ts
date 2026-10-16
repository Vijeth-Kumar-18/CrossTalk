import Groq from 'groq-sdk';
import { StanceType, TranslateResponse } from '@/types/clashTypes';

function getGroqClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('example') || apiKey.trim() === '') {
    return null;
  }
  try {
    return new Groq({ apiKey });
  } catch (err) {
    console.warn('[CrossTalk Service] Groq init warning:', err);
    return null;
  }
}

function analyzeLinguisticEdge(
  text: string,
  didInterrupt: boolean
): { sentiment: string; heatScore: number; isConcession: boolean; stance: StanceType } {
  const lower = text.toLowerCase();

  const concessionWords = [
    'fair point',
    'you have a point',
    'you are right',
    'you might be right',
    'i admit',
    'i agree with that',
    'i can accept',
    'fine, i accept',
    'hast du recht',
    'stimmt wohl',
    'einverstanden',
    'tu as raison',
    'd’accord',
    'theek hai',
    'sahi baat hai',
    'maan leta hoon',
  ];

  const heatedWords = [
    'ridiculous',
    'unfair',
    'absurd',
    'unacceptable',
    'not working for free',
    'stop lying',
    'unverschämt',
    'lächerlich',
    'nie im vertrag',
    'scandaleux',
    'inacceptable',
    'galat hai',
    'bakwas',
  ];

  const defensiveWords = [
    'hold on',
    'wait a second',
    'let me explain',
    'that was not the agreement',
    'warte kurz',
    'lass mich ausreden',
    'attends',
    'ek minute',
    'meri baat',
  ];

  const isConcession = concessionWords.some((w) => lower.includes(w));
  const isHeated = heatedWords.some((w) => lower.includes(w));
  const isDefensive = defensiveWords.some((w) => lower.includes(w));
  const hasExclamation = text.includes('!') || text.includes('?!');

  if (isConcession) {
    return {
      sentiment: 'conceding',
      heatScore: Math.max(2, 4 - (didInterrupt ? 1 : 0)),
      isConcession: true,
      stance: 'Conceding',
    };
  }

  if (isHeated) {
    const heat = Math.min(10, 7 + (didInterrupt ? 2 : 1) + (hasExclamation ? 1 : 0));
    return {
      sentiment: 'heated',
      heatScore: heat,
      isConcession: false,
      stance: 'Pushing Back',
    };
  }

  if (isDefensive) {
    return {
      sentiment: 'defensive',
      heatScore: 5 + (didInterrupt ? 2 : 0),
      isConcession: false,
      stance: 'Defending Position',
    };
  }

  if (didInterrupt || hasExclamation) {
    return {
      sentiment: 'escalating',
      heatScore: Math.min(9, 6 + (hasExclamation ? 2 : 1)),
      isConcession: false,
      stance: 'Pushing Back',
    };
  }

  return {
    sentiment: 'firm',
    heatScore: 4,
    isConcession: false,
    stance: 'Standing Firm',
  };
}

async function fallbackTranslate(text: string, fromLang: string, toLang: string): Promise<string> {
  const fromCode = fromLang.split('-')[0];
  const toCode = toLang.split('-')[0];

  if (fromCode === toCode) return text;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromCode}|${toCode}`;
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data?.responseData?.translatedText) {
        return data.responseData.translatedText;
      }
    }
  } catch {
    // fallback
  }

  return `[${toLang}] ${text}`;
}

export async function processDisputeTurn(params: {
  text: string;
  fromLang: string;
  toLang: string;
  didInterrupt?: boolean;
}): Promise<TranslateResponse> {
  const groq = getGroqClient();

  if (groq) {
    try {
      const prompt = `
You are the real-time dispute translator for CrossTalk.
Two people are having a direct, contentious debate in different languages.

TRANSLATE from ${params.fromLang} to ${params.toLang}.
RULES:
1. Preserve natural emotion, urgency, firmness, and colloquial slang.
2. DO NOT sanitize or make it polite corporate speak.
3. Detect speaker stance: "Standing Firm" | "Pushing Back" | "Defending Position" | "Considering Point" | "Conceding"
4. Detect if this is a concession (yielding ground, agreeing to a point): true/false
5. Assign heatScore: 1 to 10 integer.

INPUT: "${params.text}"
DID INTERRUPT OPPONENT: ${params.didInterrupt ? 'YES' : 'NO'}

RETURN STRICT JSON ONLY:
{
  "translatedText": "...",
  "sentiment": "heated" | "firm" | "defensive" | "conceding",
  "heatScore": 7,
  "isConcession": false,
  "stance": "Pushing Back"
}
`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 400,
      });

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          translatedText: parsed.translatedText || params.text,
          sentiment: parsed.sentiment || 'firm',
          heatScore: Math.max(1, Math.min(10, Number(parsed.heatScore) || 5)),
          isConcession: Boolean(parsed.isConcession),
          stance: parsed.stance || 'Standing Firm',
        };
      }
    } catch (err) {
      console.warn('[CrossTalk Service] Groq inference error, using linguistic engine:', err);
    }
  }

  // Fallback linguistic processor
  const edge = analyzeLinguisticEdge(params.text, Boolean(params.didInterrupt));
  const translated = await fallbackTranslate(params.text, params.fromLang, params.toLang);

  return {
    translatedText: translated,
    sentiment: edge.sentiment,
    heatScore: edge.heatScore,
    isConcession: edge.isConcession,
    stance: edge.stance,
  };
}
