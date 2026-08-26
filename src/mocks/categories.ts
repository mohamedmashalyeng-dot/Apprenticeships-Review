export interface ApprenticeshipCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  standard_ids: string[];
  accent: "primary" | "secondary" | "accent";
}

export const categories: ApprenticeshipCategory[] = [
  {
    id: "business-administration",
    name: "Business & Administration",
    icon: "ri-briefcase-line",
    description: "Office support, business process, and administrative apprenticeships that keep organisations running smoothly.",
    standard_ids: ["business-administrator-level-3"],
    accent: "primary",
  },
  {
    id: "digital-it",
    name: "Digital & IT",
    icon: "ri-code-s-slash-line",
    description: "Digital marketing, software, and technology apprenticeships for the modern workplace.",
    standard_ids: ["digital-marketer-level-3"],
    accent: "secondary",
  },
  {
    id: "construction",
    name: "Construction",
    icon: "ri-building-2-line",
    description: "Building, civils, and trade apprenticeships across the construction sector.",
    standard_ids: [],
    accent: "accent",
  },
  {
    id: "engineering",
    name: "Engineering",
    icon: "ri-tools-line",
    description: "Engineering and manufacturing apprenticeships from craft to professional level.",
    standard_ids: [],
    accent: "primary",
  },
  {
    id: "health-social-care",
    name: "Health & Social Care",
    icon: "ri-heart-pulse-line",
    description: "Care and health apprenticeships supporting the NHS, care homes, and community services.",
    standard_ids: [],
    accent: "secondary",
  },
  {
    id: "leadership-management",
    name: "Leadership & Management",
    icon: "ri-team-line",
    description: "Management, leadership, and project delivery apprenticeships for developing managers.",
    standard_ids: ["operations-manager-level-5", "associate-project-manager-level-4", "project-controls-professional-level-6"],
    accent: "accent",
  },
  {
    id: "accounting-finance",
    name: "Accounting & Finance",
    icon: "ri-calculator-line",
    description: "Accountancy and finance apprenticeships leading to professional qualifications.",
    standard_ids: [],
    accent: "primary",
  },
  {
    id: "customer-service",
    name: "Customer Service",
    icon: "ri-customer-service-2-line",
    description: "Customer service and contact-centre apprenticeships for client-facing roles.",
    standard_ids: [],
    accent: "secondary",
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    icon: "ri-megaphone-line",
    description: "Marketing, communications, and sales apprenticeships from Level 3 to degree level.",
    standard_ids: ["marketing-executive-level-4", "marketing-manager-level-6", "digital-marketer-level-3"],
    accent: "accent",
  },
];