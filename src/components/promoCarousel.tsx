import { useCallback, useEffect, useRef, useState } from "react";
import type { TouchEvent } from "react";

import { theme } from "../theme/theme";
import type { PlaceCategory } from "../types/placeCategory";

export interface CategorySlide {
  category: PlaceCategory;
  title: string;
  subtitle: string;
  spotCount: number;
  image?: string;
}

interface PromoCarouselProps {
  slides: CategorySlide[];
  onSlideClick: (slide: CategorySlide) => void;
  intervalMs?: number;
  className?: string;
}

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
  const active = count > 0 ? index % count : 0;

  const autoplay = count > 1 && !isPaused && !reduceMotion;

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;

      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (!autoplay) return;

    const id = window.setInterval(() => {
      setIndex((current) => ((current % count) + 1) % count);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [autoplay, count, intervalMs, index]);

  if (count === 0) {
    return null;
  }

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

    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      goTo(active + (delta < 0 ? 1 : -1));
    }
  };

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Browse parking by place"
      className={`${theme.carousel.frame} ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex touch-pan-y transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{
          transform: `translateX(-${active * 100}%)`,
        }}
      >
        {slides.map((slide) => (
          <div
            key={slide.category}
            className="w-full flex-shrink-0"
          >
            <button
              type="button"
              onClick={() => onSlideClick(slide)}
              className="relative block h-44 w-full overflow-hidden text-left focus:outline-none"
            >
              {/* Image */}
              {slide.image ? (
                <img
                  src={slide.image}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 bg-blue-600" />
              )}

              {/* Text readability gradient */}
              <span
                className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
                aria-hidden="true"
              />

              {/* Text */}
              <span className="absolute inset-x-4 bottom-4 block">
                <span className="block text-lg font-extrabold leading-snug text-white">
                  {slide.title}
                </span>

                <span className="mt-1 block text-sm font-medium text-white/85">
                  {slide.subtitle}
                </span>
              </span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PromoCarousel;