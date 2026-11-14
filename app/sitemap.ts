import type { MetadataRoute } from "next";
import { listPublishedCourses, safely } from "@/lib/data";

export const dynamic = "force-dynamic";

const base = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const courses = await safely(() => listPublishedCourses(), []);
  return [
    ...["", "/projects", "/about", "/courses", "/contact"].map((path) => ({ url: `${base}${path}` })),
    ...courses.map((course) => ({
      url: `${base}/courses/${course.id}`,
      lastModified: course.updatedAt || undefined,
    })),
  ];
}
