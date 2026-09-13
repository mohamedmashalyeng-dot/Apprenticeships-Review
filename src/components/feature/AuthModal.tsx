import { useState, type FormEvent } from "react";
import { useAuth, getApiErrorMessage } from "@/contexts/AuthContext";

type Mode = "login" | "register";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register({ email, password, displayName: name });
      }
      onSuccess();
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal card */}
      <div className="relative w-full max-w-md bg-background-50 border border-background-200/70 rounded-2xl p-6 md:p-8">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full text-foreground-400 hover:bg-background-100 hover:text-foreground-700 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-lg" />
        </button>

        {/* Mode toggle */}
        <div className="flex p-1 bg-background-100 rounded-full mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              mode === "login" ? "bg-background-50 text-foreground-900" : "text-foreground-500"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
              mode === "register" ? "bg-background-50 text-foreground-900" : "text-foreground-500"
            }`}
          >
            Create account
          </button>
        </div>

        <h2 className="font-heading text-xl font-bold text-foreground-950">
          {mode === "login" ? "Almost there!" : "Join the community"}
        </h2>
        <p className="text-sm text-foreground-500 mt-1 mb-6">
          {mode === "login"
            ? "Log in to publish your review. Your work is saved — nothing will be lost."
            : "Create a free account to publish your review."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "register" && (
            <div>
              <label htmlFor="auth-name" className="block text-sm font-medium text-foreground-700 mb-1.5">
                Full name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sophie Carter"
                className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
              />
            </div>
          )}

          <div>
            <label htmlFor="auth-email" className="block text-sm font-medium text-foreground-700 mb-1.5">
              Email address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="block text-sm font-medium text-foreground-700 mb-1.5">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60"
          >
            {isSubmitting ? "Please wait…" : mode === "login" ? "Log in & publish" : "Create account & publish"}
          </button>
        </form>

        <p className="mt-4 text-xs text-foreground-400 text-center">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
          >
            {mode === "login" ? "Create account" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}
