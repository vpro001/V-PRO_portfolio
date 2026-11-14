
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { site } from "@/lib/site";

const display = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  variable: "--font-display-face",
  weight: "400 800",
  display: "swap",
});

const serif = localFont({
  src: [
    {
      path: "./fonts/instrument-serif-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/instrument-serif-italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif-face",
  display: "swap",
});

const body = localFont({
  src: "./fonts/geist.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "./fonts/jetbrains-mono.woff2",
  variable: "--font-mono-face",
  weight: "100 800",
  display: "swap",
});

const description = `${site.name} — ${site.role.toLowerCase()} in ${site.location}. ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  ),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description,
  openGraph: {
    title: `${site.name} — ${site.role}`,
    description,
    type: "website",
    siteName: site.brandFull,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0c0b" },
    { media: "(prefers-color-scheme: light)", color: "#f1efe7" },
  ],
};

// Applies the saved theme before first paint.
const themeScript = `try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") {
    document.documentElement.dataset.theme = t;
  }
} catch(e) {}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${display.variable} ${serif.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
