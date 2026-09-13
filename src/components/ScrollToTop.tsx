import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router doesn't reset scroll position on navigation like a traditional
// multi-page site — without this, moving to a new page keeps whatever scroll
// offset the previous page was left at instead of starting at the top/hero.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
