import { redirect } from "next/navigation";

// Old address; students sign in at /auth/signin.
export default function LegacyStudentSignIn() {
  redirect("/auth/signin");
}
