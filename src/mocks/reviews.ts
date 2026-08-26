export interface Review {
  review_id: string;
  provider_id: string;
  standard_id: string;
  reviewer_type: "learner" | "employer";
  rating: number;
  review_title: string;
  review_text: string;
  verification_status: string;
  review_tags: string[];
  programme_studied?: string;
  employer_type?: string;
  would_recommend?: boolean;
  review_date: string;
}

export const learnerReviews: Review[] = [
  {
    review_id: "lr-001",
    provider_id: "kent-business-college",
    standard_id: "marketing-executive-level-4",
    reviewer_type: "learner",
    rating: 4,
    review_title: "Solid foundation in marketing practice",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Support", "Teaching", "Communication"],
    programme_studied: "Marketing Executive Level 4",
    would_recommend: true,
    review_date: "2026-03-15",
  },
  {
    review_id: "lr-002",
    provider_id: "cambridge-marketing-college",
    standard_id: "marketing-manager-level-6",
    reviewer_type: "learner",
    rating: 5,
    review_title: "Exceptional marketing training experience",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Teaching", "Support", "Communication", "Feedback"],
    programme_studied: "Marketing Manager Level 6",
    would_recommend: true,
    review_date: "2026-04-20",
  },
  {
    review_id: "lr-003",
    provider_id: "oxford-professional",
    standard_id: "marketing-manager-level-6",
    reviewer_type: "learner",
    rating: 4,
    review_title: "Professional and well-structured programme",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Teaching", "Support", "Workload"],
    programme_studied: "Marketing Manager Level 6",
    would_recommend: true,
    review_date: "2026-05-10",
  },
  {
    review_id: "lr-004",
    provider_id: "london-met",
    standard_id: "associate-project-manager-level-4",
    reviewer_type: "learner",
    rating: 4,
    review_title: "Great for project management career start",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Support", "Communication", "Feedback"],
    programme_studied: "Associate Project Manager Level 4",
    would_recommend: true,
    review_date: "2026-02-28",
  },
  {
    review_id: "lr-005",
    provider_id: "cambridge-professional-academy",
    standard_id: "marketing-executive-level-4",
    reviewer_type: "learner",
    rating: 4,
    review_title: "Supportive learning environment",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Support", "Teaching", "Workload"],
    programme_studied: "Marketing Executive Level 4",
    would_recommend: true,
    review_date: "2026-04-05",
  },
  {
    review_id: "lr-006",
    provider_id: "jga-group",
    standard_id: "associate-project-manager-level-4",
    reviewer_type: "learner",
    rating: 3,
    review_title: "Decent programme, room for improvement",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified learner reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how ratings, tags, and feedback categories will be displayed to help prospective learners make informed decisions.",
    verification_status: "Pending Verification",
    review_tags: ["Communication", "Workload", "Feedback"],
    programme_studied: "Associate Project Manager Level 4",
    would_recommend: false,
    review_date: "2026-03-30",
  },
];

export const employerReviews: Review[] = [
  {
    review_id: "er-001",
    provider_id: "kent-business-college",
    standard_id: "marketing-executive-level-4",
    reviewer_type: "employer",
    rating: 4,
    review_title: "Responsive and professional partner",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified employer reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how employer feedback categories will be displayed.",
    verification_status: "Pending Verification",
    review_tags: ["Communication", "Progress Reporting", "Learner Support"],
    employer_type: "SME - Retail Sector",
    would_recommend: true,
    review_date: "2026-04-10",
  },
  {
    review_id: "er-002",
    provider_id: "oxford-professional",
    standard_id: "marketing-manager-level-6",
    reviewer_type: "employer",
    rating: 5,
    review_title: "Excellent quality and learner outcomes",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified employer reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how employer feedback categories will be displayed.",
    verification_status: "Pending Verification",
    review_tags: ["Communication", "Progress Reporting", "Learner Support"],
    employer_type: "Large Corporate - Professional Services",
    would_recommend: true,
    review_date: "2026-05-15",
  },
  {
    review_id: "er-003",
    provider_id: "cambridge-marketing-college",
    standard_id: "marketing-manager-level-6",
    reviewer_type: "employer",
    rating: 4,
    review_title: "Strong marketing training partner",
    review_text: "This is a sample review used for demonstration purposes only. Actual verified employer reviews will appear here once sufficient data has been collected and verified. The review structure demonstrates how employer feedback categories will be displayed.",
    verification_status: "Pending Verification",
    review_tags: ["Communication", "Learner Support"],
    employer_type: "Large Corporate - FMCG",
    would_recommend: true,
    review_date: "2026-03-25",
  },
];

export function getProviderReviews(providerId: string): { learner: Review[]; employer: Review[] } {
  return {
    learner: learnerReviews.filter((r) => r.provider_id === providerId),
    employer: employerReviews.filter((r) => r.provider_id === providerId),
  };
}

export function getStandardReviews(standardId: string): { learner: Review[]; employer: Review[] } {
  return {
    learner: learnerReviews.filter((r) => r.standard_id === standardId),
    employer: employerReviews.filter((r) => r.standard_id === standardId),
  };
}