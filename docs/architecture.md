# Architecture

Keep dependencies pointing toward the business logic. Introduce concrete features only when requirements exist.

- `src/domain/`: framework-independent business types, rules, and contracts. No imports from outer layers.
- `src/application/`: use cases and integration ports; depends on domain. Dependencies are passed explicitly.
- `src/infrastructure/`: implementations of application ports, such as a CMS client or email provider.
- `src/presentation/components/`: reusable UI. Add feature-specific subfolders as needed.
- `src/app/`: Next.js routes, layouts, and composition of use cases with infrastructure. Keep route files small as features grow.
- `src/config/`: site and environment configuration. Never expose secrets through client imports.
- `public/images/`: approved public image assets.

Domain and application logic must not depend on Next.js, React, or infrastructure. ESLint checks common import boundaries; reviews should check transitive dependencies as features are added. Use `@/` imports across folders.

Prefer Server Components. Use Client Components only for browser state and interaction. Validate external input at the boundary. Keep private integration code server-side. Add tests for business rules and important behavior when those features are introduced.

No database, CMS, authentication, analytics, or delivery provider has been selected. Those choices depend on the upcoming site requirements.

## Implemented enquiry flow

`src/domain/enquiries/enquiry.ts` owns input validation and the plain-text enquiry representation. `src/application/enquiries/submit-enquiry.ts` defines a delivery port. The Resend adapter in `src/infrastructure/email/` implements that port. `src/app/api/enquiries/route.ts` provides the HTTP boundary and composes the adapter with the use case. The form component handles presentation state and the explicit email-draft fallback.

## Content and UI

`src/content/` contains editorial content and image metadata. Route components compose the shared presentation components, keeping company identity in `src/config/site.ts`. Client components are limited to navigation, search/filtering, the gallery viewer and forms. The remaining pages are Server Components. Add new features within these boundaries rather than putting unrelated code in a root-level utility file.
