import { streamText, convertToModelMessages } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { allTools, sourceTools } from '@/lib/ai/tools';

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// All tools including source tools — source tools are always available,
// they just return "no sources" when none are attached.
const tools = { ...allTools, ...sourceTools };

export async function POST(req: Request) {
  const { messages, system } = await req.json();

  // Convert UIMessages (with parts) to ModelMessages (with content) for streamText
  const modelMessages = await convertToModelMessages(messages);

  const result = streamText({
    model: openrouter('anthropic/claude-sonnet-4'),
    system,
    messages: modelMessages,
    tools,
  });

  return result.toUIMessageStreamResponse();
}
