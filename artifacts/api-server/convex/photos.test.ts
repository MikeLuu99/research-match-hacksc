import { describe, expect, it } from "vitest";
import { MAX_PHOTO_BYTES, photoProblem } from "./photos";

describe("photoProblem", () => {
  it("accepts common image types within the size limit", () => {
    for (const contentType of ["image/jpeg", "image/png", "image/webp", "image/gif"])
      expect(photoProblem({ contentType, size: 1000 })).toBeNull();
    expect(photoProblem({ contentType: "IMAGE/PNG", size: MAX_PHOTO_BYTES })).toBeNull();
  });

  it("rejects non-image files", () => {
    expect(photoProblem({ contentType: "application/pdf", size: 1000 })).toMatch(/JPEG, PNG/);
    expect(photoProblem({ contentType: "image/svg+xml", size: 1000 })).toMatch(/JPEG, PNG/);
    expect(photoProblem({ contentType: undefined, size: 1000 })).toMatch(/JPEG, PNG/);
  });

  it("rejects files over 2 MB", () => {
    expect(photoProblem({ contentType: "image/jpeg", size: MAX_PHOTO_BYTES + 1 })).toMatch(/2 MB/);
  });

  it("rejects a missing upload", () => {
    expect(photoProblem(null)).toMatch(/failed/);
  });
});
