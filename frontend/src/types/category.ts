export interface ApprenticeshipCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  standard_ids: string[];
  accent: "primary" | "secondary" | "accent";
}
