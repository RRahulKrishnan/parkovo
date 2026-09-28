import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck, Clock3 } from "lucide-react";
import { theme } from "../theme/theme";
import SliderControl from "../components/sliderControl";
import AvailabilityCalendar from "../components/availabilityCalendar";
import { bookingEndDate, clearPendingCheckout, getPendingCheckout } from "../types/checkout";
import { createBooking, listActiveBookingIntervals, BOOKING_BUFFER_MS } from "../firebase/bookings";
import { getFirebaseAuth } from "../firebase/config";

const dateTimeFor = (date: string, time: string) => new Date(`${date}T${time}`);
const formatDateTime = (date: Date) => date.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

export default function BookingConfirmation() {
  const navigate = useNavigate(); const checkout = getPendingCheckout();
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today); const [time, setTime] = useState("09:00");
  const [hours, setHours] = useState(1); const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  const startAt = useMemo(() => dateTimeFor(date, time), [date, time]);
  const quantity = checkout?.period === "hourly" ? hours : 1;
  const endAt = checkout ? bookingEndDate(startAt, checkout.period, quantity) : new Date();
  const total = checkout ? checkout.unitPrice * quantity : 0;
  if (!checkout) return null;
  const reserve = async () => {
    if (Number.isNaN(startAt.getTime()) || startAt <= new Date()) { setError("Choose a future date and time."); return; }
    if (!confirmed) { setError("Confirm the date and parking time to continue."); return; }
    const maxHours = checkout.maxBookingHours ?? 23;
    if (checkout.period === "hourly" && hours > maxHours) { setError(`This host allows up to ${maxHours} hours per booking.`); return; }
    if (checkout.availableUntil && endAt > new Date(`${checkout.availableUntil}T23:59:59`)) { setError("This booking exceeds the host's availability period."); return; }
    setSaving(true); setError(null);
    try {
      const intervals = await listActiveBookingIntervals(checkout.listingId);
      if (intervals.some((interval) => startAt < new Date(interval.endAt.getTime() + BOOKING_BUFFER_MS) && endAt > interval.startAt)) throw new Error("This time overlaps a booking or its 30-minute turnover window. Choose another time.");
      const user = getFirebaseAuth().currentUser; if (!user) { navigate("/login"); return; }
      await createBooking({ listingId: checkout.listingId, renterId: user.uid, spotName: checkout.spotName, address: checkout.address, startAt, endAt, amount: total });
      clearPendingCheckout(); navigate("/bookings");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Couldn't reserve this spot. Please try again."); } finally { setSaving(false); }
  };
  return <main className={`min-h-screen pb-10 ${theme.surface.page} ${theme.text.primary}`}>
    <header className="flex items-center gap-4 px-6 pb-5 pt-8"><button onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button><div><h1 className="text-xl font-extrabold">Confirm your parking</h1><p className={`text-sm ${theme.text.secondary}`}>Choose the date and time you need.</p></div></header>
    <section className="space-y-5 px-6"><div className={`rounded-2xl border p-4 ${theme.border.default}`}><CalendarCheck className="h-6 w-6 text-blue-600" /><h2 className="mt-2 font-bold">{checkout.spotName}</h2><p className={`mt-1 text-sm ${theme.text.secondary}`}>{checkout.address}</p></div>
      <div className={`rounded-2xl border p-4 ${theme.border.default}`}><h2 className="mb-3 font-bold">Select date</h2><AvailabilityCalendar mode="booking" startDate={date} endDate={date} isOngoing={false} onChangeRange={(next) => { setDate(next); setConfirmed(false); }} onChangeOngoing={() => undefined} /></div>
      <div><label className="mb-2 block text-sm font-semibold">Start time</label><input type="time" value={time} onChange={(event) => { setTime(event.target.value); setConfirmed(false); }} className={`w-full rounded-xl border px-3 py-3 text-sm ${theme.border.default}`} /></div>
      {checkout.period === "hourly" && <SliderControl label="Parking duration" value={hours} min={1} max={checkout.maxBookingHours ?? 23} onChange={(value) => { setHours(value); setConfirmed(false); }} formatValue={(value) => `${value} hour${value === 1 ? "" : "s"}`} />}
      <div className="rounded-xl bg-blue-50 p-4 text-sm text-slate-700"><div className="flex gap-2"><Clock3 className="mt-0.5 h-4 w-4 text-blue-600" /><div><p className="font-semibold">{formatDateTime(startAt)} – {formatDateTime(endAt)}</p><p className="mt-1 text-xs">A 30-minute turnover buffer is protected after every booking.</p></div></div><div className="mt-3 flex justify-between border-t border-blue-100 pt-3"><span>Total</span><b className="text-blue-600">₹{total}</b></div></div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} className="mt-0.5 h-4 w-4 accent-blue-600" /><span>I confirm this parking spot for <b>{formatDateTime(startAt)}</b> to <b>{formatDateTime(endAt)}</b>.</span></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<button disabled={saving} onClick={reserve} className={`w-full rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60 ${theme.button.primary}`}>{saving ? "Reserving…" : `Confirm booking · ₹${total}`}</button></section>
  </main>;
}
