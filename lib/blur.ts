import sharp from "sharp";

// Server-side blur for unauthenticated viewers. The image is collapsed to a
// tiny thumbnail and Gaussian-blurred BEFORE it leaves the server, so the
// response physically contains no recoverable detail — nothing in devtools
// can undo it. The client <img> just stretches this small JPEG.
export async function blurImage(original: Buffer): Promise<Buffer> {
  return sharp(original)
    .rotate() // respect EXIF orientation
    .resize(48, 48, { fit: "inside" })
    .blur(6)
    .jpeg({ quality: 40 })
    .toBuffer();
}
