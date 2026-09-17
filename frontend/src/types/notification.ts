export type NotificationType =
  | "review_approved"
  | "review_rejected"
  | "review_response"
  | "claim_approved"
  | "claim_rejected"
  | "new_review_for_company";

export interface AppNotification {
  id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}
