import { LOGAN_SYSTEM_PROMPT, LOGAN_FREE_CHAT_PROMPT } from '../prompts/logan';
import { getBotPersonality } from '../supabase';

// Groq API (Primary)
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL_PRIMARY = 'llama-3.3-70b-versatile'; // Primary, extremely powerful LLaMA 3.3 70B
const GROQ_MODEL_FALLBACK = 'llama-3.1-8b-instant'; // Fallback, extremely fast LLaMA 3.1 8B
const GROQ_MODEL_LARGE_CTX = 'gemma2-9b-it'; // Fallback Gemma 2 9B model

// Rough token estimation: ~4 chars per token
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Truncate a prompt to fit within a token budget (leaves room for system prompt + response)
function truncatePrompt(prompt: string, maxTokens: number = 1500): string {
  const estimated = estimateTokens(prompt);
  if (estimated <= maxTokens) return prompt;

  // Trim from the middle (keep beginning context + current message at end)
  const targetChars = maxTokens * 4;
  const keepStart = Math.floor(targetChars * 0.3);
  const keepEnd = Math.floor(targetChars * 0.7);
  const startPart = prompt.slice(0, keepStart);
  const endPart = prompt.slice(prompt.length - keepEnd);
  console.log(`[LOGAN] Prompt truncated: ${estimated} → ~${estimateTokens(startPart + endPart)} tokens`);
  return startPart + '\n...\n[سياق محذوف لتجنز حد الطول]\n...\n' + endPart;
}

// Claude API (Fallback)
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

/**
 * Call Claude API with system prompt
 */
async function callClaudeWithPrompt(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string
): Promise<{ success: boolean; content: string | null; error?: string }> {
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
        max_tokens: 2000,
        temperature: 0.75
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, content: null, error: `API error ${response.status}: ${errorText}` };
    }

    const data = await response.json() as ClaudeResponse;

    if (!data.content || data.content.length === 0) {
      return { success: false, content: null, error: 'No content in response' };
    }

    const textContent = data.content.find(c => c.type === 'text');
    if (!textContent?.text) {
      return { success: false, content: null, error: 'No text content in response' };
    }

    // Sanitize response: remove CJK characters that the model might hallucinate
    let content = textContent.text;
    content = content.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]/g, '').trim();

    return { success: true, content };
  } catch (error) {
    return { success: false, content: null, error: String(error) };
  }
}

async function callGroqWithModel(
  apiKey: string,
  messages: GroqMessage[],
  model: string
): Promise<{ success: boolean; content: string | null; error?: string }> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
        temperature: 0.75,
        top_p: 0.95
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { success: false, content: null, error: `API error ${response.status}: ${errorText}` };
    }

    const data = await response.json() as GroqResponse;

    if (!data.choices || data.choices.length === 0) {
      return { success: false, content: null, error: 'No choices in response' };
    }

    // Sanitize response: remove CJK characters that the model might hallucinate
    let content = data.choices[0].message.content;
    // Remove Chinese/Japanese/Korean characters (keep Hebrew, English, numbers, punctuation, emojis)
    content = content.replace(/[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F\uFF00-\uFFEF]/g, '').trim();

    return { success: true, content };
  } catch (error) {
    return { success: false, content: null, error: String(error) };
  }
}

