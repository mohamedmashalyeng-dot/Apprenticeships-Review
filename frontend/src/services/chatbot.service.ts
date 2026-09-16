import { api } from "@/lib/api/client";

export interface ChatProvider {
  provider_id: string;
  name: string;
  location: string;
  provider_type: string;
  average_rating: number;
  total_reviews: number;
  strengths: string[];
  best_for: string[];
  standards_delivered: string[];
  description: string;
}

export interface ChatResponse {
  reply: string;
  providers: ChatProvider[];
  interactionId: string | null;
}

interface ChatMessageApiResponse {
  reply: string;
  providers: ChatProvider[];
  interaction_id: string | null;
}

/** The backend's AI provider (Gemini) keeps conversation state server-side — pass back
 *  whatever `interactionId` the previous call returned (or null for a fresh chat) instead
 *  of resending the whole transcript. */
export async function sendChatMessage(message: string, interactionId: string | null): Promise<ChatResponse> {
  const data = await api.post<ChatMessageApiResponse>("/chatbot/message/", {
    message,
    interaction_id: interactionId,
  });
  return { reply: data.reply, providers: data.providers, interactionId: data.interaction_id };
}
