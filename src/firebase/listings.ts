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
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { getFirestoreDb } from "./config";
import { uploadListingPhotos } from "../firebase/storage";
import type { ListingFormData } from "../types/listing";
import type { ParkingSpotDetail } from "../types/spotDetail";
import type { ParkingSpotSummary } from "../types/search";

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
  photoUrls?: string[];
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
      // File objects can't be reconstructed from storage — only their
      // uploaded URLs. `files` stays empty on load.
      photos: { files: [], previewUrls: data.photoUrls ?? [] },
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
  // Query each listing by its single indexed field and apply the date filter
  // locally. This keeps listing/detail pages usable without a composite
  // Firestore index on (listingId, startAt).
  await Promise.all(listingIds.map(async (listingId) => {
    const snap = await getDocs(
      query(collection(db, "bookings"), where("listingId", "==", listingId))
    );
    const count = snap.docs.filter((docSnap) => {
      const startAt = docSnap.data().startAt as Timestamp | undefined;
      return startAt ? startAt.toDate() >= startOfMonth : false;
    }).length;
    counts.set(listingId, count);
  }));
  return counts;
}

export async function listMyListings(hostId: string): Promise<Hosting[]> {
  const db = getFirestoreDb();
  // Sorting a hostId-filtered query by createdAt requires a composite index.
  // Fetch through Firestore's built-in single-field hostId index, then sort
  // the small host-owned result set locally instead.
  const q = query(collection(db, "listings"), where("hostId", "==", hostId));
  const snap = await getDocs(q);
  const ids = snap.docs.map((d) => d.id);
  let counts = new Map<string, number>();
  try {
    counts = await getBookingCountsThisMonth(ids);
  } catch (error) {
    // A bookings permission issue must not hide the host's own listings.
    console.warn("Couldn't load booking counts:", error);
  }
  return snap.docs
    .sort((a, b) => {
      const aCreated = (a.data() as ListingDoc).createdAt?.toMillis() ?? 0;
      const bCreated = (b.data() as ListingDoc).createdAt?.toMillis() ?? 0;
      return bCreated - aCreated;
    })
    .map((d) => docToHosting(d.id, d.data() as ListingDoc, counts.get(d.id) ?? 0));
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

export async function createListing(
  hostId: string,
  listing: ListingFormData,
  photoFiles: File[] = []
): Promise<string> {
  const db = getFirestoreDb();

  // Create the document first — photo uploads need a listing id for the
  // storage path, and Storage rules check this doc's hostId to authorize
  // the write, so it needs to exist (with hostId set) before uploading.
  const ref = await addDoc(collection(db, "listings"), {
    hostId,
    status: "active",
    address: listing.address,
    about: listing.about,
    pricing: listing.pricing,
    amenities: listing.amenities,
    availability: listing.availability,
    photoUrls: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (photoFiles.length > 0) {
    const photoUrls = await uploadListingPhotos(ref.id, photoFiles);
    await updateDoc(ref, { photoUrls });
  }

  return ref.id;
}

export async function updateListing(
  id: string,
  listing: ListingFormData,
  status: "active" | "paused" = "active",
  newPhotoFiles: File[] = []
): Promise<void> {
  const db = getFirestoreDb();

  const updates: Record<string, unknown> = {
    status,
    address: listing.address,
    about: listing.about,
    pricing: listing.pricing,
    amenities: listing.amenities,
    availability: listing.availability,
    updatedAt: serverTimestamp(),
  };

  // Only touch photoUrls if new files were actually picked during this
  // edit — otherwise leave the existing stored photos alone.
  if (newPhotoFiles.length > 0) {
    const newUrls = await uploadListingPhotos(id, newPhotoFiles);
    updates.photoUrls = [...listing.photos.previewUrls, ...newUrls];
  }

  await updateDoc(doc(db, "listings", id), updates);
}

export async function deleteListing(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, "listings", id));
}

// List views shouldn't need to know the shape of ListingFormData just to
// show a name — derive one from the street address.
export function hostingTitle(hosting: Hosting): string {
  return hosting.listing.about.title || hosting.listing.address.line1 || "Untitled listing";
}

export function hostingSubtitle(hosting: Hosting): string {
  const { city, state } = hosting.listing.address;
  return [city, state].filter(Boolean).join(", ");
}

function listingAddress(listing: ListingFormData): string {
  return [listing.address.line1, listing.address.city, listing.address.state]
    .filter(Boolean)
    .join(", ") || "Address unavailable";
}

function listingTitle(listing: ListingFormData): string {
  return listing.about.title || listing.address.line1 || "Parking spot";
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&h=400&fit=crop";

export function hostingToParkingSpot(hosting: Hosting): ParkingSpotSummary {
  const { listing } = hosting;
  return {
    id: hosting.id,
    title: listingTitle(listing),
    address: listingAddress(listing),
    distanceKm: 0,
    pricing: listing.pricing,
    imageUrl: listing.photos.previewUrls[0] || FALLBACK_IMAGE,
    amenities: listing.amenities.amenities,
    spotSize: listing.amenities.spotSize || "compact",
    status: hosting.status === "active" ? "available" : "booked",
  };
}

/** Public Explore data, sourced exclusively from Firestore active listings. */
export async function listParkingSpots(): Promise<ParkingSpotSummary[]> {
  const listings = await listActiveListings();
  return listings.map(hostingToParkingSpot);
}

/** Parking-detail data, sourced exclusively from its Firestore listing. */
export async function getParkingSpot(id: string): Promise<ParkingSpotDetail | null> {
  // Public detail pages only need the listing. Do not call getListing here:
  // it also loads host-only booking counters, which can make a valid public
  // listing look missing when booking reads are restricted by Firestore rules.
  const snap = await getDoc(doc(getFirestoreDb(), "listings", id));
  if (!snap.exists()) return null;
  const hosting = docToHosting(snap.id, snap.data() as ListingDoc, 0);
  if (!hosting || hosting.status !== "active") return null;
  const spot = hostingToParkingSpot(hosting);
  const images = hosting.listing.photos.previewUrls.length > 0
    ? hosting.listing.photos.previewUrls
    : [FALLBACK_IMAGE];
  return {
    ...spot,
    images,
    description: hosting.listing.about.description,
    howToGetThere: hosting.listing.about.howToGetThere,
    hostName: "ParkingO host",
    availableFrom: "Available now",
    maxBookingHours: hosting.listing.availability.maxBookingHours ?? 23,
    availableUntil: hosting.listing.availability.isOngoing ? undefined : hosting.listing.availability.endDate,
  };
}
