# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Commands

- **Dev server**: `bun run dev` (Turbopack)
- **Build**: `bun run build`
- **Start**: `bun start`
- **Lint**: `bun run lint`
- **Set up database**: `bun run init-db` — creates indexes and the first admin account; safe to re-run

## What this is

Next.js 15 App Router + TypeScript. One site with three parts:

1. **Portfolio** (public) for Victor Ikechukwu / V-PRO Services — `/`, `/about`, `/projects`, `/contact`
2. **Course platform** (LMS) — `/courses`, `/courses/[id]`, `/courses/[id]/learn`, `/certificates/[id]`, `/student/*`
3. **Admin back-office** — `/admin/*`

## Where things live

```
lib/site.ts          ALL public copy: name, bio, services, stack, links. Edit copy here, not in pages.
lib/mongodb.ts       getDb() — one shared connection
lib/auth.ts          NextAuth credentials config (JWT sessions)
lib/session.ts       getSessionUser / requirePageUser (pages) / requireAdmin / requireUser (API routes)
lib/password.ts      scrypt hashing; legacy plain-text passwords are upgraded on next sign-in
lib/data.ts          Queries + serialisers (Mongo docs -> plain DTOs in lib/types.ts)
lib/enrollment.ts    enrollUser (idempotent) and recomputeProgress (issues certificates)
lib/flutterwave.ts   Checkout, verification, fulfilTransaction
lib/validate.ts      Input cleaning for API routes
lib/video.ts         parseVideo — YouTube / Vimeo / Drive / file links
middleware.ts        Guards /admin, /api/admin, /student

components/site/     Public chrome: SiteFrame, SiteHeader, SiteFooter, WorkList, etc.
components/courses/  CourseCard, EnrollButton, VideoPlayer, LearnClient
components/dash/     DashShell (shared sidebar for student + admin), PageHeader, forms
components/admin/    CourseForm, LessonManager, ProjectManager, ConfirmButton (ActionButton)
app/admin/(panel)/   Admin pages (the route group keeps /admin/signin outside the admin layout)
```

## Conventions

- **Pages are Server Components that read the database directly** through `lib/data.ts`. Route
  handlers under `app/api` exist only for mutations. After a mutation, client components call
  `router.refresh()`.
- **Never send lesson `videoUrl`s to someone who isn't enrolled.** `serializeCourse(doc)` strips
  them by default; pass `{ withVideo: true }` only after checking enrolment or admin role.
- **Every admin API route starts with `requireAdmin()`**; middleware is a second layer, not the only one.
- **Payments**: who bought what comes from the `payment_initializations` record matched by
  `tx_ref`, never from request input. `fulfilTransaction` is idempotent and is called from both
  the return page and the webhook.
- **Don't invent content.** No placeholder stats, testimonials or sample courses. Empty states
  say what's actually true.

## Data model (MongoDB)

- `users` — admins. `students` — learners. Separate collections; the session `role` says which.
- `courses` — lessons are embedded (`lessons[]`, each with its own `_id`, `order`, `isPublished`). Prices are in NGN.
- `enrollments` — one per (userId, courseId); holds `progress`, `completedLessons[]`, `certificate`.
- `progress` — one per (userId, courseId, lessonId); holds `completed`, `lastPosition`.
- `payments`, `payment_initializations` — Flutterwave records keyed by `txRef`.
- `projects` — portfolio items. `messages` — contact form inbox.

## Styling

Tailwind CSS v4. Design tokens are CSS variables in `app/globals.css`, exposed as utilities:
`bg-bg`, `bg-raised`, `bg-sunk`, `text-ink`, `text-dim`, `border-line`, `border-line-strong`,
`bg-accent`, `text-on-accent`, `text-ember`, `text-danger`. Dark is the default;
`[data-theme="light"]` on `<html>` swaps every token. **Use tokens, never raw hex**, so both
themes keep working.

Shared component classes: `.shell` (page container), `.display` / `.serif-accent` (headline
type), `.eyebrow`, `.btn` (+ `.btn-primary`, `.btn-sm`, `.btn-icon`, `.btn-danger`), `.field`,
`.label`, `.hint`, `.panel`, `.tag`, `.notice`, `.table`, `.progress`.

Fonts: Bricolage Grotesque (display), Instrument Serif italic (accent words), Geist (body),
JetBrains Mono (labels).

## Environment

See `.env.example`. Required: `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`.
For paid courses: `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_SECRET_HASH` (webhook).
Admin → Settings shows which of these are set.
