import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import StarRating from "@/components/base/StarRating";
import { getApiErrorMessage } from "@/lib/api/client";
import { sendChatMessage, type ChatProvider } from "@/services/chatbot.service";

const BOT_IMAGE_URL = "https://jokdxsdbxorzciulkdyl.supabase.co/storage/v1/object/public/images/0026483606334415a725302d8abec5f9.png";

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

const QUICK_PROMPTS = [
  "Find top-rated employers",
  "How do apprenticeships work?",
  "Show me reviews",
  "Help me choose a programme",
];

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
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<DisplayMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open, isSending]);

  const sendMessage = async (text: string) => {
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await sendMessage(input.trim());
  };

  const showChat = open && started;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {showChat && (
        <div className="flex h-[32rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-background-200 bg-background-50 shadow-2xl">
          <div className="flex items-center justify-between border-b border-background-200 px-4 py-3">
            <div className="flex items-center gap-2">
              <i className="ri-robot-2-line text-lg text-primary-600" />
              <span className="text-sm font-semibold text-foreground-900">Find a provider</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                setStarted(false);
              }}
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
                <div className="flex items-center gap-2 rounded-2xl bg-background-100 px-3 py-2 text-sm text-foreground-500">
                  <img src={BOT_IMAGE_URL} alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
                  <span>Thinking…</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-background-200 px-4 py-3">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void sendMessage(prompt)}
                disabled={isSending}
                className="rounded-xl border border-[#9ecaff] bg-white px-3 py-2 text-left text-xs font-medium leading-tight text-[#0563d8] transition-colors hover:border-[#4d9cff] hover:bg-[#f2f8ff] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
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

      {open && !showChat && (
        <div className="relative flex w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col items-center rounded-[1.75rem] border border-white/20 bg-[#f5f0eb] p-5 text-center shadow-2xl">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat introduction"
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-foreground-500 transition hover:bg-white/70 hover:text-foreground-900"
          >
            <i className="ri-close-line text-lg" />
          </button>

          <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#f5f2ee] shadow-[0_10px_30px_rgba(13,29,50,0.12)]">
            <img src={BOT_IMAGE_URL} alt="Apprenticeships Reviews AI assistant" className="h-full w-full object-contain" />
          </div>

          <h3 className="text-3xl font-black leading-tight text-[#111827]">Need help?<br />I'm here for you!</h3>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-foreground-600">
            Ask anything about apprenticeships, reviews, employers, or career advice.
          </p>

          <button
            type="button"
            onClick={() => {
              setStarted(true);
              setOpen(true);
            }}
            className="mt-5 w-full rounded-xl bg-[#0d63ff] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-[#0d63ff]/20 transition hover:bg-[#1b71ff]"
          >
            Start a chat
          </button>

          <div className="mt-6 w-full space-y-3 text-left text-sm text-foreground-700">
            {[
              "Get instant answers",
              "Find real reviews",
              "Discover new opportunities",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg bg-white/60 px-3 py-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#e4f5eb] text-[10px] text-[#1d7a46]">
                  <i className="ri-check-line" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <span className="rounded-2xl border border-[#dfe7ef] bg-white px-3.5 py-2 text-center text-xs font-semibold leading-tight text-[#0d1d32] shadow-[0_8px_20px_rgba(13,29,50,0.14)]">
          Need help?<br />Ask our AI!
        </span>
        <button
          type="button"
          onClick={() => {
            if (!started) {
              setOpen(true);
              return;
            }
            if (open) {
              setOpen(false);
              setStarted(false);
              return;
            }
            setOpen((v) => !v);
          }}
          aria-label={open ? "Close chat" : "Open chat"}
          className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#0d1d32] shadow-[0_18px_40px_rgba(13,29,50,0.35)] transition-transform hover:scale-105"
        >
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#ff4d4f] text-[8px] font-bold text-white">AI</span>
          <img src={BOT_IMAGE_URL} alt="Open AI assistant" className="h-9 w-9 object-contain" />
        </button>
      </div>
    </div>
  );
}
