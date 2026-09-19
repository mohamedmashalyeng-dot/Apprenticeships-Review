import { useEffect, useState } from "react";
import HeroSection from "./components/HeroSection";
import CategorySection from "./components/CategorySection";
import CalloutBanner from "./components/CalloutBanner";
import AllProvidersSection from "./components/AllProvidersSection";
import AboutSection from "./components/AboutSection";
import RecentReviewsSection from "./components/RecentReviewsSection";
import CompetitorsSection from "./components/CompetitorsSection";
import BottomCTA from "./components/BottomCTA";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import AnimateOnScroll from "@/components/feature/AnimateOnScroll";
import { getCompanies } from "@/services/companies.service";
import type { Provider } from "@/types/provider";

interface MiniProvider {
  id: string;
  name: string;
  initials: string;
  programme: string;
  rating: number;
  reviews: number;
  logoUrl?: string;
  website?: string;
  brandColor: string;
}

interface TrackDef {
  label: string;
  icon: string;
  categoryId: string;
  programme: string;
}

const TRACKS: TrackDef[] = [
  {
    label: "Marketing apprenticeship providers",
    icon: "ri-bar-chart-grouped-line",
    categoryId: "sales-marketing",
    programme: "Marketing apprenticeship provider",
  },
  {
    label: "Project management and project controls providers",
    icon: "ri-kanban-view",
    categoryId: "leadership-management",
    programme: "Project management and project controls provider",
  },
];

const BRAND_COLORS = ["#7C3AED", "#B45309", "#059669", "#0F766E", "#6E3380", "#DC2626", "#0891B2", "#BE185D"];

function toMiniProvider(p: Provider, programme: string, colorIndex: number): MiniProvider {
  return {
    id: p.provider_id,
    name: p.trading_name,
    initials: p.trading_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase(),
    programme,
    rating: p.average_rating,
    reviews: p.total_reviews,
    logoUrl: p.logoUrl,
    website: p.website,
    brandColor: BRAND_COLORS[colorIndex % BRAND_COLORS.length],
  };
}

export default function Home() {
  const [tracks, setTracks] = useState<{ label: string; icon: string; providers: MiniProvider[] }[]>([]);

  // Sections load one at a time instead of all firing their fetches together on mount —
  // each stage's data-fetching section only starts once the previous one has settled.
  const [stage, setStage] = useState(1);

  useEffect(() => {
    if (stage !== 2) return;
    Promise.all(
      TRACKS.map((track) =>
        getCompanies({ categoryId: track.categoryId, sortBy: "reviews" }).then((companies) => ({
          track,
          companies: companies.slice(0, 6),
        }))
      )
    )
      .then((results) => {
        setTracks(
          results.map(({ track, companies }) => ({
            label: track.label,
            icon: track.icon,
            providers: companies.map((c, idx) => toMiniProvider(c, track.programme, idx)),
          }))
        );
      })
      .finally(() => setStage(3));
  }, [stage]);

  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />

      {/* 1. Hero — instant load with slight fade */}
      <AnimateOnScroll delay={100} duration={700} threshold={0}>
        <HeroSection onReady={() => setStage((s) => Math.max(s, 2))} />
      </AnimateOnScroll>

      {/* 2. Categories */}
      <AnimateOnScroll delay={150} duration={650}>
        <CategorySection />
      </AnimateOnScroll>

      {/* 3. Callout banner */}
      <AnimateOnScroll delay={120} duration={600}>
        <CalloutBanner />
      </AnimateOnScroll>

      {/* 4. Selected providers — organized by track */}
      {tracks.some((t) => t.providers.length > 0) && (
        <AnimateOnScroll delay={150} duration={650}>
          <AllProvidersSection
            title="Explore apprenticeship training providers"
            subtitle="Browse providers in our directory and compare their available apprenticeship programmes, review information and published provider data."
            tracks={tracks.filter((t) => t.providers.length > 0)}
            viewAllHref="/compare"
          />
        </AnimateOnScroll>
      )}

      {/* 5. Why section */}
      <AnimateOnScroll delay={150} duration={650}>
        <AboutSection />
      </AnimateOnScroll>

      {/* 6. Recent reviews */}
      <AnimateOnScroll delay={150} duration={650}>
        <RecentReviewsSection active={stage >= 3} onReady={() => setStage((s) => Math.max(s, 4))} />
      </AnimateOnScroll>

      {/* 7. Provider intelligence */}
      <AnimateOnScroll delay={150} duration={650}>
        <CompetitorsSection active={stage >= 4} />
      </AnimateOnScroll>

      {/* 8. Bottom CTA */}
      <AnimateOnScroll delay={120} duration={600}>
        <BottomCTA />
      </AnimateOnScroll>

      <Footer />
    </div>
  );
}
