import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'openai/gpt-oss-120b';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

/**
 * Direct call to Groq for prompt translation and expansion
 */
async function callDirectGroq(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.warn(`[IMAGE-GEN] Groq API returned error status: ${response.status}`);
      return null;
    }

    const data = await response.json() as any;
    const content = data.choices?.[0]?.message?.content;
    return content ? content.trim() : null;
  } catch (error) {
    console.error('[IMAGE-GEN] Error calling direct Groq:', error);
    return null;
  }
}

/**
 * Direct call to Claude for prompt translation and expansion (Fallback)
 */
async function callDirectClaude(systemPrompt: string, userPrompt: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  try {
    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 300
      })
    });

    if (!response.ok) {
      console.warn(`[IMAGE-GEN] Claude API returned error status: ${response.status}`);
      return null;
    }

    const data = await response.json() as any;
    const content = data.content?.find((c: any) => c.type === 'text')?.text;
    return content ? content.trim() : null;
  } catch (error) {
    console.error('[IMAGE-GEN] Error calling direct Claude:', error);
    return null;
  }
}

/**
 * Optimizes and expands the user's raw image description into a rich visual prompt
 */
export async function expandPrompt(userRequest: string): Promise<string> {
  const systemPrompt = `You are a professional AI prompt engineer for image generators like Midjourney and Flux.
Your job is to translate the user's image description (which may be in Arabic, Hebrew, or English) into English, and expand it into a detailed, creative, high-quality, descriptive prompt.
Add sensory details, artistic style, camera shots, lighting, and rich imagery.
Return ONLY the final expanded English prompt. DO NOT include any introductions, preambles, explanations, quotes, markdown formatting, or "Here is your prompt".
Make it highly visual, cinematic, and professional.`;

  console.log(`[IMAGE-GEN] Translating and expanding prompt: "${userRequest}"`);

  // Try Groq first
  let expanded = await callDirectGroq(systemPrompt, userRequest);

  // Try Claude if Groq fails or is not set
  if (!expanded) {
    console.log('[IMAGE-GEN] Falling back to Claude for prompt expansion...');
    expanded = await callDirectClaude(systemPrompt, userRequest);
  }

  if (expanded) {
    console.log(`[IMAGE-GEN] Expanded Prompt: "${expanded}"`);
    return expanded;
  }

  // Fallback to raw request if both LLMs fail
  console.warn('[IMAGE-GEN] LLM prompt expansion failed, using raw request');
  return userRequest;
}

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  model?: string;
  seed?: number;
}

export interface ImageGenerationResult {
  success: boolean;
  filePath?: string;
  expandedPrompt?: string;
  error?: string;
}

/**
 * Generates an image using Pollinations.ai (Flux model) and saves it to a temp file
 */
export async function generateImage(
  userRequest: string,
  options: ImageGenerationOptions = {}
): Promise<ImageGenerationResult> {
  try {
    // 1. Expand prompt to get highly detailed image description
    const expandedPrompt = await expandPrompt(userRequest);

    // 2. Build Pollinations.ai Image API URL
    // Default model on pollinations is Flux, nologo=true removes watermark
    const width = options.width || 1024;
    const height = options.height || 1024;
    const model = options.model || 'flux';
    const seed = options.seed || Math.floor(Math.random() * 1000000);
    const encodedPrompt = encodeURIComponent(expandedPrompt);

    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&nologo=true&seed=${seed}`;

    console.log(`[IMAGE-GEN] Generating image via: ${imageUrl}`);

    // 3. Fetch/download the image
    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch generated image: status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Save to a unique temp file
    const tempDir = path.join(os.tmpdir(), 'whatsapp-images');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const filename = `generated_image_${timestamp}_${randomSuffix}.jpg`;
    const filePath = path.join(tempDir, filename);

    fs.writeFileSync(filePath, buffer);
    console.log(`[IMAGE-GEN] Image saved to: ${filePath} (${buffer.length} bytes)`);

    return {
      success: true,
      filePath,
      expandedPrompt
    };
  } catch (error) {
    console.error('[IMAGE-GEN] Failed to generate image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during image generation'
    };
  }
}
