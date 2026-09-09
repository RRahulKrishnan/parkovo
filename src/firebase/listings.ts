import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "./config";
import type { ListingFormData } from "../types/listing";

export interface Hosting {
  id: string;
  status: "active" | "paused";
  bookingsThisMonth: number;
  listing: ListingFormData;
}

interface ListingDoc {
  hostId: string;
  status: "active" | "paused";
  address: ListingFormData["address"];
  about: ListingFormData["about"];
  pricing: ListingFormData["pricing"];
  amenities: ListingFormData["amenities"];
  availability: ListingFormData["availability"];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

function docToHosting(id: string, data: ListingDoc, bookingsThisMonth: number): Hosting {
  return {
    id,
    status: data.status,
    bookingsThisMonth,
    listing: {
      address: data.address,
      // Photos live in Firebase Storage, not this document — known gap,
      // see the TODO in hostOnboarding.tsx's submit handler.
      photos: { files: [], previewUrls: [] },
      about: data.about,
      pricing: data.pricing,
      amenities: data.amenities,
      availability: data.availability,
    },
  };
}

/** Bookings against `listingIds` since the start of the current calendar
 * month, grouped by listing id, so "N bookings this month" doesn't need a
 * separate round trip per listing. */
async function getBookingCountsThisMonth(listingIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (listingIds.length === 0) return counts;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const db = getFirestoreDb();
  // Firestore 'in' queries cap at 30 values — fine at this app's scale.
  const q = query(
    collection(db, "bookings"),
    where("listingId", "in", listingIds.slice(0, 30)),
    where("startAt", ">=", Timestamp.fromDate(startOfMonth))
  );
  const snap = await getDocs(q);
  snap.forEach((docSnap) => {
    const listingId = docSnap.data().listingId as string;
    counts.set(listingId, (counts.get(listingId) ?? 0) + 1);
  });
  return counts;
}

export async function listMyListings(hostId: string): Promise<Hosting[]> {
  const db = getFirestoreDb();
  const q = query(
    collection(db, "listings"),
    where("hostId", "==", hostId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const ids = snap.docs.map((d) => d.id);
  const counts = await getBookingCountsThisMonth(ids);
  return snap.docs.map((d) => docToHosting(d.id, d.data() as ListingDoc, counts.get(d.id) ?? 0));
}

/** Active listings visible to anyone — for the Explore/search screen. */
export async function listActiveListings(): Promise<Hosting[]> {
  const db = getFirestoreDb();
  const q = query(collection(db, "listings"), where("status", "==", "active"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToHosting(d.id, d.data() as ListingDoc, 0));
}

export async function getListing(id: string): Promise<Hosting | null> {
  const db = getFirestoreDb();
  const snap = await getDoc(doc(db, "listings", id));
  if (!snap.exists()) return null;
  const counts = await getBookingCountsThisMonth([id]);
  return docToHosting(snap.id, snap.data() as ListingDoc, counts.get(id) ?? 0);
}

export async function createListing(hostId: string, listing: ListingFormData): Promise<string> {
  const db = getFirestoreDb();
  const ref = await addDoc(collection(db, "listings"), {
    hostId,
    status: "active",
    address: listing.address,
    about: listing.about,
    pricing: listing.pricing,
    amenities: listing.amenities,
    availability: listing.availability,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateListing(
  id: string,
  listing: ListingFormData,
  status: "active" | "paused" = "active"
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, "listings", id), {
    status,
    address: listing.address,
    about: listing.about,
    pricing: listing.pricing,
    amenities: listing.amenities,
    availability: listing.availability,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteListing(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "listings", id));
}

// List views shouldn't need to know the shape of ListingFormData just to
// show a name — derive one from the street address.
export function hostingTitle(hosting: Hosting): string {
  return hosting.listing.address.line1 || "Untitled listing";
}

export function hostingSubtitle(hosting: Hosting): string {
  const { city, state } = hosting.listing.address;
  return [city, state].filter(Boolean).join(", ");
}