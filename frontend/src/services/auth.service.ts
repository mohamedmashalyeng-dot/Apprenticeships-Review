import { api, ensureCsrfCookie } from "@/lib/api/client";

export async function requestPasswordReset(email: string): Promise<void> {
  await ensureCsrfCookie();
  await api.post("/auth/password-reset/", { email });
}

export async function confirmPasswordReset(uid: string, token: string, password: string): Promise<void> {
  await ensureCsrfCookie();
  await api.post("/auth/password-reset-confirm/", { uid, token, password });
}
