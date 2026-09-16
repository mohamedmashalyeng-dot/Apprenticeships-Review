import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

export default function PlaceholderPage({ title, description }: { title: string; description?: string }) {
  return (
    <div className="min-h-screen bg-background-50">
      <Navbar />
      <div className="w-full px-4 md:px-6 lg:px-8 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground-950">{title}</h1>
          {description && (
            <p className="mt-4 text-foreground-600 text-sm md:text-base">{description}</p>
          )}
          <div className="mt-10 p-8 bg-background-100 rounded-xl">
            <p className="text-sm text-foreground-500">
              This page is being built. Full content coming in the next phase.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}