import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import { getApiErrorMessage } from "@/contexts/AuthContext";
import { confirmPasswordReset } from "@/services/auth.service";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const uid = searchParams.get("uid") ?? "";
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await confirmPasswordReset(uid, token, password);
      setDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-md">
          <div className="p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl">
            <h1 className="font-heading text-xl font-bold text-foreground-950 mb-1">Set a new password</h1>

            {!uid || !token ? (
              <p className="text-sm text-foreground-600 leading-relaxed mt-4">
                This reset link is missing or invalid. Please request a new one from the{" "}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                  login page
                </Link>
                .
              </p>
            ) : done ? (
              <>
                <p className="text-sm text-foreground-600 leading-relaxed mt-4 mb-6">
                  Your password has been reset.
                </p>
                <Link
                  to="/login"
                  className="btn btn-lg btn-primary w-full"
                >
                  Log in
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-foreground-500 mb-6">Choose a new password for your account.</p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      New password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground-700 mb-1.5">
                      Confirm new password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </div>

                  {error && <p className="text-xs text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-lg btn-primary w-full"
                  >
                    {isSubmitting ? "Saving…" : "Reset password"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
