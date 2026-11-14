import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getDb } from "@/lib/mongodb";
import { hashPassword, verifyPassword } from "@/lib/password";

export type Role = "admin" | "student";

/** Admins live in `users`, learners in `students`. */
export function collectionFor(role: Role) {
  return role === "admin" ? "users" : "students";
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function displayName(user: Record<string, any>): string {
  const full = [user.profile?.firstName, user.profile?.lastName].filter(Boolean).join(" ").trim();
  return full || user.username || "Account";
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username or email", type: "text" },
        password: { label: "Password", type: "password" },
        userType: { label: "User type", type: "text" },
      },
      async authorize(credentials) {
        const identifier = credentials?.username?.trim();
        const password = credentials?.password;
        if (!identifier || !password) return null;

        const role: Role = credentials?.userType === "admin" ? "admin" : "student";
        const db = await getDb();
        const users = db.collection(collectionFor(role));
        const lower = identifier.toLowerCase();

        const user = await users.findOne({
          $or: [{ username: identifier }, { username: lower }, { email: lower }],
        });
        if (!user) return null;

        const check = verifyPassword(password, user.password);
        if (!check.ok) return null;

        await users.updateOne(
          { _id: user._id },
          {
            $set: {
              lastLoginAt: new Date(),
              ...(check.needsUpgrade ? { password: hashPassword(password) } : {}),
            },
          }
        );

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role,
          name: displayName(user),
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 14 },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = (user as { username?: string }).username;
        token.name = user.name;
        token.email = user.email;
      }
      // Lets the profile page refresh the displayed name without signing out.
      if (trigger === "update" && session?.name) token.name = session.name;
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: { signIn: "/auth/signin" },
  secret: process.env.NEXTAUTH_SECRET,
};
