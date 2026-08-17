import { useRef } from "react";
import { theme } from "../theme/theme";

interface CardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function Card({ title, description, icon, onClick, className = "" }: CardProps) {
  const glowRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (glowRef.current) {
      glowRef.current.style.background = `radial-gradient(220px circle at ${x}% ${y}%, rgba(37,99,235,0.18), transparent 70%)`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      className={`group relative flex min-h-[180px] cursor-pointer flex-col justify-between overflow-hidden rounded-2xl border ${theme.border.default} bg-white p-5 text-left transition active:scale-[0.98] hover:border-blue-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${className}`}
    >
      <div
        ref={glowRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <div className="relative mt-4">
        <h3 className={`text-lg font-bold ${theme.text.primary}`}>{title}</h3>
        <p className={`mt-1 text-sm leading-snug ${theme.text.secondary}`}>
          {description}
        </p>
      </div>
    </div>
  );
}

export default Card;