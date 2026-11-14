/** Plain, serialisable shapes passed from the server to client components. */

export interface LessonDTO {
  id: string;
  title: string;
  description: string;
  duration: number; // minutes
  order: number;
  isPublished: boolean;
  hasVideo: boolean;
  /** Only present for enrolled learners and admins. */
  videoUrl?: string;
  resources: { title: string; url: string }[];
}

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface CourseDTO {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  previewVideoUrl: string;
  category: string;
  price: number;
  originalPrice: number;
  level: CourseLevel;
  language: string;
  students: number;
  lessons: LessonDTO[];
  requirements: string[];
  objectives: string[];
  isPublished: boolean;
  totalMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDTO {
  id: string;
  name: string;
  imageUrl: string;
  link: string;
  status: string;
  description: string;
  technologies: string[];
  category: string;
  featured: boolean;
  createdAt: string;
}

export interface EnrollmentDTO {
  id: string;
  courseId: string;
  progress: number;
  completedLessons: string[];
  enrolledAt: string;
  lastAccessedAt: string;
  completedAt: string;
  certificateIssued: boolean;
  certificateIssuedAt: string;
}
