import { api } from "@/lib/api/client";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

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
}

export async function sendChatMessage(message: string, history: ChatTurn[]): Promise<ChatResponse> {
  return api.post<ChatResponse>("/chatbot/message/", { message, history });
}
