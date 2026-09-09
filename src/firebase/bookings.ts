import { collection, doc, getDocs, updateDoc, query, where, orderBy, Timestamp } from "firebase/firestore";
import { getFirestoreDb } from "./config";

export type BookingStatus = "upcoming" | "active" | "completed" | "cancelled";

export interface Booking {
  id: string;
  spotName: string;
  address: string;
  date: string;
  timeRange: string;
  status: BookingStatus;
}

interface BookingDoc {
  listingId: string;
  renterId: string;
  status: BookingStatus;
  startAt: Timestamp;
  endAt: Timestamp;
  spotAddressLine1?: string;
  spotCity?: string;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  day: "numeric",
  year: "numeric",
});
const TIME_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/**
 * No server-side job flips a booking to "completed" the moment its end
 * time passes (that would need a scheduled Cloud Function, which requires
 * the Blaze plan). Instead, the *displayed* status is always derived from
 * the stored status + end time — so it's correct immediately, on every
 * read, with zero delay and zero cost.
 */
export function getEffectiveStatus(status: BookingStatus, endAt: Date): BookingStatus {
  if ((status === "upcoming" || status === "active") && endAt.getTime() < Date.now()) {
    return "completed";
  }
  return status;
}

function docToBooking(id: string, data: BookingDoc): Booking {
  const startAt = data.startAt.toDate();
  const endAt = data.endAt.toDate();
  return {
    id,
    spotName: data.spotAddressLine1 || "Parking spot",
    address: data.spotCity ?? "",
    date: DATE_FORMATTER.format(startAt),
    timeRange: `${TIME_FORMATTER.format(startAt)} – ${TIME_FORMATTER.format(endAt)}`,
    status: getEffectiveStatus(data.status, endAt),
  };
}

export async function listMyBookings(renterId: string): Promise<Booking[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "bookings"),
    where("renterId", "==", renterId),
    orderBy("startAt", "desc")
  );
  const snap = await getDocs(q);
  const bookings = snap.docs.map((d) => docToBooking(d.id, d.data() as BookingDoc));

  // Self-healing: quietly persist the corrected status for anything we
  // just noticed is actually over, so other viewers (e.g. the host
  // looking at bookings against their listing) see the right status too,
  // not just this renter on this load.
  const staleDocs = snap.docs.filter((d) => {
    const data = d.data() as BookingDoc;
    return (
      (data.status === "upcoming" || data.status === "active") &&
      data.endAt.toDate().getTime() < Date.now()
    );
  });
  if (staleDocs.length > 0) {
    await Promise.all(
      staleDocs.map((d) => updateDoc(doc(db, "bookings", d.id), { status: "completed" }))
    ).catch((err) => console.error("Failed to self-heal stale booking statuses:", err));
  }

  return bookings;
}

export async function cancelBooking(id: string): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "bookings", id), { status: "cancelled" });
}