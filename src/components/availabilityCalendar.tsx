import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { theme } from "../theme/theme";

interface AvailabilityCalendarProps {
  startDate: string; // ISO "yyyy-mm-dd"
  endDate: string; // ISO "yyyy-mm-dd", ignored while isOngoing
  isOngoing: boolean;
  onChangeRange: (startDate: string, endDate: string) => void;
  onChangeOngoing: (isOngoing: boolean) => void;
  error?: string;
}

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function buildMonthGrid(monthCursor: Date): (Date | null)[] {
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDay.getDay(); i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  return cells;
}

function AvailabilityCalendar({
  startDate,
  endDate,
  isOngoing,
  onChangeRange,
  onChangeOngoing,
  error,
}: AvailabilityCalendarProps) {
  const [monthCursor, setMonthCursor] = useState(() => {
    const base = startDate ? new Date(startDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });

  const today = startOfToday();
  const cells = buildMonthGrid(monthCursor);

  const handleDayClick = (date: Date) => {
    if (date < today) return;
    const clickedISO = toISODate(date);

    // No start yet, or a full range already chosen -> begin a new selection.
    if (!startDate || (startDate && endDate)) {
      onChangeRange(clickedISO, "");
      return;
    }

    // We have a start but no end.
    if (clickedISO < startDate) {
      onChangeRange(clickedISO, "");
    } else {
      onChangeRange(startDate, clickedISO);
    }
  };

  const isInRange = (iso: string) =>
    Boolean(startDate && endDate && iso >= startDate && iso <= endDate);

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between rounded-lg border px-4 py-3 border-slate-300">
        <span>
          <span className={`block text-sm font-semibold ${theme.text.primary}`}>
            Host indefinitely
          </span>
          <span className={`block text-xs ${theme.text.muted}`}>
            Stay listed until you turn it off
          </span>
        </span>
        <input
          type="checkbox"
          checked={isOngoing}
          onChange={(e) => onChangeOngoing(e.target.checked)}
          className="h-5 w-5 accent-blue-600"
        />
      </label>

      <div className={isOngoing ? "opacity-50 pointer-events-none" : ""}>
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className={`text-sm font-semibold ${theme.text.primary}`}>
            {monthCursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button
            type="button"
            onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-slate-100"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-1 text-center">
          {WEEKDAY_LABELS.map((label, i) => (
            <span key={`${label}-${i}`} className={`text-xs font-medium ${theme.text.muted}`}>
              {label}
            </span>
          ))}

          {cells.map((date, i) => {
            if (!date) return <span key={`empty-${i}`} />;
            const iso = toISODate(date);
            const isPast = date < today;
            const isStart = iso === startDate;
            const isEnd = iso === endDate;
            const inRange = isInRange(iso);

            return (
              <button
                key={iso}
                type="button"
                disabled={isPast}
                onClick={() => handleDayClick(date)}
                className={`h-9 w-9 mx-auto flex items-center justify-center text-sm rounded-full transition ${
                  isPast
                    ? "text-slate-300 cursor-not-allowed"
                    : isStart || isEnd
                      ? "bg-blue-600 text-white font-semibold"
                      : inRange
                        ? "bg-blue-50 text-blue-700"
                        : `${theme.text.primary} hover:bg-slate-100`
                }`}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      {!isOngoing && (
        <p className={`text-xs ${theme.text.muted}`}>
          {startDate && endDate
            ? `Listed from ${startDate} to ${endDate}`
            : startDate
              ? "Now tap an end date"
              : "Tap a start date"}
        </p>
      )}

      {error && <p className={`text-xs ${theme.text.error}`}>{error}</p>}
    </div>
  );
}

export default AvailabilityCalendar;