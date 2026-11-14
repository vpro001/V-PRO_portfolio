# V-PRO — portfolio & course platform

The personal site of Victor Ikechukwu: a portfolio, a course platform with Flutterwave
payments and verifiable certificates, and an admin back-office. Next.js 15, TypeScript,
Tailwind CSS v4, MongoDB, NextAuth.

## Getting started

```bash
bun install
cp .env.example .env.local   # then fill in MONGODB_URI and NEXTAUTH_SECRET
bun run init-db              # creates indexes + your admin account (prints the password once)
bun run dev
```

Open http://localhost:3000. Sign in to the back-office at `/admin/signin`.

## Day to day

| I want to…                         | Where                                                        |
| ---------------------------------- | ------------------------------------------------------------ |
| Change my bio, services, links     | `lib/site.ts`                                                |
| Add or edit portfolio projects     | Admin → Projects (tick “Feature on the homepage”)            |
| Create a course and add lessons    | Admin → Courses → New course                                 |
| Enrol someone who paid by transfer | Admin → Enrolments → Grant access manually                   |
| Read contact-form messages         | Admin → Messages                                             |
| Check payments are configured      | Admin → Settings → Setup checklist                           |

Lesson videos can be YouTube (unlisted is fine), Vimeo, Google Drive, or a direct `.mp4` link.

## Taking payments

1. Put your Flutterwave **secret key** in `FLUTTERWAVE_SECRET_KEY`.
2. In the Flutterwave dashboard, add a webhook pointing at
   `https://YOUR-DOMAIN/api/payments/webhook`, choose a secret hash, and put the same value in
   `FLUTTERWAVE_SECRET_HASH`.
3. Set `NEXTAUTH_URL` to your live address so buyers are sent back to the right place.

Every payment is verified with Flutterwave on the server before a student is enrolled.

See `CLAUDE.md` for how the code is organised.
