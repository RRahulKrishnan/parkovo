import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// getStorage() with no args uses the default app that firebase/config.ts
// already initialized via initializeApp() — no separate app instance
// needed here, same pattern as getFirebaseAuth()/getFirestoreDb().
let storage: ReturnType<typeof getStorage> | null = null;

function getFirebaseStorage() {
  if (!storage) {
    storage = getStorage();
  }
  return storage;
}

/** Uploads each file to listings/{listingId}/ and returns their public
 * download URLs, in the same order as the input files. */
export async function uploadListingPhotos(listingId: string, files: File[]): Promise<string[]> {
  if (files.length === 0) return [];
  const storageInstance = getFirebaseStorage();
  const uploads = files.map(async (file, index) => {
    const path = `listings/${listingId}/${Date.now()}-${index}-${file.name}`;
    const storageRef = ref(storageInstance, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  });
  return Promise.all(uploads);
}

/** Best-effort delete — failures are logged, not thrown, since a missing
 * photo shouldn't block whatever the caller was actually trying to do
 * (e.g. deleting a listing shouldn't fail just because one photo file was
 * already gone). */
export async function deleteListingPhoto(url: string): Promise<void> {
  try {
    const storageInstance = getFirebaseStorage();
    const path = decodeURIComponent(new URL(url).pathname.split("/o/")[1].split("?")[0]);
    await deleteObject(ref(storageInstance, path));
  } catch (err) {
    console.warn("Failed to delete photo (non-fatal):", err);
  }
}