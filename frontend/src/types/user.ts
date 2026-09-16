export type UserRole = "user" | "company_owner" | "moderator" | "admin";

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  managedCompanyId: string | null;
  managedCompanySlug: string | null;
  displayName: string;
  avatarUrl: string;
}
