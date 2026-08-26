import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

type Mode = "login" | "register";
type Role = "apprentice" | "provider";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<Role>("apprentice");
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Demo navigation — real authentication will be connected in a later step.
    navigate(role === "apprentice" ? "/dashboard" : "/provider-dashboard");
  };

  return (
    <div className="min-h-screen bg-background-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="p-6 md:p-8 bg-background-50 border border-background-200/70 rounded-2xl">
            {/* Mode toggle */}
            <div className="flex p-1 bg-background-100 rounded-full mb-6">
              <button
                onClick={() => setMode("login")}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  mode === "login" ? "bg-background-50 text-foreground-900" : "text-foreground-500"
                }`}
              >
                Log in
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-2 text-sm font-semibold rounded-full transition-colors cursor-pointer whitespace-nowrap ${
                  mode === "register" ? "bg-background-50 text-foreground-900" : "text-foreground-500"
                }`}
              >
                Create account
              </button>
            </div>

            <h1 className="font-heading text-xl font-bold text-foreground-950 mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-foreground-500 mb-6">
              {mode === "login" ? "Log in to manage your reviews and account." : "Join the apprenticeship review community."}
            </p>

            {/* Role selection */}
            <div className="flex gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("apprentice")}
                className={`flex-1 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === "apprentice" ? "border-primary-400 bg-primary-50/50" : "border-background-200/70 bg-background-100 hover:border-background-300"
                }`}
              >
                <i className={`ri-graduation-cap-line text-xl ${role === "apprentice" ? "text-primary-600" : "text-foreground-400"}`} />
                <p className="text-sm font-semibold text-foreground-900 mt-2">Apprentice</p>
                <p className="text-xs text-foreground-500 mt-0.5">Leave and manage reviews</p>
              </button>
              <button
                type="button"
                onClick={() => setRole("provider")}
                className={`flex-1 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                  role === "provider" ? "border-primary-400 bg-primary-50/50" : "border-background-200/70 bg-background-100 hover:border-background-300"
                }`}
              >
                <i className={`ri-building-4-line text-xl ${role === "provider" ? "text-primary-600" : "text-foreground-400"}`} />
                <p className="text-sm font-semibold text-foreground-900 mt-2">Provider</p>
                <p className="text-xs text-foreground-500 mt-0.5">Manage your profile</p>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "register" && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground-700 mb-1.5">
                    {role === "apprentice" ? "Full name" : "Contact name"}
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    placeholder={role === "apprentice" ? "e.g. Sophie Carter" : "e.g. Sarah Thompson"}
                    className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  {role === "provider" ? "Work email" : "Email address"}
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder={role === "provider" ? "name@organisation.com" : "you@example.com"}
                  className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground-700 mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background-100 border border-background-200/70 rounded-lg text-sm text-foreground-900 placeholder:text-foreground-400 focus:outline-none focus:border-primary-400 transition-colors"
                />
              </div>

              {mode === "login" && (
                <div className="flex justify-end">
                  <button type="button" className="text-xs text-primary-600 hover:text-primary-700 cursor-pointer">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors cursor-pointer whitespace-nowrap"
              >
                {mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            {/* Demo note */}
            <p className="mt-4 text-xs text-foreground-400 text-center leading-relaxed">
              Demo preview — authentication will be connected in a later step.
            </p>
          </div>

          {/* Bottom link */}
          <p className="mt-6 text-center text-sm text-foreground-500">
            {mode === "login" ? "New to ApprenticeshipsReviews?" : "Already have an account?"}{" "}
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-primary-600 hover:text-primary-700 font-medium cursor-pointer"
            >
              {mode === "login" ? "Create an account" : "Log in"}
            </button>
          </p>
          <p className="mt-3 text-center text-sm text-foreground-500">
            Are you a training provider?{" "}
            <Link to="/claim-provider" className="text-primary-600 hover:text-primary-700 font-medium">
              Claim your profile
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}