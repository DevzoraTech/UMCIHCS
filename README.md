# UMCIHCS corporate web app

A locally maintained Next.js application for the Uganda Medical Cannabis and Industrial Hemp Cooperative Society. This is a new design; the earlier website was used only to recover identity and project context.

- Production: https://umcihcs-uganda.netlify.app
- Source: https://github.com/DevzoraTech/UMCIHCS

## Run locally

Node.js 22 is recommended (`nvm use`).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For a production preview, run `npm run build` followed by `npm start`.

## Pages and features

- Home, About, Leadership, Gallery, Focus Areas and three focus detail pages.
- Membership, membership application, Contact and Privacy.
- Searchable/filterable resources and three introductory articles.
- Responsive navigation, keyboard-accessible gallery viewer and membership FAQs.
- User-provided badge, brand artwork and three company photographs; clearly labeled placeholders for outstanding portraits.
- Application and contact validation; email draft fallback; optional direct delivery.

## Forms

By default, forms validate input and prepare an email draft addressed to `bonnykapere@gmail.com`. The visitor reviews and sends it in their email application. The UI never reports that an unsent draft has been submitted.

For direct delivery, copy `.env.example` to `.env.local`, configure `RESEND_API_KEY` and `ENQUIRY_FROM_EMAIL` using a verified sender domain, then restart the app. The default destination can be changed with `ENQUIRY_TO_EMAIL`. The server validates input, checks same-origin requests, limits payload size, applies a honeypot and basic per-instance throttling, and uses an idempotency key. No application database is created. The current throttle is a basic safeguard; use hosting-level rate limiting for public traffic across serverless instances.

Email delivery has not been tested against a live provider. No test messages were sent. Resend setup: https://resend.com/docs/api-reference/emails/send-email

## Validation

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

Browser checks and screenshots are described in `docs/verification.md`. The npm audit currently reports five high-severity development-tool dependency entries arising from `braces` through the Next ESLint plugin. The installed latest `braces` release has no patched version at the time of setup. The audit's suggested fix downgrades Next's ESLint configuration to v14 and is not applied. ESLint 10 executes successfully, although some upstream plugins still declare peer support only through ESLint 9.

## Content and assets

- Site identity and navigation: `src/config/site.ts`.
- Focus areas, resources and photo metadata: `src/content/`.
- Original company images: `public/images/`.
- Reusable layouts and UI: `src/presentation/components/`.
- The three director cards are placeholders, not representations of actual named directors.
- Introductory copy is draft website copy; no claims about licenses, membership counts, founding dates, fees or named leadership are added.

See `docs/assets.md` for image provenance and the generated landscape prompt. Add approved director names, roles, biographies and photographs before publication. Review the final content and privacy notice with the cooperative.

## Netlify

`netlify.toml` specifies the build and Node version. Netlify's Next.js support handles the dynamic forms and API route; do not use a static export. The production project is `umcihcs-uganda`, and `NEXT_PUBLIC_SITE_URL` is configured so the sitemap uses the live URL. Configure the email variables if direct delivery is required.

The current production deployment was uploaded with Netlify CLI. The GitHub repository is not yet connected to Netlify's continuous-deployment webhook; connect it in the Netlify project dashboard when automatic deploys from `main` are desired.

See `docs/architecture.md` for dependency boundaries.
