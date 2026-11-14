import type { Metadata } from "next";
import DashShell from "@/components/dash/DashShell";
import { getDb } from "@/lib/mongodb";
import { requirePageUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s — Admin" }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser("admin", "/admin");
  const unread = await (await getDb())
    .collection("messages")
    .countDocuments({ read: { $ne: true } })
    .catch(() => 0);

  return (
    <DashShell
      area="Admin"
      userName={user.name}
      nav={[
        { href: "/admin", label: "Overview", icon: "overview", exact: true },
        { href: "/admin/courses", label: "Courses", icon: "courses" },
        { href: "/admin/students", label: "Students", icon: "students" },
        { href: "/admin/enrollments", label: "Enrolments", icon: "enrollments" },
        { href: "/admin/payments", label: "Payments", icon: "payments" },
        { href: "/admin/projects", label: "Projects", icon: "projects" },
        { href: "/admin/messages", label: "Messages", icon: "messages", badge: unread },
        { href: "/admin/settings", label: "Settings", icon: "settings" },
      ]}
    >
      {children}
    </DashShell>
  );
}
