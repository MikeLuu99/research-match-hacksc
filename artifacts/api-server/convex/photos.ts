// Profile picture rules shared by the upload validation and its tests. Pure
// helpers only, so they run without a Convex backend.

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
export const PHOTO_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

/** Returns an error message for an unacceptable photo, or null if it is fine. */
export function photoProblem(
  file: { contentType?: string | null; size: number } | null,
): string | null {
  if (!file) return "Photo upload failed. Please try again.";
  const type = (file.contentType ?? "").toLowerCase();
  if (!(PHOTO_CONTENT_TYPES as readonly string[]).includes(type))
    return "Profile photos must be a JPEG, PNG, WebP or GIF image.";
  if (file.size > MAX_PHOTO_BYTES)
    return "Profile photos must be 2 MB or smaller.";
  return null;
}
