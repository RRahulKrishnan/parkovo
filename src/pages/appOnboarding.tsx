import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BanknoteArrowUp,
  CarFront,
  TrainFront,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import Button from "../components/button";
import { theme } from "../theme/theme";

interface Slide {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string; // served from /public/onboarding
  alt: string;
  panel: string; // image panel background / fallback tint
}

const SLIDES: Slide[] = [
  {
    icon: BanknoteArrowUp,
    title: "Earn from your parking",
    description:
      "Turn an unused driveway or parking bay into flexible income.",
    image: "assets/ONBD/onbd_img_1.png",
    alt: "An empty driveway that can be rented out",
    panel:
      "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600",
  },
  {
    icon: CarFront,
    title: "Find spaces around the city",
    description:
      "Discover convenient parking whenever and wherever you need it.",
    image: "assets/ONBD/onbd_img_2.png",
    alt: "A car parked in a city street space",
    panel: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600",
  },
  {
    icon: CarFront,
    title: "Park close to where you're going",
    description:
      "Find convenient parking near malls, airports, events, offices, and more.",
    image: "assets/ONBD/onbd_img_3.png",
    alt: "A car parked near a busy city destination",
    panel:
      "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600",
  }
];

// Shows the image; if the file is missing, falls back to a large icon
// on a soft gradient so the screen never looks broken.
function SlideImage({ slide }: { slide: Slide }) {
  const [failed, setFailed] = useState(false);
  const Icon = slide.icon;

  return (
    <div
      className={`relative flex h-full min-h-[260px] w-full items-center justify-center overflow-hidden rounded-[2rem] shadow-lg shadow-black/5 ring-1 ring-black/5 ${slide.panel}`}
    >
      {failed ? (
        <>
          {/* decorative circles */}
          <span className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/50" />
          <span className="absolute -bottom-12 -right-8 h-48 w-48 rounded-full bg-white/40" />

          <Icon className="relative h-24 w-24" strokeWidth={1.5} />
        </>
      ) : (
        <>
          <img
            src={slide.image}
            alt={slide.alt}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
            onError={() => setFailed(true)}
          />

          {/* subtle bottom fade so the image blends into the page */}
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/10 to-transparent" />
        </>
      )}
    </div>
  );
}

function AppOnboarding() {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const isLast = index === SLIDES.length - 1;

  const goTo = (i: number) => {
    const el = trackRef.current;

    if (!el) return;

    el.scrollTo({
      left: i * el.clientWidth,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    const el = trackRef.current;

    if (!el) return;

    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  };

  const handleNext = () => {
    if (isLast) {
      navigate("/role");
    } else {
      goTo(index + 1);
    }
  };

  return (
    <main
      className={`flex min-h-screen flex-col ${theme.surface.page} ${theme.text.primary}`}
    >

      {/* Slides */}
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex flex-1 snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((slide) => (
          <section
            key={slide.title}
            className="flex w-full shrink-0 snap-center flex-col px-6 pb-4 pt-2"
          >
            {/* Title and description — top-left icon removed */}
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight">
              {slide.title}
            </h1>

            <p
              className={`mt-3 max-w-sm text-base leading-relaxed ${theme.text.secondary}`}
            >
              {slide.description}
            </p>

            {/* Image */}
            <div className="mt-8 flex-1">
              <SlideImage slide={slide} />
            </div>
          </section>
        ))}
      </div>

      {/* Footer */}
      <footer className="px-6 pb-10 pt-4">
        {/* Slide indicators */}
        <div
          className="mb-6 flex justify-center gap-2"
          role="tablist"
          aria-label="Onboarding slides"
        >
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === index ? "w-8 bg-blue-600" : "w-2 bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* Next / Continue button */}
        <Button type="button" onClick={handleNext}>
          <span>
            {isLast ? "Choose how you’ll use ParkingO" : "Next"}
          </span>

          <ArrowRight className="h-4 w-4" />
        </Button>
      </footer>
    </main>
  );
}

export default AppOnboarding;
