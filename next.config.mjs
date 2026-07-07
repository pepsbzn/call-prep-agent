/** @type {import('next').NextConfig} */
const nextConfig = {
  // Images are served through our own auth-checking route handlers,
  // never directly from Blob URLs, so the built-in optimizer is unused.
  images: { unoptimized: true },
};

export default nextConfig;
