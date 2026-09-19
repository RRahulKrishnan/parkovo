export type BookingPeriod = "hourly" | "daily" | "weekly" | "monthly";
export interface CheckoutDetails {
  listingId: string; spotName: string; address: string; period: BookingPeriod;
  unitPrice: number; quantity: number; startAt: string;
  maxBookingHours?: number;
  availableUntil?: string;
}
export interface GuestBooking { id: string; spotName: string; address: string; date: string; timeRange: string; status: "upcoming"; }
const KEY = "parkovo-pending-checkout";
const BOOKED_SPOTS_KEY = "parkovo-booked-spots";
const GUEST_BOOKINGS_KEY = "parkovo-guest-bookings";
export const savePendingCheckout = (details: CheckoutDetails) => sessionStorage.setItem(KEY, JSON.stringify(details));
export const clearPendingCheckout = () => sessionStorage.removeItem(KEY);
export function markSpotBooked(listingId: string): void {
  const booked = new Set(JSON.parse(localStorage.getItem(BOOKED_SPOTS_KEY) ?? "[]") as string[]);
  booked.add(listingId);
  localStorage.setItem(BOOKED_SPOTS_KEY, JSON.stringify([...booked]));
}
export function isSpotBooked(listingId: string): boolean {
  return (JSON.parse(localStorage.getItem(BOOKED_SPOTS_KEY) ?? "[]") as string[]).includes(listingId);
}
export function saveGuestBooking(details: CheckoutDetails, startAt: Date, endAt: Date): void {
  const bookings = getGuestBookings();
  const date = new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric", year: "numeric" }).format(startAt);
  const time = new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true });
  bookings.unshift({ id: `guest-${Date.now()}`, spotName: details.spotName, address: details.address, date, timeRange: `${time.format(startAt)} – ${time.format(endAt)}`, status: "upcoming" });
  localStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(bookings));
}
export function getGuestBookings(): GuestBooking[] {
  try { return JSON.parse(localStorage.getItem(GUEST_BOOKINGS_KEY) ?? "[]") as GuestBooking[]; } catch { return []; }
}
export function getPendingCheckout(): CheckoutDetails | null {
  try { const value = sessionStorage.getItem(KEY); return value ? JSON.parse(value) as CheckoutDetails : null; } catch { clearPendingCheckout(); return null; }
}
export function bookingEndDate(start: Date, period: BookingPeriod, quantity = 1): Date {
  const end = new Date(start); end.setHours(end.getHours() + ({ hourly: 1, daily: 24, weekly: 168, monthly: 720 }[period] * quantity)); return end;
}
