export interface RatingCategory {
  key: string;
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
}

export const ratingCategories: RatingCategory[] = [
  { key: "overall_experience", label: "Overall Experience", shortLabel: "Overall", icon: "ri-star-line", description: "Your overall view of the apprenticeship." },
  { key: "tutor_support", label: "Tutor / Trainer Support", shortLabel: "Tutor Support", icon: "ri-user-star-line", description: "Quality and responsiveness of tutors and trainers." },
  { key: "training_quality", label: "Quality of Training", shortLabel: "Training Quality", icon: "ri-book-open-line", description: "How well the training was delivered and structured." },
  { key: "communication", label: "Communication", shortLabel: "Communication", icon: "ri-chat-3-line", description: "Clarity and frequency of communication." },
  { key: "learning_resources", label: "Learning Resources", shortLabel: "Resources", icon: "ri-stack-line", description: "Quality of materials, platforms, and tools." },
  { key: "employer_support", label: "Employer Support", shortLabel: "Employer Support", icon: "ri-building-2-line", description: "Support given to you and your employer." },
  { key: "epa_preparation", label: "EPA Preparation", shortLabel: "EPA Prep", icon: "ri-medal-line", description: "Preparation for the end-point assessment." },
];

export interface ProviderRating {
  provider_id: string;
  overall: number;
  review_count: number;
  recommendation_percent: number;
  categories: Record<string, number>;
  distribution: Record<number, number>;
}

export const providerRatings: ProviderRating[] = [
  {
    provider_id: "kent-business-college",
    overall: 4.6,
    review_count: 18,
    recommendation_percent: 92,
    categories: { overall_experience: 4.6, tutor_support: 4.8, training_quality: 4.7, communication: 4.5, learning_resources: 4.4, employer_support: 4.6, epa_preparation: 4.5 },
    distribution: { 5: 12, 4: 5, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "oxford-professional",
    overall: 4.4,
    review_count: 14,
    recommendation_percent: 88,
    categories: { overall_experience: 4.4, tutor_support: 4.5, training_quality: 4.6, communication: 4.3, learning_resources: 4.5, employer_support: 4.2, epa_preparation: 4.4 },
    distribution: { 5: 9, 4: 4, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "cambridge-marketing-college",
    overall: 4.5,
    review_count: 16,
    recommendation_percent: 90,
    categories: { overall_experience: 4.5, tutor_support: 4.6, training_quality: 4.5, communication: 4.4, learning_resources: 4.3, employer_support: 4.4, epa_preparation: 4.6 },
    distribution: { 5: 11, 4: 4, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "cambridge-professional-academy",
    overall: 4.2,
    review_count: 11,
    recommendation_percent: 82,
    categories: { overall_experience: 4.2, tutor_support: 4.3, training_quality: 4.1, communication: 4.2, learning_resources: 4.0, employer_support: 4.1, epa_preparation: 4.2 },
    distribution: { 5: 6, 4: 4, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "london-met",
    overall: 4.1,
    review_count: 9,
    recommendation_percent: 78,
    categories: { overall_experience: 4.1, tutor_support: 4.0, training_quality: 4.2, communication: 4.0, learning_resources: 4.1, employer_support: 3.9, epa_preparation: 4.0 },
    distribution: { 5: 5, 4: 3, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "jga-group",
    overall: 4.0,
    review_count: 13,
    recommendation_percent: 75,
    categories: { overall_experience: 4.0, tutor_support: 4.1, training_quality: 3.9, communication: 3.8, learning_resources: 3.9, employer_support: 4.0, epa_preparation: 3.9 },
    distribution: { 5: 6, 4: 4, 3: 2, 2: 1, 1: 0 },
  },
  {
    provider_id: "sccu",
    overall: 4.1,
    review_count: 6,
    recommendation_percent: 80,
    categories: { overall_experience: 4.1, tutor_support: 4.0, training_quality: 4.2, communication: 4.1, learning_resources: 4.3, employer_support: 3.9, epa_preparation: 4.0 },
    distribution: { 5: 3, 4: 2, 3: 1, 2: 0, 1: 0 },
  },
  {
    provider_id: "university-cumbria",
    overall: 4.4,
    review_count: 20,
    recommendation_percent: 89,
    categories: { overall_experience: 4.4, tutor_support: 4.5, training_quality: 4.4, communication: 4.3, learning_resources: 4.5, employer_support: 4.4, epa_preparation: 4.3 },
    distribution: { 5: 12, 4: 6, 3: 2, 2: 0, 1: 0 },
  },
  {
    provider_id: "fareport",
    overall: 4.0,
    review_count: 15,
    recommendation_percent: 74,
    categories: { overall_experience: 4.0, tutor_support: 4.1, training_quality: 3.9, communication: 4.0, learning_resources: 3.8, employer_support: 4.0, epa_preparation: 3.9 },
    distribution: { 5: 7, 4: 5, 3: 2, 2: 1, 1: 0 },
  },
];

export function getProviderRating(providerId: string): ProviderRating | undefined {
  return providerRatings.find((r) => r.provider_id === providerId);
}

export interface ProviderResponse {
  review_id: string;
  provider_id: string;
  responder: string;
  role: string;
  date: string;
  text: string;
}

export const providerResponses: ProviderResponse[] = [
  {
    review_id: "lr-001",
    provider_id: "kent-business-college",
    responder: "Sarah Thompson",
    role: "Head of Learner Experience, Kent Business College",
    date: "2026-03-18",
    text: "Thank you for your kind feedback. We're delighted you found the marketing foundations valuable, and we'll keep working to strengthen our communication channels throughout the programme.",
  },
  {
    review_id: "lr-002",
    provider_id: "cambridge-marketing-college",
    responder: "David Miller",
    role: "Programme Director, Cambridge Marketing College",
    date: "2026-04-22",
    text: "Thank you for sharing your experience. It means a lot to our team that the training made a real difference to your development. We wish you every success in your marketing career.",
  },
  {
    review_id: "er-002",
    provider_id: "oxford-professional",
    responder: "Rachel Green",
    role: "Client Partnerships Manager, Oxford Professional Education Group",
    date: "2026-05-16",
    text: "Thank you for the positive feedback on learner outcomes. We value our partnership and look forward to supporting your next cohort.",
  },
];

export function getProviderResponse(reviewId: string): ProviderResponse | undefined {
  return providerResponses.find((r) => r.review_id === reviewId);
}