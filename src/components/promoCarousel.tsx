import { useCallback, useEffect, useRef, useState } from "react";
import type { KeyboardEvent, TouchEvent } from "react";
import {
  Train,
  ShoppingBag,
  Ticket,
  Plane,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

import { theme } from "../theme/theme";
import type { PlaceCategory } from "../types/placeCategory";

export interface CategorySlide {
  category: PlaceCategory;
  title: string;
  subtitle: string;
  spotCount: number;
}

interface PromoCarouselProps {
  slides: CategorySlide[];
  onSlideClick: (slide: CategorySlide) => void;
  intervalMs?: number;
  className?: string;
}

const CATEGORY_ICONS: Record<PlaceCategory, LucideIcon> = {
  metro: Train,
  mall: ShoppingBag,
  events: Ticket,
  airport: Plane,
  hospital: HeartPulse,
};

const SWIPE_THRESHOLD_PX = 40;

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function PromoCarousel({
  slides,
  onSlideClick,
  intervalMs = 4500,
  className = "",
}: PromoCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion] = useState(prefersReducedMotion);
  const touchStartX = useRef<number | null>(null);

  const count = slides.length;
  // Slides can come and go when filters change, so never trust raw `index`.
  const active = count > 0 ? index % count : 0;
  const autoplay = count > 1 && !isPaused && !reduceMotion;

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  );

  // `index` is a dependency so a manual change restarts the timer.
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(
      () => setIndex((i) => ((i % count) + 1) % count),
      intervalMs
    );
    return () => window.clearInterval(id);
  }, [autoplay, count, intervalMs, index]);

  if (count === 0) return null;

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    setIsPaused(false);
    if (start === null) return;
    const delta = e.changedTouches[0].clientX - start;
    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) goTo(active + (delta < 0 ? 1 : -1));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") goTo(active + 1);
    if (e.key === "ArrowLeft") goTo(active - 1);
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Browse parking by place"
      className={`${theme.carousel.frame} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
    >
      <div
        aria-live={autoplay ? "off" : "polite"}
        className="flex touch-pan-y transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${active * 100}%)` }}
      >
        {slides.map((slide, i) => {
          const Icon = CATEGORY_ICONS[slide.category];
          return (
            <div
              key={slide.category}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={i !== active}
              className="w-full flex-shrink-0"
            >
              <button
                type="button"
                tabIndex={i === active ? 0 : -1}
                onClick={() => onSlideClick(slide)}
                className={`${theme.carousel.slide} ${theme.carousel.focus}`}
              >
                <Icon
                  aria-hidden="true"
                  className={`absolute -bottom-3 -right-3 h-32 w-32 ${theme.carousel.watermark}`}
                />

                <span
                  className={`absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl ${theme.carousel.iconTile}`}
                >
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>

                <span
                  className={`absolute right-4 top-4 rounded-full px-2.5 py-1 text-[11px] font-bold ${theme.carousel.count}`}
                >
                  {slide.spotCount} {slide.spotCount === 1 ? "spot" : "spots"}
                </span>

                {/* pr-24 keeps the text clear of the dots */}
                <span className="absolute inset-x-4 bottom-4 block pr-24">
                  <span className="block text-lg font-extrabold leading-snug">
                    {slide.title}
                  </span>
                  <span
                    className={`mt-0.5 block text-sm font-medium ${theme.carousel.subtitle}`}
                  >
                    {slide.subtitle}
                  </span>
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="absolute bottom-3 right-3 flex items-center">
          {slides.map((slide, i) => (
            <button
              key={slide.category}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === active}
              onClick={() => goTo(i)}
              className="p-1.5"
            >
              <span
                className={`block h-1.5 rounded-full transition-all ${
                  i === active ? theme.carousel.dotActive : theme.carousel.dotIdle
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

export default PromoCarousel;