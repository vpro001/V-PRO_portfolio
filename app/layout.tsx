import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import { site } from "@/lib/site";
import { Analytics } from "@vercel/analytics/next"

const display = localFont({
  src: "../public/fonts/bricolage-grotesque.ttf",
  variable: "--font-display-face",
  weight: "400 800",
  display: "swap",
});

const serif = localFont({
  src: [
    {
      path: "../public/fonts/instrument-serif-regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/instrument-serif-italic.ttf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-serif-face",
  display: "swap",
});

const body = localFont({
  src: "../public/fonts/geist.ttf",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

const mono = localFont({
  src: "../public/fonts/jetbrains-mono.ttf",
  variable: "--font-mono-face",
  weight: "100 800",
  display: "swap",
});

const description = `${site.name} — ${site.role.toLowerCase()} in ${site.location}. ${site.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
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

// On a flaky connection a script file can fail mid-download, leaving the page
// half-working. Reload once to recover (at most once a minute, so a genuinely
// offline visitor is never stuck in a reload loop).
const chunkRetryScript = `(function () {
  function recover(reason) {
    var text = String((reason && (reason.name + " " + reason.message)) || reason || "");
    if (!/ChunkLoadError|Loading chunk|Loading CSS chunk/i.test(text)) return;
    try {
      var last = Number(sessionStorage.getItem("chunk-retry") || 0);
      if (Date.now() - last < 60000) return;
      sessionStorage.setItem("chunk-retry", String(Date.now()));
    } catch (e) {
      return;
    }
    location.reload();
  }
  window.addEventListener("error", function (e) { recover(e.error || e.message); });
  window.addEventListener("unhandledrejection", function (e) { recover(e.reason); });
})();`;

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
        <script dangerouslySetInnerHTML={{ __html: chunkRetryScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="btn btn-primary sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200]"
        >
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
