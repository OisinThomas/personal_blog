import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const { action, text, context, language } = await req.json();

  if (!action || !text) {
    return Response.json({ error: 'Missing action or text' }, { status: 400 });
  }

  const prompts: Record<string, string> = {
    rewrite: `Rewrite the following text while preserving its meaning. Keep the same tone and style. Return only the rewritten text, nothing else.\n\n${text}`,
    expand: `Expand the following text with more detail and depth. Keep the same tone and style. Return only the expanded text, nothing else.\n\n${text}`,
    simplify: `Simplify the following text to make it clearer and easier to understand. Return only the simplified text, nothing else.\n\n${text}`,
    fix_grammar: `Fix any grammar, spelling, or punctuation errors in the following text. Return only the corrected text, nothing else.\n\n${text}`,
    concise: `Make the following text more concise while preserving its meaning. Return only the concise version, nothing else.\n\n${text}`,
    formalize: `Rewrite the following text in a more formal tone. Return only the rewritten text, nothing else.\n\n${text}`,
    casualize: `Rewrite the following text in a more casual, conversational tone. Return only the rewritten text, nothing else.\n\n${text}`,
    translate_ga: `Translate the following text into Irish (Gaeilge). Return only the translation, nothing else.\n\n${text}`,
    translate_en: `Translate the following text into English. Return only the translation, nothing else.\n\n${text}`,
  };

  const prompt = prompts[action];
  if (!prompt) {
    return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
  }

  const systemPrompt = context
    ? `You are a writing assistant for a blog post. Context about the article: ${context}. The article language is ${language || 'en'}.`
    : `You are a writing assistant. The text language is ${language || 'en'}.`;

  const { text: result } = await generateText({
    model: openrouter('anthropic/claude-sonnet-4'),
    system: systemPrompt,
    prompt,
  });

  return Response.json({ result });
}
