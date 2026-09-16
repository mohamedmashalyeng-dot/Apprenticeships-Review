import { Link, useLocation } from "react-router-dom";
import Navbar from "@/components/feature/Navbar";
import Footer from "@/components/feature/Footer";

export default function NotFound() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background-50">
      <Navbar />
      <div className="relative flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <h1 className="absolute bottom-0 text-9xl md:text-[12rem] font-black text-foreground-100 select-none pointer-events-none z-0">
          404
        </h1>
        <div className="relative z-10">
          <h2 className="font-heading text-xl md:text-2xl font-bold text-foreground-950">Page not found</h2>
          <p className="mt-2 text-sm text-foreground-500 font-mono">{location.pathname}</p>
          <p className="mt-4 text-base text-foreground-600">
            The page you're looking for doesn't exist or may have moved.
          </p>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-primary-500 text-white text-sm font-semibold rounded-full hover:bg-primary-600 transition-colors whitespace-nowrap"
          >
            <i className="ri-home-line" />
            Back to home
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
