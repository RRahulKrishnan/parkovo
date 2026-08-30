import { useRef, useState } from "react";
import { theme } from "../theme/theme";

interface TermsScrollGateProps {
  onAccept: (accepted: boolean) => void;
}

const SCROLL_THRESHOLD_PX = 8;

function TermsScrollGate({ onAccept }: TermsScrollGateProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [reachedEnd, setReachedEnd] = useState(false);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom <= SCROLL_THRESHOLD_PX && !reachedEnd) {
      setReachedEnd(true);
      onAccept(true);
    }
  };

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className={`text-sm font-medium ${theme.text.primary}`}>
          Terms & Privacy Policy
        </span>
        {reachedEnd && (
          <span className="text-xs font-medium text-emerald-600">Read ✓</span>
        )}
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={`h-32 overflow-y-auto rounded-lg border ${theme.border.default} p-3 text-xs leading-relaxed ${theme.text.secondary}`}
        >
          <p className="mb-3 font-semibold text-slate-700">Terms of Service</p>
          <p className="mb-3">
            By creating a ParkingO account you agree to use the platform only
            to list, discover, or book real parking spots, to provide
            accurate listing and vehicle information, and to honor bookings
            you confirm. Hosts are responsible for the legality and safety of
            spaces they list; drivers are responsible for parking within the
            space and time booked.
          </p>
          <p className="mb-3">
            We may suspend accounts that submit false listings, misuse
            payment methods, or compromise other users' safety. Fees, payout
            timing, and cancellation windows are shown at checkout and may
            change with notice posted in-app.
          </p>
          <p className="mb-3 font-semibold text-slate-700">Privacy Policy</p>
          <p className="mb-3">
            We collect the phone number, email, and vehicle details you
            provide, plus approximate location while you use search or
            navigation features, to operate bookings and prevent fraud. Phone
            numbers are verified via SMS one-time codes and are never shown
            publicly.
          </p>
          <p>
            We don't sell your personal data. We share only what's needed
            with payment processors and, when a booking is active, with the
            other party to that booking. You can request account deletion at
            any time from Settings.
          </p>
        </div>
        {!reachedEnd && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 rounded-b-lg bg-gradient-to-t from-white to-transparent" />
        )}
      </div>

      {!reachedEnd && (
        <p className={`mt-1.5 text-xs ${theme.text.muted}`}>
          Scroll to the bottom to continue
        </p>
      )}
    </div>
  );
}

export default TermsScrollGate;