export async function callGroq(userPrompt: string, useFreeChatPrompt: boolean = false): Promise<string | null> {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  // Check if global free chat mode is enabled
  // Make check robust: trim whitespace, case-insensitive
  const envValue = (process.env.LOGAN_FREE_CHAT_MODE || '').trim().toLowerCase();
  const globalFreeChatMode = envValue === 'true';

  // IMPORTANT: Global free chat mode OVERRIDES everything
  const shouldUseFreeChatPrompt = globalFreeChatMode || useFreeChatPrompt;

  // DEBUG: Always log which prompt is being used
  console.log(`[LOGAN] ========================================`);
  console.log(`[LOGAN] LOGAN_FREE_CHAT_MODE = "${process.env.LOGAN_FREE_CHAT_MODE}" → parsed: "${envValue}"`);
  console.log(`[LOGAN] globalFreeChatMode = ${globalFreeChatMode}, useFreeChatPrompt param = ${useFreeChatPrompt}`);
  console.log(`[LOGAN] FINAL: shouldUseFreeChatPrompt = ${shouldUseFreeChatPrompt}`);

  let systemPrompt = shouldUseFreeChatPrompt ? LOGAN_FREE_CHAT_PROMPT : LOGAN_SYSTEM_PROMPT;

  // Retrieve active personality from Database
  const activePersonality = await getBotPersonality();
  console.log(`[LOGAN] Loaded active AI personality: ${activePersonality}`);

  if (activePersonality === 'philosopher') {
    systemPrompt += `\n\n[PERSONALITY MODE: Wise Philosopher (فيلسوف حكيم)]\n- Respond in elegant classical Arabic (اللغة العربية الفصحى الفاخرة).\n- Incorporate deep philosophical reflections, poetry, and wisdom.\n- Be thoughtful, calm, poetic, and analytical. Use philosophical metaphors.`;
  } else if (activePersonality === 'developer') {
    systemPrompt += `\n\n[PERSONALITY MODE: Elite Software Architect & Senior Developer (كبير مهندسي البرمجيات)]
- You are a world-class Software Architect, Principal Engineer, and competitive programmer.
- When asked about code, software engineering, or technical problems:
  1. Analyze the logic, potential edge cases, time/space complexity (Big O), security flaws (SQL injection, XSS, memory leaks), and concurrency issues deeply.
  2. Provide absolute state-of-the-art clean, highly optimized, and production-ready code blocks. Always include proper syntax highlighting, comments explaining complex logic, and structured types (TypeScript/Python/Go/C++).
  3. Suggest design patterns (e.g. Singleton, Factory, Observer, Dependency Injection) and architectural practices that make the code highly scaleable, clean, and testable.
  4. Write detailed explanations but stay extremely technical and professional. Speak like an elite senior developer who treats coding as a beautiful, logical art.
  5. Incorporate humorous developer banter (e.g., jokes about git merge conflicts, missing semicolons, compiler warnings, legacy code, or coffee dependency).`;
  } else if (activePersonality === 'sarcastic') {
    systemPrompt += `\n\n[PERSONALITY MODE: Witty & Sarcastic (ساخر كوميدي)]\n- Respond with witty humor, friendly sarcasm, and funny lighthearted roasts.\n- Never be boring or robotic. Write fun, punchy, conversational replies full of smart jokes.\n- Feel free to mock questions sarcastically but keep it light and extremely engaging.`;
  } else if (activePersonality === 'serious') {
    systemPrompt += `\n\n[PERSONALITY MODE: Serious & Formal (جاد ومحقق)]\n- Speak like an authoritative executive, detective, or formal scientist.\n- Use highly formal, direct, and precise language. Avoid emojis completely.\n- Be objective, brief, factual, and strictly professional.`;
  }

  // Log which prompt is being used with clear indication
  if (shouldUseFreeChatPrompt) {
    const reason = globalFreeChatMode ? 'GLOBAL env override' : 'free chat group';
    console.log(`[LOGAN] ✓✓✓ USING FREE CHAT PROMPT (${reason})`);
  } else {
    console.log(`[LOGAN] ✗✗✗ WARNING: Using RESTRICTED prompt!`);
  }
  console.log(`[LOGAN] ========================================`);

  // Truncate prompt if too large to avoid 413 errors (keep system prompt intact)
  const safeUserPrompt = truncatePrompt(userPrompt, 1500);
  if (safeUserPrompt !== userPrompt) {
    console.log(`[LOGAN] Prompt was truncated to fit token limit`);
  }

  // Suffix instruction to prevent model from repeating user queries, hallucinating dialog turns,
  // or using conversation prefixes like "ميدو:" or "Medo AI:".
  const finalUserPrompt = `${safeUserPrompt}\n\n[REMINDER: Respond ONLY as Medo AI (ميدو). Do NOT include dialogue prefixes like "Medo AI:", "ميدو:", "Assistant:", or "User:". Do NOT repeat the question or generate conversation turns for other users. Reply naturally, directly, and elegantly to the CURRENT MESSAGE above in a structured, model format.]`;

  const messages: GroqMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: finalUserPrompt }
  ];

  // Try Groq first (Primary) - faster and cheaper
  if (groqApiKey) {
    console.log(`[LOGAN] Trying primary: Groq (${GROQ_MODEL_PRIMARY})`);
    const primaryResult = await callGroqWithModel(groqApiKey, messages, GROQ_MODEL_PRIMARY);

    if (primaryResult.success && primaryResult.content) {
      console.log(`[LOGAN] Groq primary succeeded`);
      return primaryResult.content;
    }

    console.log(`[LOGAN] Groq primary failed: ${primaryResult.error}`);
    console.log(`[LOGAN] Trying Groq secondary model: ${GROQ_MODEL_FALLBACK}`);

    // Try Groq secondary model
    const secondaryResult = await callGroqWithModel(groqApiKey, messages, GROQ_MODEL_FALLBACK);

    if (secondaryResult.success && secondaryResult.content) {
      console.log(`[LOGAN] Groq secondary succeeded`);
      return secondaryResult.content;
    }

    console.log(`[LOGAN] Groq secondary failed: ${secondaryResult.error}`);

    // Try Groq large-context model (llama-3.3-70b) - higher TPM, last Groq resort
    console.log(`[LOGAN] Trying Groq large-ctx model: ${GROQ_MODEL_LARGE_CTX}`);
    const largeCtxResult = await callGroqWithModel(groqApiKey, messages, GROQ_MODEL_LARGE_CTX);

    if (largeCtxResult.success && largeCtxResult.content) {
      console.log(`[LOGAN] Groq large-ctx succeeded`);
      return largeCtxResult.content;
    }

    console.log(`[LOGAN] Groq large-ctx failed: ${largeCtxResult.error}`);
  } else {
    console.log(`[LOGAN] GROQ_API_KEY not configured, skipping Groq`);
  }

  // Fallback to Claude
  if (!claudeApiKey) {
    console.error('[LOGAN] ANTHROPIC_API_KEY not configured, no fallback available');
    return null;
  }

  console.log(`[LOGAN] Trying fallback: Claude (${CLAUDE_MODEL})`);
  const claudeResult = await callClaudeWithPrompt(claudeApiKey, systemPrompt, userPrompt);

  if (claudeResult.success && claudeResult.content) {
    console.log(`[LOGAN] Claude fallback succeeded`);
    return claudeResult.content;
  }

  console.error(`[LOGAN] All models failed. Last error: ${claudeResult.error}`);
  return null;
}

