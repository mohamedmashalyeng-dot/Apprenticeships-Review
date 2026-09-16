import { lazy, Suspense, useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import { getApiErrorMessage } from "@/lib/api/client";
import { sendChatMessage, type ChatProvider } from "@/services/chatbot.service";

// three.js (~600KB) has no business loading on every page for every visitor just because
// the chat button sits in App.tsx — split it into its own chunk that only fetches once the
// button actually renders, with the old icon glyph shown until it's ready.
const RobotMascotIcon = lazy(() => import("@/components/feature/RobotMascotIcon"));

interface DisplayMessage {
  role: "user" | "assistant";
  content: string;
  providers?: ChatProvider[];
  isError?: boolean;
}

const GREETING: DisplayMessage = {
  role: "assistant",
  content: "Hi! Tell me what kind of apprenticeship you're after — subject, level, or location — and I'll suggest providers from our reviews.",
};

function ProviderResultCard({ provider }: { provider: ChatProvider }) {
  return (
    <Link
      to={`/provider/${provider.provider_id}`}
      className="block rounded-xl border border-background-200 bg-background-50 p-3 transition-colors hover:border-primary-400"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-semibold text-foreground-900">{provider.name}</span>
        {provider.total_reviews > 0 && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-foreground-600">
            <StarRating rating={provider.average_rating} size="sm" />
            {provider.average_rating.toFixed(1)}
          </span>
        )}
      </div>
      {provider.location && <p className="mt-0.5 text-xs text-foreground-500">{provider.location}</p>}
    </Link>
  );
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isSending]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isSending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsSending(true);
    try {
      const res = await sendChatMessage(text, interactionId);
      setInteractionId(res.interactionId);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply, providers: res.providers }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: getApiErrorMessage(err, "Sorry, something went wrong. Please try again."), isError: true },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-background-200 bg-background-50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-background-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <i className="ri-robot-2-line text-lg text-primary-600" />
              <span className="text-sm font-semibold text-foreground-900">Find a provider</span>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700 cursor-pointer"
            >
              <i className="ri-close-line text-lg" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] space-y-2 ${m.role === "user" ? "" : "w-full"}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary-600 text-white"
                        : m.isError
                          ? "bg-red-50 text-red-700"
                          : "bg-background-100 text-foreground-800"
                    }`}
                  >
                    {m.content}
                  </div>
                  {m.providers && m.providers.length > 0 && (
                    <div className="space-y-2">
                      {m.providers.map((p) => (
                        <ProviderResultCard key={p.provider_id} provider={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-background-100 px-3.5 py-2 text-sm text-foreground-500">Thinking…</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-background-200 p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Software apprenticeships in London"
              maxLength={2000}
              disabled={isSending}
              className="min-w-0 flex-1 rounded-full border border-background-200 bg-background-50 px-3.5 py-2 text-sm text-foreground-900 outline-none focus:border-primary-400 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              aria-label="Send"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-600 text-white disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <i className="ri-send-plane-fill text-sm" />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="relative flex h-28 w-28 items-center justify-center transition-transform hover:scale-105 cursor-pointer"
      >
        <Suspense fallback={<i className="text-4xl text-primary-600 ri-chat-3-line" />}>
          <RobotMascotIcon />
        </Suspense>
      </button>
    </div>
  );
}
