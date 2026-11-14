import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { authOptions, Role } from "@/lib/auth";

export interface SessionUser {
  id: string;
  role: Role;
  name: string;
  email: string;
  username: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user;
  if (!user?.id || !ObjectId.isValid(user.id)) return null;
  return {
    id: user.id,
    role: user.role === "admin" ? "admin" : "student",
    name: user.name || user.username || "Account",
    email: user.email || "",
    username: user.username || "",
  };
}

/** For pages: send visitors without the right role to the right sign-in screen. */
export async function requirePageUser(role: Role, callbackUrl: string): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user || user.role !== role) {
    const base = role === "admin" ? "/admin/signin" : "/auth/signin";
    redirect(`${base}?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }
  return user;
}

export const json = {
  ok: <T extends object>(body: T, status = 200) => NextResponse.json(body, { status }),
  error: (message: string, status = 400) => NextResponse.json({ error: message }, { status }),
};

/** For route handlers: returns the admin, or a ready-made 401/403 response. */
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return json.error("Sign in required", 401);
  if (user.role !== "admin") return json.error("Admin access required", 403);
  return user;
}

export async function requireUser(): Promise<SessionUser | NextResponse> {
  const user = await getSessionUser();
  if (!user) return json.error("Sign in required", 401);
  return user;
}

export function toObjectId(id: unknown): ObjectId | null {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id) ? new ObjectId(id) : null;
}
