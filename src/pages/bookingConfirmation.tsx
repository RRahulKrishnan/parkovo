import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CalendarCheck } from "lucide-react";
import { theme } from "../theme/theme";
import SliderControl from "../components/sliderControl";
import { bookingEndDate, clearPendingCheckout, getPendingCheckout } from "../types/checkout";
import { createBooking } from "../firebase/bookings";
import { getFirebaseAuth } from "../firebase/config";

const toInput = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function BookingConfirmation() {
  const navigate = useNavigate(); const checkout = getPendingCheckout();
  const [startValue, setStartValue] = useState(() => toInput(new Date()));
  const [hours, setHours] = useState(1); const [error, setError] = useState<string | null>(null); const [saving, setSaving] = useState(false);
  if (!checkout) return <main className={`flex min-h-screen items-center justify-center ${theme.surface.page}`}><button onClick={() => navigate("/find-parking")} className={theme.text.link}>Find a spot</button></main>;
  const startAt = new Date(startValue); const quantity = checkout.period === "hourly" ? hours : 1; const endAt = bookingEndDate(startAt, checkout.period, quantity); const maxHours = checkout.maxBookingHours ?? 23; const total = checkout.unitPrice * quantity;
  const reserve = async () => { if (Number.isNaN(startAt.getTime()) || startAt <= new Date()) { setError("Choose a future date and time."); return; } if (checkout.period === "hourly" && hours > maxHours) { setError(`This host allows up to ${maxHours} hours per booking.`); return; } if (checkout.availableUntil && endAt > new Date(`${checkout.availableUntil}T23:59:59`)) { setError("This booking exceeds the host's availability period."); return; } const user = getFirebaseAuth().currentUser; if (!user) { navigate("/login"); return; } setSaving(true); try { await createBooking({ listingId: checkout.listingId, renterId: user.uid, spotName: checkout.spotName, address: checkout.address, startAt, endAt, amount: total }); clearPendingCheckout(); navigate("/bookings"); } catch (cause) { console.error("Failed to reserve spot:", cause); setError("Couldn't reserve this spot. Please try again."); } finally { setSaving(false); } };
  return <main className={`min-h-screen ${theme.surface.page} ${theme.text.primary}`}><header className="flex items-center gap-4 px-6 pb-5 pt-8"><button onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button><h1 className="text-xl font-extrabold">Set your parking time</h1></header><section className="space-y-5 px-6"><div className={`rounded-2xl border p-4 ${theme.border.default}`}><CalendarCheck className="h-6 w-6 text-blue-600" /><h2 className="mt-2 font-bold">{checkout.spotName}</h2><p className={`mt-1 text-sm ${theme.text.secondary}`}>{checkout.address}</p></div><div><label className="mb-2 block text-sm font-semibold">Start date and time</label><input type="datetime-local" min={toInput(new Date())} value={startValue} onChange={(event) => setStartValue(event.target.value)} className={`w-full rounded-lg border px-3 py-2.5 text-sm ${theme.border.default}`} /></div>{checkout.period === "hourly" && <SliderControl label="Parking duration" value={hours} min={1} max={maxHours} onChange={setHours} formatValue={(value) => `${value} hour${value === 1 ? "" : "s"}`} />}<div className={`rounded-xl bg-slate-50 p-4 text-sm ${theme.text.secondary}`}><div className="flex justify-between gap-4"><span>Ends</span><b className="text-right">{endAt.toLocaleString("en-IN")}</b></div><div className="mt-3 flex justify-between border-t pt-3"><span>Total</span><b className="text-blue-600">₹{total}</b></div></div>{error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}<button disabled={saving} onClick={reserve} className={`w-full rounded-full px-5 py-3 text-sm font-bold disabled:opacity-60 ${theme.button.primary}`}>{saving ? "Reserving…" : `Reserve for ₹${total}`}</button></section></main>;
}
