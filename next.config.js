/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required: user-uploaded images from Supabase storage use dynamic URLs
  // that Next.js cannot optimize at build time.
  images: { unoptimized: true },
};

module.exports = nextConfig;
