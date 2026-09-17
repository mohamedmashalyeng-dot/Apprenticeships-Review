import { useState, useEffect } from "react";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";
import LoadingIndicator from "@/components/base/LoadingIndicator";
import StandardDetailLayout from "./StandardDetailLayout";
import { getStandardBySlug } from "@/services/standards.service";
import type { Standard } from "@/types/standard";

export default function StandardBySlugPage({ slug }: { slug: string }) {
  const [standard, setStandard] = useState<Standard | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getStandardBySlug(slug)
      .then(setStandard)
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="py-24">
          <LoadingIndicator />
        </div>
        <Footer />
      </div>
    );
  }

  if (!standard) {
    return (
      <div className="min-h-screen bg-background-50">
        <Navbar />
        <div className="py-24 text-center text-sm text-foreground-500">Standard not found.</div>
        <Footer />
      </div>
    );
  }

  return <StandardDetailLayout standard={standard} />;
}
