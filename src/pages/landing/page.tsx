import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from "react";
import FloatingReviewsBackground from "@/pages/home/components/FloatingReviewsBackground";
import Home from "@/pages/home/page";

const CURTAIN_RELEASE_PROGRESS = 0.85;
const CURTAIN_SCROLL_GAIN = 1.15;
const CURTAIN_FOLLOW_TIME_MS = 110;
const MAX_CARRIED_HOME_SCROLL = 0.35;

export default function LandingPage() {
  const [dismissed, setDismissed] = useState(false);

  const curtainRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const inputProgress = useRef(0);
  const pendingHomeScroll = useRef(0);
  const dismissedRef = useRef(false);
  const rafRef = useRef<number | null>(null);
  const previousFrameTime = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const heightRef = useRef(0);

  const setCurtainPosition = useCallback((position: number) => {
    if (curtainRef.current) {
      curtainRef.current.style.transform = `translate3d(0, ${-position}px, 0)`;
    }
  }, []);

  const scrollHomeBy = useCallback((distance: number) => {
    if (distance <= 0) return;
    window.scrollBy({ top: distance, behavior: "instant" });
  }, []);

  const releaseCurtain = useCallback(() => {
    if (dismissedRef.current) return;

    dismissedRef.current = true;
    target.current = heightRef.current;
    document.body.style.overflow = "";
    setDismissed(true);

    const carriedScroll = Math.min(
      pendingHomeScroll.current,
      heightRef.current * MAX_CARRIED_HOME_SCROLL,
    );
    pendingHomeScroll.current = 0;
    scrollHomeBy(carriedScroll);
  }, [scrollHomeBy]);

  const animate = useCallback(
    (timestamp: number) => {
      const elapsed =
        previousFrameTime.current === null
          ? 1000 / 60
          : Math.min(timestamp - previousFrameTime.current, 64);
      previousFrameTime.current = timestamp;

      const follow = 1 - Math.exp(-elapsed / CURTAIN_FOLLOW_TIME_MS);
      current.current += (target.current - current.current) * follow;

      if (Math.abs(target.current - current.current) <= 0.5) {
        current.current = target.current;
      }

      setCurtainPosition(current.current);

      const height = heightRef.current;
      const releasePoint = height * CURTAIN_RELEASE_PROGRESS;
      if (
        !dismissedRef.current &&
        target.current >= releasePoint - 0.5 &&
        current.current >= releasePoint - 0.5
      ) {
        releaseCurtain();
      }

      if (Math.abs(target.current - current.current) > 0.5) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        current.current = target.current;
        setCurtainPosition(current.current);
        previousFrameTime.current = null;
        rafRef.current = null;
      }
    },
    [releaseCurtain, setCurtainPosition],
  );

  const startAnimation = useCallback(() => {
    if (rafRef.current !== null) return;
    previousFrameTime.current = null;
    rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const push = useCallback(
    (delta: number) => {
      if (!Number.isFinite(delta) || delta === 0) return;

      if (dismissedRef.current) {
        // An active touch gesture stays bound to its original element. Keep that
        // same gesture moving Home after the curtain hands control over.
        if (delta > 0 && touchStartY.current !== null) {
          scrollHomeBy(delta);
        }
        return;
      }

      const height = heightRef.current || window.innerHeight;
      const releaseDistance = height * CURTAIN_RELEASE_PROGRESS;
      let scaledDelta = delta * CURTAIN_SCROLL_GAIN;

      if (scaledDelta > 0) {
        const remainingCurtainDistance = Math.max(
          0,
          releaseDistance - inputProgress.current,
        );
        const curtainDelta = Math.min(scaledDelta, remainingCurtainDistance);

        inputProgress.current += curtainDelta;
        scaledDelta -= curtainDelta;
        pendingHomeScroll.current += scaledDelta / CURTAIN_SCROLL_GAIN;
      } else {
        let upwardDistance = -scaledDelta;
        const pendingAsCurtainDistance = pendingHomeScroll.current * CURTAIN_SCROLL_GAIN;
        const cancelledPending = Math.min(upwardDistance, pendingAsCurtainDistance);

        pendingHomeScroll.current -= cancelledPending / CURTAIN_SCROLL_GAIN;
        upwardDistance -= cancelledPending;
        inputProgress.current = Math.max(0, inputProgress.current - upwardDistance);
      }

      target.current =
        inputProgress.current >= releaseDistance - 0.5
          ? height
          : inputProgress.current;
      startAnimation();
    },
    [scrollHomeBy, startAnimation],
  );

  // Track the viewport height and preserve the curtain's progress on resize.
  useEffect(() => {
    heightRef.current = window.innerHeight;

    const onResize = () => {
      const previousHeight = heightRef.current || window.innerHeight;
      const nextHeight = window.innerHeight;
      const scale = nextHeight / previousHeight;

      heightRef.current = nextHeight;
      current.current *= scale;
      target.current *= scale;
      inputProgress.current *= scale;
      setCurtainPosition(current.current);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setCurtainPosition]);

  // Keep Home still until most of the curtain has cleared the viewport.
  useEffect(() => {
    document.body.style.overflow = dismissed ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [dismissed]);

  // Bring the curtain back when scrolling up at the very top of Home.
  useEffect(() => {
    if (!dismissed) return;

    const onWheel = (event: WheelEvent) => {
      if (window.scrollY > 0 || event.deltaY >= 0) return;

      event.preventDefault();
      dismissedRef.current = false;
      pendingHomeScroll.current = 0;
      inputProgress.current = 0;
      target.current = 0;
      document.body.style.overflow = "hidden";
      setDismissed(false);
      startAnimation();
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [dismissed, startAnimation]);

  // Clean up any running animation frame on unmount.
  useEffect(() => {
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const normalizeWheelDelta = (event: ReactWheelEvent<HTMLDivElement>) => {
    if (event.deltaMode === 1) return event.deltaY * 16;
    if (event.deltaMode === 2) return event.deltaY * heightRef.current;
    return event.deltaY;
  };

  const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    push(normalizeWheelDelta(event));
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    touchStartY.current = event.touches[0].clientY;
  };

  const handleTouchMove = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (touchStartY.current === null) return;
    const y = event.touches[0].clientY;
    const delta = touchStartY.current - y;
    touchStartY.current = y;
    push(delta);
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
  };

  const revealHome = () => {
    if (dismissedRef.current) return;

    const height = heightRef.current || window.innerHeight;
    inputProgress.current = height * CURTAIN_RELEASE_PROGRESS;
    target.current = height;
    startAnimation();
  };

  return (
    <div>
      {/* Home content — stays still until the curtain is mostly out of view. */}
      <Home />

      {/* This stationary layer keeps receiving gestures while the curtain moves. */}
      <div
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        aria-hidden={dismissed}
        className={`fixed inset-0 z-50 ${dismissed ? "pointer-events-none" : "touch-none"}`}
      >
        {/* Only the visual curtain moves, so the gesture area never develops a dead zone. */}
        <div
          ref={curtainRef}
          className="absolute inset-0 bg-white will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {/* Floating customer reviews background */}
          <FloatingReviewsBackground />

          {/* Soft white vignette to keep edges clean and text legible */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/40 to-white pointer-events-none" />

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
            <div className="max-w-3xl mx-auto flex flex-col items-center px-8 py-10 md:px-14 md:py-14">
              {/* Logo */}
              <div className="w-14 h-14 rounded-xl bg-primary-500 flex items-center justify-center mb-8 shadow-lg shadow-primary-500/20">
                <i className="ri-star-fill text-white text-2xl" />
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4">
                <span className="text-foreground-950">Apprenticeships</span>
              </h1>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                <span className="text-primary-500">Reviews</span>
              </h1>

              {/* Description */}
              <p className="text-foreground-500 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                Compare UK apprenticeship providers using verified reviews, public data, and transparent scoring — all in one place.
              </p>

              {/* CTA Button */}
              <button
                onClick={revealHome}
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold text-base px-10 py-3.5 rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer whitespace-nowrap shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40"
              >
                LOOKING NOW
              </button>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 mt-12">
                <div className="flex items-center gap-2 text-foreground-500 text-sm">
                  <i className="ri-shield-check-line text-primary-500 text-base" />
                  <span>Verified reviews</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-500 text-sm">
                  <i className="ri-government-line text-primary-500 text-base" />
                  <span>Government data</span>
                </div>
                <div className="flex items-center gap-2 text-foreground-500 text-sm">
                  <i className="ri-bar-chart-box-line text-primary-500 text-base" />
                  <span>Transparent scoring</span>
                </div>
              </div>

              {/* Scroll hint */}
              <button
                onClick={revealHome}
                className="flex flex-col items-center mt-16 text-foreground-400 text-xs font-medium tracking-widest uppercase cursor-pointer transition-colors hover:text-foreground-600"
              >
                <span>Or scroll to explore</span>
                <i className="ri-arrow-down-line mt-2 animate-bounce text-sm" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
