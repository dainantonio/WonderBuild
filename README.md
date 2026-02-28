# KidBuild Studio (MVP)

KidBuild Studio is a mobile-first, safety-first PWA for kids to build educational projects from guided templates.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Route Handlers for CRUD
- PWA manifest + service worker cache

## Features
- Kid mode by default with template-driven builders.
- Parent mode behind PIN (`1234` in seed/dev default).
- Templates: Story, Quiz, Flashcards, Mini-game (tap-to-score config).
- Remix support (difficulty/theme tweaks) from builder screen.
- Safety layer blocks profanity/sexual/extreme violence/self-harm/hate terms, external URLs, and redacts PII.
- Parent dashboard: age band, allowed categories, delete/export-ready JSON view, share approval gating.
- Share links created by random token only after parent approval.

## Required models
- `UserProfile`: `id`, `role`, `parentPinHash`, `ageBand`, `allowedCategories[]`
- `Project`: `id`, `templateType`, `title`, `dataJson`, `safetyFlags[]`, `isShareApproved`, `createdAt`, `updatedAt`

## Local run
```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Open `http://localhost:3000`.

## Test
```bash
npm run test
```

## QA test plan
1. **Kid creation flow**
   - Create one project from each template.
   - Verify generated playable JSON appears immediately.
2. **Safety**
   - Enter URL and email in project inputs.
   - Verify text is redacted/blocked and safety flags appear.
3. **Parent PIN**
   - Open Parent mode, enter wrong PIN (expect failure), then `1234` (expect unlock).
4. **Parent controls**
   - Update age level + category toggles and save.
   - Approve share and verify `/s/{token}` loads.
5. **Share gating**
   - Attempt to approve share before unlocking parent mode (expect error).
6. **Offline basics**
   - Load once, then use browser offline mode and refresh home route.

## Happy-path E2E checklist
- Launch app on mobile viewport.
- Build Story project with guided prompts.
- Tap Remix.
- Enter Parent mode with PIN, approve share.
- Open share URL and verify read-only project view.
