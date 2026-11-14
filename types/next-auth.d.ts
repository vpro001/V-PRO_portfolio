import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "student";
      username?: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "admin" | "student";
    username?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "admin" | "student";
    id: string;
    username?: string;
  }
}
