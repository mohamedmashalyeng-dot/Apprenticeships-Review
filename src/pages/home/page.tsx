import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import CalloutBanner from "./components/CalloutBanner";
import AllProvidersSection from "./components/AllProvidersSection";
import AboutSection from "./components/AboutSection";
import RecentReviewsSection from "./components/RecentReviewsSection";
import StatsBar from "./components/StatsBar";
import BottomCTA from "./components/BottomCTA";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AnimateOnScroll from "@/components/feature/AnimateOnScroll";

/* ───────── Marketing Competitors ───────── */
const marketingCompetitors = [
  {
    id: "kent-business-college",
    name: "Kent Business College",
    initials: "KBC",
    programme: "Marketing & Project Management Apprenticeships",
    rating: 4.8,
    reviews: 312,
    logoUrl: "https://kentbusinesscollege.com/wp-content/uploads/2025/12/Kent-Business-College-e1768393206822.png",
    brandColor: "#7C3AED",
  },
  {
    id: "oxford-professional",
    name: "Oxford Professional Education Group",
    initials: "OP",
    programme: "Marketing & Management Apprenticeships",
    rating: 4.5,
    reviews: 187,
    logoUrl: "https://www.oxfordprofessionaleducation.com/wp-content/uploads/2023/05/Oxford-Professional-Education-Logo.png",
    brandColor: "#B45309",
  },
  {
    id: "cambridge-marketing-college",
    name: "Cambridge Marketing College",
    initials: "CM",
    programme: "Marketing Apprenticeships (L3–L6)",
    rating: 4.6,
    reviews: 245,
    logoUrl: "https://www.marketingcollege.com/assets/front/img/marketing-college-twitter-card.png",
    brandColor: "#059669",
  },
  {
    id: "cambridge-professional-academy",
    name: "Cambridge Professional Academy",
    initials: "CA",
    programme: "Marketing & Leadership Apprenticeships",
    rating: 4.3,
    reviews: 156,
    logoUrl: "https://cpawebsiteimages.blob.core.windows.net/publicimages/SVGs/Webp%20Files/Our%20Team/icon.webp",
    brandColor: "#0F766E",
  },
  {
    id: "sccu",
    name: "SCCU",
    initials: "SC",
    programme: "Digital & Creative Apprenticeships",
    rating: 4.1,
    reviews: 89,
    logoUrl: "https://sccugroup.com/wp-content/uploads/2023/02/SCCU-Group_Dark.png",
    brandColor: "#6E3380",
  },
  {
    id: "fareport",
    name: "Fareport Training",
    initials: "FT",
    programme: "Business & Management Apprenticeships",
    rating: 4.0,
    reviews: 167,
    logoUrl: "https://www.fareport.co.uk/wp-content/uploads/2024/11/Fareport-Logo-Colour-RGB-2.png",
    brandColor: "#DC2626",
  },
  {
    id: "jga-group",
    name: "The JGA Group",
    initials: "JG",
    programme: "Business & Digital Apprenticeships",
    rating: 4.2,
    reviews: 203,
    logoUrl: "https://www.jga-group.com/wp-content/uploads/New-Menu-Logo.png",
    brandColor: "#BE185D",
  },
];

/* ───────── Project Management & Controls Competitors ───────── */
const pmCompetitors = [
  {
    id: "kent-business-college",
    name: "Kent Business College",
    initials: "KBC",
    programme: "Marketing & Project Management Apprenticeships",
    rating: 4.8,
    reviews: 312,
    logoUrl: "https://kentbusinesscollege.com/wp-content/uploads/2025/12/Kent-Business-College-e1768393206822.png",
    brandColor: "#7C3AED",
  },
  {
    id: "oxford-professional",
    name: "Oxford Professional Education Group",
    initials: "OP",
    programme: "Marketing & Management Apprenticeships",
    rating: 4.5,
    reviews: 187,
    logoUrl: "https://www.oxfordprofessionaleducation.com/wp-content/uploads/2023/05/Oxford-Professional-Education-Logo.png",
    brandColor: "#B45309",
  },
  {
    id: "london-met",
    name: "London Metropolitan College",
    initials: "LM",
    programme: "Project Management Apprenticeships",
    rating: 4.3,
    reviews: 134,
    logoUrl: "https://www.londonmetropolitan.college/assets/logo.png",
    brandColor: "#36348E",
  },
  {
    id: "fareport",
    name: "Fareport Training",
    initials: "FT",
    programme: "Business & Management Apprenticeships",
    rating: 4.0,
    reviews: 167,
    logoUrl: "https://www.fareport.co.uk/wp-content/uploads/2024/11/Fareport-Logo-Colour-RGB-2.png",
    brandColor: "#DC2626",
  },
  {
    id: "university-cumbria",
    name: "University of Cumbria",
    initials: "UC",
    programme: "Degree & Higher Apprenticeships",
    rating: 4.4,
    reviews: 278,
    logoUrl: "https://www.cumbria.ac.uk/media/builder/blocks/header-logo.webp",
    brandColor: "#0891B2",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* 1. Hero — instant load with slight fade */}
      <AnimateOnScroll delay={100} duration={700} threshold={0}>
        <HeroSection />
      </AnimateOnScroll>

      {/* 2. Categories */}
      <AnimateOnScroll delay={150} duration={650}>
        <CategorySection />
      </AnimateOnScroll>

      {/* 3. Callout banner */}
      <AnimateOnScroll delay={120} duration={600}>
        <CalloutBanner />
      </AnimateOnScroll>

      {/* 4. Selected Competitors — organized by track */}
      <AnimateOnScroll delay={150} duration={650}>
        <AllProvidersSection
          title="Apprenticeship Providers"
          subtitle="Compare providers across Marketing and Project Management & Controls — explore ratings, reviews, and programme details to find the right fit."
          tracks={[
            {
              label: "Marketing Track",
              icon: "ri-bar-chart-grouped-line",
              providers: marketingCompetitors,
            },
            {
              label: "Project Management & Controls",
              icon: "ri-kanban-view",
              providers: pmCompetitors,
            },
          ]}
          viewAllHref="/compare"
        />
      </AnimateOnScroll>

      {/* 5. Why section */}
      <AnimateOnScroll delay={150} duration={650}>
        <AboutSection />
      </AnimateOnScroll>

      {/* 6. Recent reviews */}
      <AnimateOnScroll delay={150} duration={650}>
        <RecentReviewsSection />
      </AnimateOnScroll>

      {/* 7. Stats bar */}
      <AnimateOnScroll delay={120} duration={600}>
        <StatsBar />
      </AnimateOnScroll>

      {/* 8. Bottom CTA */}
      <AnimateOnScroll delay={120} duration={600}>
        <BottomCTA />
      </AnimateOnScroll>

      <Footer />
    </div>
  );
}