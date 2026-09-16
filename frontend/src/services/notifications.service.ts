import { api } from "@/lib/api/client";
import type { AppNotification } from "@/types/notification";

export async function getNotifications(): Promise<AppNotification[]> {
  return api.get<AppNotification[]>("/notifications/");
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  return api.post<AppNotification>(`/notifications/${id}/mark-read/`);
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post("/notifications/mark-all-read/");
}
