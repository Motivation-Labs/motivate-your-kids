# Motivate Kids Rebuild Refactor Plan And Agent Tickets

Generated from: `prd.md` and `UX_JOURNEYS_AND_LAYOUTS.md`
Date: 2026-06-02
Status: Linear-ready ticket plan, not yet created in Linear

## Deployment Recommendation

Target route: `https://app.motivationlabs.ai/kid`

This is a good setup if `app.motivationlabs.ai` is the shared Motivation Labs
application host and Motivate Kids is one product inside a broader app suite. It
gives one auth domain, one app shell strategy, and room for future routes such
as `/money`, `/team`, `/me`, and `/kid`.

Tradeoffs to handle deliberately:

- The current app is root-routed. Deploying at `/kid` requires a real base-path
  pass across routes, links, auth redirects, manifest, service worker scope,
  analytics, and Supabase redirect URLs.
- PWA installability must use `/kid` as `start_url` and scope.
- Supabase OAuth/OTP redirect URLs must include
  `https://app.motivationlabs.ai/kid/auth/callback`.
- If the product name remains "Motivate Kids", `/kids` is semantically cleaner.
  `/kid` is acceptable if Motivation Labs wants short singular product slugs.

Recommendation: use `/kid` if the product suite standard is singular product
slugs. Otherwise prefer `/kids` before implementation starts, because changing
later affects deep links, PWA installs, invite URLs, and OAuth redirects.

## Refactor Strategy

The current implementation can be shut down as the primary mode. Treat the
rebuild as a new mobile-first product surface rather than trying to preserve
the old localStorage chore-chart architecture.

### Phase 0: Freeze And Redirect

- Preserve current production behavior only long enough to avoid breaking
  existing users during the rebuild.
- Stop adding features to the old localStorage-first flow.
- Introduce `/kid` as the target product route.
- Add redirects from legacy routes once the new shell is usable.

### Phase 1: Foundation

- Establish JavaScript-first app conventions while keeping build tooling stable.
- Create Supabase schema for the new model.
- Define permissions, auth flows, media storage, audit events, and invite rules.
- Add Animal Island design tokens and GSAP motion primitives.

### Phase 2: Private Family MVP

- Build auth, family setup, adult home, kid profile, task catalog, check-ins,
  star ledger, rewards, wishlist, and approvals.
- Keep the first production experience WAP/mobile web.

### Phase 3: Social And Media Expansion

- Add interest groups, group tasks, ranking/scoring, media moderation, and
  social safety controls.

### Phase 4: Agent Interfaces And Rollout

- Add read-only MCP/CLI inspection first.
- Add deployment hardening, PWA installability, observability, and mobile smoke
  tests.
- Prepare packaged Android/iOS app strategy after WAP stabilizes.

## Project Structure

Initiative: Motivate Kids mobile web rebuild

Project: WAP-first Motivate Kids at `app.motivationlabs.ai/kid`

Milestones:

- M0: Direction, routing, and shutdown plan
- M1: JavaScript/Supabase/Animal Island foundation
- M2: Private family MVP
- M3: Media, groups, and safe social
- M4: MCP/CLI and rollout readiness

## Dependency Map

- T01 -> blocks all tickets
- T02 -> blocks T03, T04, T05, T06, T07, T08, T09
- T03 -> blocks T05, T10, T11
- T04 -> blocks T06, T07, T08, T09, T10, T11
- T05 -> blocks T06, T07, T08
- T06 -> blocks T07, T08, T10
- T07 -> blocks T08
- T08 -> blocks T11
- T09 -> blocks T10, T11
- T12 -> parallel after T02
- T13 -> blocks T14
- T14 -> blocks T15
- T15 -> final rollout gate

Parallelizable after foundation:

- T05, T09, T12 can run in parallel after T02/T03/T04 contracts exist.
- T10 and T11 can run in parallel after media/task foundations exist.
- T13 can run in parallel with private MVP once data contracts stabilize.

## Tickets

### T01 [M0] [Discovery] Decide `/kid` routing, shutdown scope, and migration stance

Linear title: Decide Motivate Kids `/kid` route and legacy shutdown plan

Goal and context:

