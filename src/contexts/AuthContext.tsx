import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { api, ApiError, ensureCsrfCookie, getApiErrorMessage } from "@/lib/api/client";
import type { AuthUser } from "@/types/user";

interface RegisterInput {
  email: string;
  password: string;
  displayName?: string;
  pendingRole?: "company_owner";
}

interface ProfileUpdateInput {
  displayName?: string;
  avatarUrl?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdateInput) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await ensureCsrfCookie();
        const data = await api.get<{ user: AuthUser | null }>("/auth/me/");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  async function login(email: string, password: string) {
    await ensureCsrfCookie();
    const data = await api.post<AuthUser>("/auth/login/", { email, password });
    setUser(data);
    return data;
  }

  async function register(input: RegisterInput) {
    await ensureCsrfCookie();
    const data = await api.post<AuthUser>("/auth/register/", input);
    setUser(data);
    return data;
  }

  async function logout() {
    await api.post("/auth/logout/");
    setUser(null);
  }

  async function updateProfile(input: ProfileUpdateInput) {
    const data = await api.patch<AuthUser>("/auth/me/", input);
    setUser(data);
    return data;
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- standard context+hook pairing
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

export { ApiError, getApiErrorMessage };
