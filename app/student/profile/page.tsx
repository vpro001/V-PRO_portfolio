import type { Metadata } from "next";
import PageHeader from "@/components/dash/PageHeader";
import { PasswordForm, ProfileForm } from "@/components/dash/ProfileForms";
import { formatDate } from "@/lib/format";
import { getDb } from "@/lib/mongodb";
import { requirePageUser, toObjectId } from "@/lib/session";

export const metadata: Metadata = { title: "Profile" };

export default async function StudentProfile() {
  const user = await requirePageUser("student", "/student/profile");
  const student = await (await getDb()).collection("students").findOne({ _id: toObjectId(user.id)! });

  return (
    <>
      <PageHeader
        title="Profile"
        description={`Signed in as @${user.username}${student?.createdAt ? ` · member since ${formatDate(student.createdAt)}` : ""}.`}
      />
      <div className="grid max-w-3xl gap-6">
        <ProfileForm
          initial={{
            firstName: student?.profile?.firstName || "",
            lastName: student?.profile?.lastName || "",
            email: student?.email || user.email,
            phone: student?.profile?.phone || "",
            country: student?.profile?.country || "",
            bio: student?.profile?.bio || "",
          }}
        />
        <PasswordForm endpoint="/api/student/profile" />
      </div>
    </>
  );
}
