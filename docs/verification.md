# Verification

## Automated checks

- Production build: all routes compile and generate successfully.
- Strict TypeScript check: passed.
- ESLint: passed after correcting the PostCSS configuration export.
- Six domain tests: valid application, consent/profile validation, malformed email/header injection/length limits, contact requirements, field types, and email body content.

## Browser checks

A separate headless Chrome profile was used because the in-app browser connection was unavailable. No signed-in browser profile was inspected.

Checked desktop and mobile rendering, homepage assets, all page headings, mobile navigation toggle and Escape handling, resource category filtering, native FAQ expansion, required form fields, and the email-draft fallback. No live email was sent. All 16 public content pages and 17 discovered local links returned HTTP 200. The API rejected cross-origin requests (403), invalid input (400), and oversized bodies (413), and correctly returned 503 when delivery was unconfigured. The gallery opened, advanced and closed with Escape. No browser runtime errors were observed. No horizontal overflow was found at 360, 390, 768, 1024 or 1440 pixels.

Screenshots are stored under `artifacts/`. The homepage hero and gallery photographs are user supplied. The generated landscape remains in the asset library but is no longer used as the homepage hero. Director names, biographies and individual portraits remain pending.

## Deployment dependencies

Production uses Netlify Forms with submission notifications configured for the cooperative address. Keep form detection and the notification hook enabled when changing hosting settings. The email-draft workflow remains available as a fallback.

## Dependency audit

The full npm audit reported five high-severity entries in development-only lint tooling, all stemming from `braces`. No patched `braces` release was available in the registry during setup. Avoid applying `npm audit fix --force`, which suggests downgrading the Next ESLint configuration across major versions. Track the upstream patch and re-run checks after updating.
