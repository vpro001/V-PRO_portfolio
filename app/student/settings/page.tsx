import { redirect } from "next/navigation";

// Settings and profile are one page now.
export default function StudentSettings() {
  redirect("/student/profile");
}
