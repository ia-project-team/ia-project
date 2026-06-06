import type { UIMessage } from "ai";

import { streamChat } from "@/server/llm/chat";

export const runtime = "nodejs";

interface ChatRequestBody {
  messages?: UIMessage[];
}

export async function POST(request: Request): Promise<Response> {
  let body: ChatRequestBody;
  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const messages = body.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json(
      { error: "`messages` must be a non-empty array" },
      { status: 400 },
    );
  }

  try {
    return await streamChat({ messages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