export function buildMentionPrompt(
  groupMessages: Array<{ senderName: string; body: string }>,
  userMessages: Array<{ body: string }>,
  senderName: string,
  currentMessage: string,
  webSearchContext?: string
): string {
  const messageCount = groupMessages.length;
  const groupContext = groupMessages
    .map(m => `${m.senderName}: ${m.body}`)
    .join('\n');

  const userHistory = userMessages
    .map(m => m.body)
    .join('\n');

  // Get current date/time in Jerusalem timezone for accurate responses
  const jerusalemDate = new Date().toLocaleDateString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const jerusalemTime = new Date().toLocaleTimeString('he-IL', {
    timeZone: 'Asia/Jerusalem',
    hour: '2-digit',
    minute: '2-digit'
  });

  // --- Smart Intent Detection ---
  const msg = currentMessage.toLowerCase();

  // Detect mood/emotion
  const isAngry = /غاضب|زعلان|مزعوج|محبط|ضايق|بكره|ما احب|مش تمام|حظ سيئ|!{2,}|wtf|damn|ugh|frustrated|angry/i.test(currentMessage);
  const isSad = /حزين|تعبان|زهقت|مللت|ما في فايدة|يأس|وحيد|😢|😞|😔|☹️|sad|tired|lonely|depressed/i.test(currentMessage);
  const isExcited = /رائع|ممتاز|وووو|يييي|🔥|🚀|amazing|awesome|excited|can't wait|love it|❤️|😍|🎉/i.test(currentMessage);
  const isConfused = /مش فاهم|ما فهمت|ازاي|كيف بالضبط|وضح|اشرح|confused|how exactly|what do you mean|can you explain/i.test(currentMessage);

  // Detect question type
  const isHowQuestion = /^(كيف|how|wie|كيف يمكن)/i.test(currentMessage.trim());
  const isWhyQuestion = /^(ليه|لماذا|why|ليش)/i.test(currentMessage.trim());
  const isWhatQuestion = /^(ايه|ما هو|what is|what are|ما هي)/i.test(currentMessage.trim());
  const isCompareQuestion = /مقارنة|الفرق بين|vs|versus|compare|better|أفضل|ايهما/i.test(currentMessage);
  const isListRequest = /اعطني|أعطني|قائمة|list|examples|أمثلة|enumerate|اذكر|خطوات|steps/i.test(currentMessage);
  const isDeepTopic = /ذكاء اصطناعي|ai |machine learning|تعلم الآلة|neural|blockchain|quantum|استراتيجي|تحليل|فلسفة|psychology|economics/i.test(currentMessage);

  // Build smart hints for the LLM
  let smartHints = '\n=== SMART RESPONSE HINTS ===\n';

  if (isAngry) smartHints += '⚠️ USER MOOD: Seems frustrated/angry. Acknowledge their frustration first, be direct and helpful, skip pleasantries.\n';
  if (isSad) smartHints += '💙 USER MOOD: Seems sad/tired. Be warm and empathetic, show genuine care before answering.\n';
  if (isExcited) smartHints += '⚡ USER MOOD: Excited/enthusiastic. Match their energy! Be lively and engaging.\n';
  if (isConfused) smartHints += '🧩 USER MOOD: Confused. Go step by step, use simple language, give a concrete example.\n';

  if (isHowQuestion) smartHints += '📋 FORMAT: HOW question → give numbered steps or a clear process.\n';
  if (isWhyQuestion) smartHints += '🔍 FORMAT: WHY question → give the core reason first, then supporting explanation.\n';
  if (isWhatQuestion) smartHints += '📖 FORMAT: WHAT question → define clearly, then give context/examples.\n';
  if (isCompareQuestion) smartHints += '⚖️ FORMAT: COMPARISON → use a structured pros/cons or side-by-side breakdown.\n';
  if (isListRequest) smartHints += '📝 FORMAT: LIST requested → use bullet points or numbered list.\n';
  if (isDeepTopic) smartHints += '🧠 FORMAT: DEEP TOPIC → think step by step (chain of thought), be thorough and analytical.\n';

  // Code detection
  const hasCode = /```|`[^`]+`|def |function |const |let |var |import |class |if \(|for \(|\bpython\b|\bjavascript\b|\btypescript\b|SELECT |FROM |WHERE /i.test(currentMessage);
  if (hasCode) smartHints += '💻 CODE DETECTED: Analyze the code. Identify what it does, find bugs, suggest improvements. Format your code blocks with proper ```language markers.\n';

  // Urgency detection
  const isUrgent = /مستعجل|urgent|asap|الآن|بسرعة|now|immediately|فوري|على طول|hurry/i.test(currentMessage);
  if (isUrgent) smartHints += '🚨 URGENT: Skip intro. First line = the solution/answer directly. Be concise and fast.\n';

  // User style detection based on message length and vocabulary
  const wordCount = currentMessage.split(/\s+/).length;
  const hasTechnicalVocab = /api|sdk|runtime|backend|frontend|deployment|docker|kubernetes|async|await|promise|callback|webhook/i.test(currentMessage);
  if (wordCount < 5) smartHints += '✂️ STYLE: Short message → keep response concise and punchy too.\n';
  if (wordCount > 30) smartHints += '📜 STYLE: Detailed message → respond with matching depth and detail.\n';
  if (hasTechnicalVocab) smartHints += '🔧 STYLE: Technical user → use precise technical language, don\'t over-explain basics.\n';

  // Conversation depth indicator
  if (messageCount >= 15) smartHints += `📚 CONTEXT: Rich conversation history (${messageCount} msgs) — use it! Reference previous context if relevant.\n`;

  if (!isAngry && !isSad && !isExcited && !isConfused && !isHowQuestion && !isWhyQuestion && !isWhatQuestion && !isCompareQuestion && !isListRequest && !isDeepTopic && !hasCode && !isUrgent) {
    smartHints += '💬 FORMAT: Casual message → respond naturally and conversationally.\n';
  }

  smartHints += '=== END HINTS ===\n';


  let prompt = `=== CURRENT DATE & TIME (Jerusalem, Israel) ===
${jerusalemDate}, ${jerusalemTime}

=== CONVERSATION CONTEXT (last ${messageCount} messages) ===
${groupContext}

=== ${senderName}'s recent messages (their style & history) ===
${userHistory || '(no previous messages)'}
${smartHints}
=== CURRENT MESSAGE from ${senderName} ===
${currentMessage}`;

  // Append web search results if available
  if (webSearchContext) {
    prompt += webSearchContext;
  }

  return prompt;
}

