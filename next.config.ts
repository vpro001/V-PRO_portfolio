import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The MongoDB driver is server-only; keep it out of the bundler.
  serverExternalPackages: ["mongodb"],
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/admin/dashboard", destination: "/admin", permanent: false },
      { source: "/admin/courses/create", destination: "/admin/courses/new", permanent: false },
      { source: "/admin/courses/:id/edit", destination: "/admin/courses/:id", permanent: false },
      { source: "/admin/courses/:id/lessons", destination: "/admin/courses/:id", permanent: false },
      { source: "/admin/progress", destination: "/admin/enrollments", permanent: false },
      { source: "/unauthorized", destination: "/auth/signin", permanent: false },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
