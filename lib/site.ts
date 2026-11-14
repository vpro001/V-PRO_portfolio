/**
 * Everything the public site says about you lives here.
 * Edit this file to change copy, links, stack or services — no page code needed.
 */
export const site = {
  name: "Victor Ikechukwu",
  firstName: "Victor",
  lastName: "Ikechukwu",
  brand: "V-PRO",
  brandFull: "V-PRO Services",
  role: "Full-stack developer & instructor",
  location: "Port Harcourt, Nigeria",
  timeZone: "Africa/Lagos",
  timeZoneLabel: "WAT",
  email: "ikechukwuv052@gmail.com",
  available: true,
  portrait: "/vic.jpg",
  tagline:
    "I design and build web software for businesses, then teach other developers how it was done.",
  intro:
    "I'm a full-stack developer working out of Port Harcourt. Most of my work is the unglamorous middle of a product: the data model, the auth, the payment flow, the admin panel someone has to use every day. I build it in Laravel or Next.js, and I write courses about the parts that took me longest to learn.",
  socials: [
    { label: "GitHub", handle: "Victor070656", href: "https://github.com/Victor070656" },
    { label: "LinkedIn", handle: "victorikechukwu", href: "https://linkedin.com/in/victorikechukwu" },
    { label: "X / Twitter", handle: "@victor10722752", href: "https://x.com/victor10722752" },
  ],
  services: [
    {
      title: "Web applications",
      body: "Business platforms built end to end: data model, backend, interface and deployment. Laravel when the team lives in PHP, Next.js when the product is React-first.",
      tags: ["Laravel", "Next.js", "React", "TypeScript"],
    },
    {
      title: "APIs & backends",
      body: "Clean, documented APIs with role-based access, sensible schemas and queries that stay fast as the tables grow.",
      tags: ["PHP", "Node.js", "MySQL", "MongoDB"],
    },
    {
      title: "Payments",
      body: "Checkout that reconciles. Flutterwave integration with server-side verification and webhooks, so nobody gets access without paying and nobody pays without getting access.",
      tags: ["Flutterwave", "Webhooks", "NGN"],
    },
    {
      title: "Teaching & mentorship",
      body: "Structured, project-based courses and one-to-one mentoring for developers who learn best by building the real thing.",
      tags: ["Courses", "Mentorship", "Code review"],
    },
  ],
  stack: [
    { group: "Backend", items: ["PHP", "Laravel", "Node.js"] },
    { group: "Frontend", items: ["React", "Next.js", "TypeScript", "Tailwind CSS"] },
    { group: "Data", items: ["MySQL", "MongoDB"] },
    { group: "Practice", items: ["API design", "System architecture", "Mentorship"] },
  ],
  principles: [
    {
      title: "Systems first",
      body: "I start from the data and the flows, not the screens. A product with a sound model survives redesigns; the reverse is rarely true.",
    },
    {
      title: "Code the next person can read",
      body: "Plain names, small modules, few surprises. The goal is that someone else can ship a change on their first day.",
    },
    {
      title: "Measure, then tune",
      body: "Performance and reliability are checked with numbers — query plans, response times, error logs — not assumed.",
    },
    {
      title: "Teach by building",
      body: "Every lesson I write ends in working software. Theory is there to explain a decision you just watched me make.",
    },
  ],
} as const;

export const allStack: string[] = site.stack.flatMap((s) => [...s.items]);
