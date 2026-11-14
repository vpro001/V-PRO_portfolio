import type { Metadata } from "next";
import DashShell from "@/components/dash/DashShell";
import { requirePageUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "My learning", template: "%s — My learning" }, robots: { index: false } };

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("student", "/student/dashboard");

  return (
    <DashShell
      area="Student"
      userName={user.name}
      nav={[
        { href: "/student/dashboard", label: "Overview", icon: "overview" },
        { href: "/student/courses", label: "My courses", icon: "courses" },
        { href: "/student/certificates", label: "Certificates", icon: "certificates" },
        { href: "/student/profile", label: "Profile", icon: "profile" },
      ]}
    >
      {children}
    </DashShell>
  );
}
