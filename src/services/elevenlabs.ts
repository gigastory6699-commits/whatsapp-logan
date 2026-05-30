import { UniversalEdgeTTS } from 'edge-tts-universal';

/**
 * ElevenLabs & Microsoft Edge Neural Text-to-Speech Service
 * Converts text to natural-sounding speech for voice summaries
 */

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const DEFAULT_VOICE_ID = '3JZUpoTOGG7akwuTH0DK'; // Hebrew-friendly voice

interface ElevenLabsVoiceSettings {
  stability: number;
  similarity_boost: number;
}

interface ElevenLabsRequest {
  text: string;
  model_id: string;
  voice_settings: ElevenLabsVoiceSettings;
}

/**
 * Trim text to the last complete sentence to prevent voice cutoff.
 * Looks for Hebrew sentence endings (. ! ?) and trims there.
 */
function trimToCompleteSentence(text: string): string {
  const trimmed = text.trim();

  // If it already ends with sentence-ending punctuation, it's fine
  if (/[.!?]$/.test(trimmed)) {
    return trimmed;
  }

  // Find the last sentence-ending punctuation
  const lastPeriod = trimmed.lastIndexOf('.');
  const lastExcl = trimmed.lastIndexOf('!');
  const lastQuestion = trimmed.lastIndexOf('?');
  const lastEnd = Math.max(lastPeriod, lastExcl, lastQuestion);

  if (lastEnd > trimmed.length * 0.5) {
    // Only trim if we keep at least 50% of the text
    console.log(`[ELEVENLABS] Trimming incomplete sentence: ${trimmed.length} -> ${lastEnd + 1} chars`);
    return trimmed.substring(0, lastEnd + 1);
  }

  // If no good cutoff point, return as-is (better than losing too much)
  console.log(`[ELEVENLABS] No safe sentence boundary found, using full text`);
  return trimmed;
}

/**
 * Convert text to speech using Microsoft Azure Neural TTS API
 */
async function azureTextToSpeech(text: string): Promise<Buffer | null> {
  const apiKey = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION || 'eastus';

  if (!apiKey) {
    console.error('[AZURE-TTS] AZURE_SPEECH_KEY not configured');
    return null;
  }

  // Detect language to use appropriate neural voice
  // If text contains Arabic characters, use Salma (Egypt), otherwise Jenny (US)
  const isArabic = /[\u0600-\u06FF]/.test(text);
  const voiceName = isArabic ? 'ar-EG-SalmaNeural' : 'en-US-JennyNeural';
  const langCode = isArabic ? 'ar-EG' : 'en-US';

  console.log(`[AZURE-TTS] Converting ${text.length} characters to speech (lang: ${langCode}, voice: ${voiceName})...`);

  const url = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;

  // Safely escape XML characters in text
  const escapedText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  const ssml = `<speak version='1.0' xml:lang='${langCode}'>
    <voice xml:lang='${langCode}' xml:gender='Female' name='${voiceName}'>
      ${escapedText}
    </voice>
  </speak>`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'MedoBot'
      },
      body: ssml
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AZURE-TTS] API error ${response.status}: ${errorText}`);
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[AZURE-TTS] Generated ${buffer.length} bytes of audio`);
    return buffer;
  } catch (error) {
    console.error('[AZURE-TTS] Request failed:', error);
    return null;
  }
}

/**
 * Convert text to speech using Microsoft Edge Neural TTS API (100% Free, Unlimited, no API key needed!)
 */
async function edgeTextToSpeech(text: string): Promise<Buffer | null> {
  try {
    // Detect language: use Salma (Arabic) or Jenny (English)
    const isArabic = /[\u0600-\u06FF]/.test(text);
    const voiceName = isArabic ? 'ar-EG-SalmaNeural' : 'en-US-JennyNeural';

    console.log(`[EDGE-TTS] Converting ${text.length} characters to speech (voice: ${voiceName})...`);

    const tts = new UniversalEdgeTTS(text, voiceName);
    const result = await tts.synthesize();
    const arrayBuffer = await result.audio.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`[EDGE-TTS] Generated ${buffer.length} bytes of audio`);
    return buffer;
  } catch (error) {
    console.error('[EDGE-TTS] Request failed:', error);
    return null;
  }
}

/**
 * Convert text to speech using ElevenLabs, Azure, or Edge TTS API
 * @param text The text to convert to speech
 * @returns Audio buffer (mp3 format) or null on failure
 */
export async function textToSpeech(text: string): Promise<Buffer | null> {
  if (process.env.AZURE_SPEECH_KEY) {
    return azureTextToSpeech(text);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (apiKey) {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;

    if (!text || text.trim().length === 0) {
      console.error('[ELEVENLABS] Empty text provided');
      return null;
    }

    // Safety net: trim to last complete sentence
    const safeText = trimToCompleteSentence(text);

    const url = `${ELEVENLABS_API_URL}/${voiceId}`;

    const requestBody: ElevenLabsRequest = {
      text: safeText,
      model_id: 'eleven_v3',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75
      }
    };

    try {
      console.log(`[ELEVENLABS] Converting ${safeText.length} characters to speech...`);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ELEVENLABS] API error ${response.status}: ${errorText}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[ELEVENLABS] Generated ${buffer.length} bytes of audio`);
      return buffer;
    } catch (error) {
      console.error('[ELEVENLABS] TTS request failed:', error);
      return null;
    }
  }

  // If neither Azure nor ElevenLabs is configured, use 100% free and unlimited Microsoft Edge TTS!
  return edgeTextToSpeech(text);
}

/**
 * Check if TTS is enabled (Always true because Edge TTS provides a 100% free fallback!)
 */
export function isElevenLabsEnabled(): boolean {
  return true;
}