Lock the deployment shape and refactor stance before implementation begins. The
PRD allows shutting down the current mode; this ticket turns that into concrete
routing, redirect, and migration decisions.

Scope:

- Decide whether final route is `/kid` or `/kids`.
- Document legacy route behavior during rebuild.
- Decide whether old localStorage data gets migration support, export-only
  support, or no support.
- Identify all production URLs, auth callbacks, invite URLs, and PWA scope
  changes.
- Produce a short architecture decision record.

Out of scope:

- Implement redirects.
- Build new app shell.
- Change Supabase schema.

Acceptance criteria:

- ADR names the final route and why.
- ADR states whether old app mode is frozen, hidden, redirected, or removed.
- ADR lists old routes and their target behavior.
- ADR lists required Supabase redirect URLs.
- ADR lists PWA manifest and service worker scope impact.

Engineering quality bar:

- No ambiguous "TBD" route decision remains.
- Decision is reviewable by product and engineering before code changes.

Implementation notes:

- Current app is root-based with routes like `/parent`, `/kids/[id]`,
  `/setup`, `/login`, `/signup`.
- `/kid` deployment likely requires `basePath` or a parent app rewrite.
- If choosing `/kid`, all generated invite links must include `/kid`.

Files to inspect:

- `prd.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `next.config.mjs`
- `middleware.ts`
- `app/manifest.ts`
- `app/auth/callback/route.ts`
- `app/invite/[...segments]/page.tsx`

Dependencies:

- None.

Verification:

- ADR exists and is linked from `prd.md`.
- Product owner confirms route and shutdown stance.

### T02 [M1] [Foundation] Create JavaScript-first `/kid` app shell and routing base

Linear title: Create mobile web `/kid` app shell and routing foundation

Goal and context:

Create the WAP-first app surface that will replace the current mode. The app
should be mobile-first, JavaScript/JSX-forward, and deployable under the chosen
`/kid` route.

Scope:

- Configure route/base-path behavior for `/kid`.
- Create a new app shell for adult and kid mobile web flows.
- Establish JavaScript/JSX conventions for new rebuild files.
- Add route groups or folder structure for auth, adult, kid, groups, rewards,
  approvals, and settings.
- Add placeholder screens that prove navigation and routing.
- Add safe-area and mobile viewport primitives.

Out of scope:

- Full feature implementation.
- Supabase schema changes.
- GSAP celebration implementation.

Acceptance criteria:

- `/kid` loads a mobile-first shell.
- Auth, adult, kid, groups, rewards, approvals, and settings placeholders are
  reachable.
- Existing root routes are not accidentally broken unless the ADR says to
  redirect them now.
- PWA metadata can resolve under `/kid`.
- New rebuild files avoid TypeScript-specific syntax unless build tooling still
  requires wrapper files.

Engineering quality bar:

- Routing decisions are centralized.
- No hard-coded root-only links in new shell.
- Mobile layout works at 375px width.

Implementation notes:

- Existing repo is TypeScript-heavy. New rebuild can use `.jsx`/`.js` while
  keeping config files stable.
- If Next `basePath` is used, verify assets, API routes, and Supabase callbacks.
- Consider a transitional shell under `app/kid/*` if full basePath would be too
  disruptive.

Files to inspect:

- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `next.config.mjs`
- `middleware.ts`
- `components/ParentNav.tsx`
- `components/KidNav.tsx`

Dependencies:

- T01.

Verification:

- `npm run build`
- Manual browser check at `/kid` or configured local equivalent.
- Mobile viewport screenshot at 375px.

### T03 [M1] [Foundation] Define Supabase schema for family, kid, tasks, media, rewards, groups, and audit

Linear title: Define Supabase schema for Motivate Kids rebuild

Goal and context:

Replace the old localStorage-first model with a Supabase Postgres model matching
the simplified PRD.

Scope:

- Create migrations for core tables:
  `families`, `family_members`, `kids`, `kid_profiles`, `tasks`,
  `task_assignments`, `check_ins`, `media_assets`, `categories`, `rewards`,
  `reward_requests`, `wishlist_items`, `badges`, `kid_badges`,
  `star_transactions`, `social_groups`, `group_memberships`, `group_tasks`,
  `group_scores`, `group_rankings`, `approvals`, `app_settings`,
  `audit_events`, `mcp_clients`, `cli_tokens`.
- Add enums for roles, approval status, media type, task type, transaction type,
  auth/provider identity where useful.
- Add indexes for family, kid, status, created_at, and group lookups.
- Add RLS policies for family-scoped data.
- Add storage buckets or storage policy migration notes for voice, video, photo,
  avatar, and wishlist images.

Out of scope:

- UI.
- Data access client implementation.
- Real content moderation automation.

Acceptance criteria:

- Schema supports the PRD data model and invariants.
- All family-owned records are scoped by `family_id`.
- All kid-owned records are scoped by `kid_id`.
- Media assets have owner, scope, type, storage path, and moderation status.
- Star balances can be computed from transactions.
- RLS prevents users outside a family from reading family data.

Engineering quality bar:

- Migrations are idempotent where practical.
- RLS helper functions are documented.
- No invite token stored in plaintext if invite tokens are added.

Implementation notes:

- Existing migrations already cover an older schema. Prefer new additive
  rebuild migrations or a clearly named reset migration only if approved.
- Decide whether to retire old tables or version new tables with clean names.

Files to inspect:

- `supabase/migrations/*.sql`
- `types/index.ts`
- `lib/supabase/database.ts`
- `prd.md`

Dependencies:

- T01.

Verification:

- Run Supabase migration locally or in a staging project.
- Verify RLS with at least owner, trusted adult, unrelated user, and kid-mode
  cases.
- Add schema notes to a migration README or ticket comment.

### T04 [M1] [Foundation] Build Supabase data access layer and permission contracts

Linear title: Build data access and permission contracts for rebuild

Goal and context:

Create the JavaScript data layer that all app screens use. Keep permission
rules consistent across adults, kids, groups, media, approvals, MCP, and CLI.

Scope:

- Add Supabase client helpers for browser and server contexts.
- Add data access modules for families, members, kids, tasks, check-ins, media,
  rewards, wishlist, approvals, groups, and audit events.
- Add permission helpers for family admin, trusted adult, kid session, and
  agent/CLI.
- Add common result/error shapes for UI.
- Add idempotency helpers for star awards, reward approvals, and check-ins.

Out of scope:

- Full UI.
- MCP server implementation.
- CLI implementation.

Acceptance criteria:

- Screens can fetch current family context from a single helper.
- Family membership is resolved through `family_members`, not owner-only lookup.
- Permission helpers cover every sensitive action from the PRD.
- Data access functions return typed or documented JS object shapes.
- Star ledger helper computes balance from transactions.

Engineering quality bar:

- No component directly spreads Supabase query details everywhere.
- Data access is testable without rendering React.
- Error messages are safe for family users and useful for logs.

Implementation notes:

- Existing `context/FamilyContext.tsx` is large and mixes localStorage,
  reducers, and Supabase migration logic. Treat it as reference, not foundation.
- Preserve useful helper logic from `lib/helpers.ts` and shared packages where
  appropriate.

Files to inspect:

- `context/FamilyContext.tsx`
- `lib/supabase/client.ts`
- `lib/supabase/server.ts`
- `lib/supabase/database.ts`
- `lib/helpers.ts`
- `packages/shared/src/helpers.ts`

Dependencies:

- T03.

Verification:

- Unit tests for balance, permissions, idempotency, and family lookup.
- Manual query tests for owner, trusted adult, kid, unrelated user.

### T05 [M2] [Vertical slice] Implement auth and family onboarding

Linear title: Implement auth and family onboarding for mobile web

Goal and context:

Let adults authenticate and create the first usable family system in under 10
minutes.

Scope:

- Support required auth methods:
  account ID + password, email OTP, SMS OTP.
- Keep Google OAuth and WeChat OAuth as planned provider hooks, not required
  for this ticket.
- Build welcome/auth flow for mobile web.
- Build family creation flow.
- Build adult profile setup with role.
- Build first kid creation with avatar and optional voice intro prompt.
- Build starter task and starter reward/wishlist setup.
- Redirect authenticated adults into `/kid` family context.

Out of scope:

- Google OAuth and WeChat OAuth.
- Full kid dashboard.
- Social groups.

Acceptance criteria:

- Adult can sign up/sign in with account ID + password.
- Adult can complete email OTP flow.
- SMS OTP path exists and is wired to Supabase config or clearly gated by
  environment support.
- Adult creates family, adult member, first kid, starter tasks, and starter
  reward/wishlist item.
- Invite links require auth before granting family access.
- Setup can be completed on 375px mobile viewport.

Engineering quality bar:

- Auth redirect preserves intended route.
- Error states are clear and non-technical.
- No family access is granted before adult auth.

Implementation notes:

- Current app has `/login`, `/signup`, `/signup/verify`, and middleware.
- Existing invite flow had auth-linking risk; do not repeat it.
- Account ID may need a profile table or normalized login identifier strategy
  because Supabase Auth is email/phone centric by default.

Files to inspect:

- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/signup/verify/page.tsx`
- `middleware.ts`
- `app/setup/page.tsx`
- `app/invite/[...segments]/page.tsx`
- `lib/supabase/database.ts`

Dependencies:

- T02, T03, T04.

Verification:

- Auth smoke tests for password, email OTP, SMS OTP where supported.
- Manual mobile setup walkthrough.
- Confirm family membership row is linked to authenticated user.

### T06 [M2] [Vertical slice] Build adult home, task catalog, and award stars flow

Linear title: Build adult home and star award flow

Goal and context:

Give parents and trusted adults the fastest daily workflow: select a kid, pick
a task or custom award, optionally attach memo, and award stars.

Scope:

- Adult home with kid cards, stars, streak summary, pending approvals strip,
  and recent activity.
- Task catalog for family routine, learning, chore, creativity, health,
  behavior, group challenge, and custom task types.
- Award bottom sheet with task selection, amount, optional text/voice/photo/video
  memo hooks, and confirm.
- Star transaction creation with idempotency.
- GSAP Level 1 award animation.

Out of scope:

- Full media upload implementation if T09 is not complete.
- Badge unlock animation beyond hook.
- Social group tasks.

Acceptance criteria:

- Adult can view kids on home.
- Adult can create/edit/archive tasks.
- Adult can award stars from a kid card.
- Award creates an approved `star_transactions` row and activity/audit event.
- Kid balance updates from ledger.
- Routine award animation runs and respects reduced motion.

Engineering quality bar:

- Award flow is fewer than 3 taps for common tasks.
- Duplicate taps do not create duplicate awards.
- Works on mobile browser with thumb-friendly controls.

Implementation notes:

- Award is the dominant adult CTA.
- Keep adult UI product-clear, even with Animal Island surfaces.
- Use GSAP only for meaningful award feedback.

Files to inspect:

- `app/parent/page.tsx`
- `app/parent/actions/page.tsx`
- `components/LogActionFab.tsx`
- `components/FloatingStarLabel.tsx`
- `lib/confetti.ts`
- `UX_JOURNEYS_AND_LAYOUTS.md`

Dependencies:

- T04, T05.

Verification:

- Unit test for balance update.
- Browser test for award flow.
- Reduced-motion manual check.

### T07 [M2] [Vertical slice] Build kid island, task check-ins, and kid-safe states

Linear title: Build kid island dashboard and check-in flow

Goal and context:

Build the kid-facing core: a visual island dashboard, today's task path, and
simple check-in submission.

Scope:

- Kid island home with avatar, name, star balance, island task path, today's
  tasks, streak strip, and badges preview.
- Kid task detail.
- Check-in mode selector: speak, video, photo, text.
- Kid-safe status states: Sent, Waiting for grown-up, Done, Try again.
- Create `check_ins` rows with pending/approved status depending on task rules.

Out of scope:

- Full social groups.
- Reward catalog.
- Advanced media moderation UI.

Acceptance criteria:

- Kid can enter family-scoped kid mode.
- Kid sees assigned tasks only.
- Kid can submit text check-in.
- Voice/video/photo controls are present and integrate with media layer when
  T09 is available.
- Pending check-ins appear in adult approvals when approval is required.
- No adult admin controls appear in kid mode.

Engineering quality bar:

- Minimal reading required.
- 44px minimum tap targets.
- No hover-only interactions.
- Works at 375px width.

Implementation notes:

- Avoid dense adult dashboard patterns for kid UI.
- Keep check-in status visually obvious.

Files to inspect:

- `app/kids/[id]/page.tsx`
- `app/kids/[id]/layout.tsx`
- `components/KidNav.tsx`
- `components/AvatarDisplay.tsx`
- `UX_JOURNEYS_AND_LAYOUTS.md`

Dependencies:

- T05, T06.

Verification:

- Browser smoke test for kid mode.
- Check-in submission creates correct records.
- Adult approval queue sees pending check-in.

### T08 [M2] [Vertical slice] Build rewards, wishlist, and redemption approvals

Linear title: Build rewards, wishlist, ecommerce references, and redemption approvals

Goal and context:

Let kids work toward concrete rewards, including custom cards, Taobao links,
other ecommerce SKUs, and uploaded photos, while adults retain approval.

Scope:

- Reward catalog for adults.
- Kid rewards and wishlist view.
- Wishlist item creation/suggestion.
- Fields for title, description, star cost, source URL, platform, SKU/product
  ID, photo, and notes.
- Taobao and generic ecommerce reference handling.
- Reward request flow.
- Adult approval/denial.
- Star deduction on approval only.
- GSAP reward approval celebration hook.

Out of scope:

- Ecommerce purchasing or fulfillment.
- Browser extension/share-sheet capture unless separately scoped.
- Public social sharing of wishlist.

Acceptance criteria:

- Adult can create reward or wishlist card.
- Kid can suggest a wishlist item for adult approval.
- Taobao/product URL and SKU fields persist.
- Adult can approve a suggestion into an active reward.
- Kid can request an affordable reward.
- Approval deducts stars once and denial does not deduct.

Engineering quality bar:

- Reward approval is idempotent.
- Ecommerce links are clearly references only.
- Photo upload uses media asset contract.

Implementation notes:

- Treat wishlist suggestions as approval records.
- Use source platform labels, not scraped purchase claims.

Files to inspect:

- `app/parent/rewards/page.tsx`
- `app/parent/approvals/page.tsx`
- `app/kids/[id]/rewards/page.tsx`
- `components/PhotoCapture.tsx`
- `lib/helpers.ts`

Dependencies:

- T06, T07, T09 for photo upload.

Verification:

- Unit test reward approval idempotency.
- Browser test kid request -> adult approve -> balance deduction.
- Test Taobao/generic URL persistence.

### T09 [M2] [Integration] Build media capture, upload, playback, and moderation primitives

Linear title: Build media capture and Supabase Storage primitives

Goal and context:

Support video, text, voice memo, image/photo attachments, kid voice intros, and
wishlist photos safely.

Scope:

- Media asset data access.
- Supabase Storage upload helpers.
- Voice recorder with 10-second mode for kid profile intro.
- Voice memo support for check-ins.
- Video memo support with configurable max length.
- Photo/image upload support.
- Playback components.
- Permission and browser capability states.
- Basic moderation status: pending, approved, hidden, removed.

Out of scope:

- Automated AI moderation.
- Native app camera plugins.
- Long-form video editing.

Acceptance criteria:

- Adult/kid can record or upload supported media in mobile browser where
  permissions allow.
- Media upload creates `media_assets` row.
- Kid profile voice intro is capped at 10 seconds.
- Check-in media can be previewed in approvals.
- Permission denied and unsupported browser states are handled.

Engineering quality bar:

- No base64 localStorage storage for production media.
- Upload errors are recoverable.
- Media access is family/kid scoped.

Implementation notes:

- Existing `VoiceRecorder.tsx` and `PhotoCapture.tsx` are useful references but
  should be adapted to Supabase Storage.
- Mobile Safari constraints must be tested early.

Files to inspect:

- `components/VoiceRecorder.tsx`
- `components/PhotoCapture.tsx`
- `lib/supabase/database.ts`
- `supabase/migrations/004_transaction_attachments.sql`
- `app/parent/history/[id]/page.tsx`

Dependencies:

- T03, T04.

Verification:

- Manual iOS Safari and Android Chrome media permission checks.
- Upload/playback smoke tests.
- Unit tests for media asset ownership/scope helpers.

### T10 [M3] [Vertical slice] Build social interest groups and safe group membership

Linear title: Build safe social interest groups

Goal and context:

Add parent-approved interest groups where kids can share streaks and complete
group tasks without public social-network risk.

Scope:

- Adult create/approve group.
- Group detail island view.
- Kid request-to-join flow.
- Adult approval for group join.
- Group membership management.
- Group tasks and check-ins.
- Group feed showing approved check-in summaries only.
- Parent remove kid from group.

Out of scope:

- Direct messaging.
- Public group discovery.
- Sticker reactions.
- External group invites beyond family/admin controlled flow.

Acceptance criteria:

- Adult can create a group.
- Kid can request to join.
- Adult can approve/deny.
- Kid sees approved group.
- Kid can submit group task check-in.
- Group feed only shows approved content.

Engineering quality bar:

- No kid-to-kid unrestricted communication.
- Group visibility is permissioned.
- Safety controls are visible to adult admins.

Implementation notes:

- Build group flows around "interest islands."
- Keep ranking optional and separate from group membership.

Files to inspect:

- `UX_JOURNEYS_AND_LAYOUTS.md`
- New group routes under `/kid`
- `app/parent/approvals/page.tsx`

Dependencies:

- T04, T07, T09.

Verification:

- Browser test group join approval.
- RLS test kid cannot access unapproved group.
- Adult can remove kid from group.

### T11 [M3] [Vertical slice] Build group scoring, streak sharing, and rankings

Linear title: Build group scoring, streak sharing, and rankings

Goal and context:

Make safe social motivation visible through group-scoped scoring and rankings
without shaming kids.

Scope:

- Scoring model using check-ins, streak length, stars earned, badge progress,
  task difficulty, and consistency.
- Weekly, monthly, all-time score windows.
- Group rankings view.
- Family-level toggle to disable ranking for a kid.
- GSAP ranking movement animation.
- Encouraging copy and progress-oriented labels.

Out of scope:

- Global rankings.
- Public leaderboards.
- Competitive messaging that emphasizes failure.

Acceptance criteria:

- Group score updates after approved group check-ins.
- Ranking is group-scoped.
- Weekly/monthly/all-time windows work.
- Admin can disable ranking for a kid.
- Ranking movement animates and respects reduced motion.

Engineering quality bar:

- Score calculations are deterministic and tested.
- Ranking access follows group membership permissions.
- UI copy avoids shaming.

Implementation notes:

- Consider materialized score rows if direct calculation becomes slow.
- Use GSAP FLIP-style movement for rank changes if practical.

Files to inspect:

- `components/DailyPointsChart.tsx`
- `lib/helpers.ts`
- `packages/shared/src/helpers.ts`
- New group score modules.

Dependencies:

- T08, T10.

Verification:

- Unit tests for scoring.
- Browser test rank change.
- Permission test for non-member access.

### T12 [M1] [Foundation] Implement Animal Island design system and GSAP motion primitives

Linear title: Implement Animal Island design tokens and GSAP motion primitives

Goal and context:

Create the visual and motion foundation before building full screens, so the
rebuild feels coherent and not like patched legacy UI.

Scope:

- Define Animal Island-inspired tokens for color, radius, spacing, typography,
  surface, elevation, and safe-area layout.
- Create core components:
  IslandCard, AdultActionCard, BottomSheet, RewardCard, MediaRecorderShell,
  ApprovalCard, GroupScoreRow.
- Add GSAP helpers for star burst, count-up, badge reveal, reward celebration,
  streak path glow, and ranking reorder.
- Add reduced-motion support.
- Add mobile viewport/safe-area utilities.

Out of scope:

- Full screen implementation.
- Final artwork production.
- Native haptic integration.

Acceptance criteria:

- Components are usable in Storybook-like local preview or route sandbox.
- Motion helpers can be called from feature screens.
- Reduced-motion setting disables non-essential animation.
- Tokens are documented.

Engineering quality bar:

- Components have consistent states: default, hover where relevant, focus,
  active, disabled, loading, error.
- No animation of expensive layout properties where avoidable.
- No decorative motion without state meaning.

Implementation notes:

- Existing design docs are useful but should yield to Animal Island direction.
- GSAP is not currently in dependencies, so add it when implementing.

Files to inspect:

- `DESIGN_SYSTEM.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `app/globals.css`
- `tailwind.config.ts`
- `packages/ui/src/tailwind-preset.ts`
- `package.json`

Dependencies:

- T02.

Verification:

- Visual review at 375px, 390px, 430px.
- Reduced-motion manual check.
- `npm run build`

### T13 [M4] [Integration] Add read-only MCP server for family-safe inspection

Linear title: Add read-only MCP server for Motivate Kids inspection

Goal and context:

Expose structured, permissioned product data to tools like OpenClaw, Hermes,
Codex, Claude Code, and OpenCode, starting read-only.

Scope:

- Define MCP server entrypoint.
- Add auth/scoped token validation for MCP clients.
- Expose read-only resources/tools:
  family summary, task catalog, approval queue, kid progress summary, group
  summary, audit log.
- Ensure sensitive kid data is minimized.
- Log MCP access to audit events.

Out of scope:

- Write actions.
- Direct child media download unless explicitly scoped.
- Full connector marketplace packaging.

Acceptance criteria:

- Admin/developer can register an MCP client.
- MCP client can list allowed resources.
- MCP reads are permission-checked.
- Audit log records client access.
- Output shapes are documented.

Engineering quality bar:

- Defaults are read-only.
- No secrets in logs.
- Works locally and in deployed environment.

Implementation notes:

- Keep MCP separate from UI data access but reuse permission helpers.
- Write actions should become draft/approval flow in a later ticket.

Files to inspect:

- `prd.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `package.json`
- Supabase data access modules from T04.

Dependencies:

- T04.

Verification:

- Local MCP smoke test with a sample client.
- Permission test with invalid/expired token.
- Audit event created on access.

### T14 [M4] [Integration] Add CLI for health, migrations, seed, reports, MCP config, and tests

Linear title: Add Motivate Kids CLI for developer and admin operations

Goal and context:

Provide a CLI for local/remote app operations and agent workflows.

Scope:

- Add CLI command structure:
  auth, health, migrations, seed, reports, mcp, tests.
- Support scoped auth for developer/admin operations.
- Add health checks for Supabase, storage, auth redirect config, and `/kid`
  route.
- Add seed demo data command.
- Add family-safe report export command.
- Add MCP config command.
- Add smoke test trigger command.

Out of scope:

- Full family admin self-service CLI for non-technical users unless explicitly
  approved.
- Write-heavy automation without approvals.

Acceptance criteria:

- CLI runs locally.
- `health` reports core service status.
- `seed` creates demo data in a safe target.
- `reports` exports family-safe summary data.
- CLI token use is audited.

Engineering quality bar:

- Commands fail loudly and safely.
- No production destructive command without explicit confirmation flags.
- CLI docs include examples.

Implementation notes:

- Prefer JavaScript executable scripts.
- Reuse permission and data access contracts.

Files to inspect:

- `package.json`
- `scripts/`
- `supabase/config.toml`
- Data access modules from T04.

Dependencies:

- T13.

Verification:

- Run each CLI command against local/staging config.
- Confirm audit events.
- Document usage in README or docs file.

### T15 [M4] [Rollout] Harden `/kid` deployment, PWA, observability, and mobile smoke tests

Linear title: Harden `/kid` deployment and mobile rollout readiness

Goal and context:

Prepare the WAP/mobile web app for production use at
`app.motivationlabs.ai/kid`.

Scope:

- Configure deployment route/base path.
- Configure Supabase redirect URLs for `/kid`.
- Configure PWA manifest `start_url`, scope, icons, theme color.
- Configure service worker scope under `/kid`.
- Add analytics and core audit events.
- Add mobile smoke tests for Android/iOS browser dimensions.
- Add auth, setup, award, kid check-in, reward request, group join smoke tests.
- Add rollback plan for old routes/current mode.

Out of scope:

- Packaged Android/iOS store submission.
- Full e2e matrix across every device.

Acceptance criteria:

- Production route works at `/kid`.
- App installs as PWA from mobile browsers.
- Auth redirects return to `/kid`.
- Core flows pass smoke tests.
- Old routes behave according to T01 decision.
- Observability catches auth, media upload, award, approval, and group errors.

Engineering quality bar:

- No broken asset paths under base path.
- No auth cookie or redirect loop regressions.
- Release checklist is documented.

Implementation notes:

- Current manifest is root-oriented and named "Kids Rewards."
- Current middleware is root-oriented.
- Service worker and invite URLs must be checked carefully under `/kid`.

Files to inspect:

- `app/manifest.ts`
- `public/sw.js`
- `middleware.ts`
- `next.config.mjs`
- `vercel.json`
- `tests/*.ts`
- `README.md`

Dependencies:

- T14 and all user-facing MVP tickets.

Verification:

- `npm run build`
- Playwright smoke tests.
- Manual mobile browser checks on iOS Safari and Android Chrome.
- Production/staging deployment checklist completed.

## Coding-Agent Handoff

### Packet A: Product/Routing Foundation

Owns:

- T01
- T02
- T15 route/deployment portions

Primary files to inspect:

- `prd.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `next.config.mjs`
- `middleware.ts`
- `app/manifest.ts`
- `public/sw.js`

Constraints:

- Do not leave `/kid` route behavior implicit.
- Do not break auth redirects.
- Keep mobile web first.

Verification:

- Local `/kid` route check.
- Build check.
- Mobile viewport screenshot.

### Packet B: Supabase/Auth/Data Foundation

Owns:

- T03
- T04
- T05 data/auth portions

Primary files to inspect:

- `supabase/migrations/*.sql`
- `lib/supabase/*.ts`
- `context/FamilyContext.tsx`
- `middleware.ts`
- auth pages

Constraints:

- Adult authentication required before family access.
- Family lookup must use `family_members`.
- All child data is family-scoped.

Verification:

- RLS tests.
- Auth walkthrough.
- Unit tests for balance and permissions.

### Packet C: Adult And Kid Core UI

Owns:

- T06
- T07
- T08 UI portions

Primary files to inspect:

- `app/parent/page.tsx`
- `app/parent/actions/page.tsx`
- `app/kids/[id]/page.tsx`
- `app/parent/rewards/page.tsx`
- `app/parent/approvals/page.tsx`
- `UX_JOURNEYS_AND_LAYOUTS.md`

Constraints:

- Adult workflows optimize for speed and clarity.
- Kid workflows optimize for big visual progress and minimal text.
- Mobile 375px is the primary target.

Verification:

- Browser walkthroughs.
- Mobile screenshots.
- Star ledger tests.

### Packet D: Design System And Motion

Owns:

- T12
- motion portions of T06, T08, T11

Primary files to inspect:

- `DESIGN_SYSTEM.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `app/globals.css`
- `tailwind.config.ts`
- `components/*`
- `package.json`

Constraints:

- Animal Island visual language.
- GSAP for achievement moments.
- Motion respects reduced-motion preferences.

Verification:

- Visual review across 375px, 390px, 430px.
- Reduced-motion check.
- Build check.

### Packet E: Media And Safe Social

Owns:

- T09
- T10
- T11

Primary files to inspect:

- `components/VoiceRecorder.tsx`
- `components/PhotoCapture.tsx`
- Supabase storage migrations
- new group modules
- approvals UI

Constraints:

- No unmoderated kid-to-kid messaging.
- Media is permissioned and moderation-aware.
- Rankings are group-scoped and can be disabled.

Verification:

- Media upload/playback checks.
- Group join approval tests.
- Ranking calculation tests.

### Packet F: Agent Interfaces

Owns:

- T13
- T14

Primary files to inspect:

- `prd.md`
- `UX_JOURNEYS_AND_LAYOUTS.md`
- `package.json`
- data access modules

Constraints:

- Read-only MCP first.
- CLI operations audited.
- Write actions require explicit permission or draft/approval flow.

Verification:

- MCP local smoke test.
- CLI command smoke tests.
- Audit event checks.

## Open Questions

1. Final slug: `/kid` or `/kids`?
2. Legacy data: migrate, export-only, or shut down without migration?
3. Account ID: should it be globally unique username, phone/email alias, or
   family-scoped display ID?
4. SMS OTP provider: Supabase phone auth directly, or external SMS provider?
5. Video check-in max length: 15 seconds, 30 seconds, or task-specific?
6. Kid mode access: parent handoff, device trust, or kid PIN?
7. Social groups: invite-only network first, or curated public groups later?
8. MCP/CLI visibility: normal family settings or hidden developer settings?
