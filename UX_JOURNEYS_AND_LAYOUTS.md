# Motivate Kids - UX Journeys And UI Layouts

Last updated: 2026-06-02
Purpose: Product-manager level UX plan for the Motivate Kids rebuild.

## 1. Product Experience Frame

Motivate Kids starts as a WAP/mobile web app for fast iteration and immediate
usage on Android and iOS browsers. The web/PWA surface is the first production
experience; packaged Android and iOS apps can follow after the mobile web UX
stabilizes.

Motivate Kids has two emotional jobs:

- For adults: make encouragement fast, consistent, and safe.
- For kids: make effort visible, delightful, social in controlled ways, and worth repeating.

The app should feel like a family-controlled island adventure. Adults manage the
island rules. Kids travel through task paths, earn stars, unlock badges, build
streaks, and join approved interest islands with other kids.

Primary UI references:

- Animal Island UI for theme, layout softness, map/island metaphor, animals, and
  playful children-facing surfaces.
- GSAP for award-giving visual effects, streak motion, badge unlocks, ranking
  changes, and transition polish.

Design register:

- Product UI first, playful where it helps kids understand progress.
- Familiar admin patterns for adults.
- Rich delight reserved for moments of achievement.

## 2. Personas And Jobs

### Parent Admin

Job: Set up a safe motivation system for the family, then use it in under 30
seconds at real-life moments.

Needs:

- Fast task logging.
- Clear approval queues.
- Control over adults, kids, groups, media, rewards, and rankings.
- Confidence that social features are safe.

### Trusted Adult

Examples: grandparent, uncle, aunt, nanny.

Job: Support the kid without owning the whole system.

Needs:

- Simple view of assigned kids.
- Ability to log or approve allowed tasks.
- Clear permission boundaries.
- Encouraging interaction without admin overload.

### Kid

Job: See what to do, check in, feel rewarded, and share progress in approved
interest groups.

Needs:

- Minimal reading.
- Big visual progress.
- Safe rewards and feedback.
- Fun profile identity.
- Clear "what can I do now?" guidance.

### Agent Or Developer Tool

Examples: OpenClaw, Hermes, Codex, Claude Code, OpenCode.

Job: Inspect, automate, test, or assist product workflows through MCP/CLI.

Needs:

- Explicit permissions.
- Auditable access.
- Structured data outputs.
- Read-only inspection first, write actions through draft/approval flows.

## 3. Information Architecture

### Adult App

Primary navigation:

- Home
- Tasks
- Rewards
- Groups
- Approvals
- Settings

Secondary settings areas:

- Family members
- Kids
- Profiles
- Permissions
- Auth and security
- Media moderation
- MCP and CLI
- Billing or plan, future only

### Kid App

Primary navigation:

- Island
- Tasks
- Rewards
- Groups
- Profile

Kid navigation should use large icons, visual labels, and stable positions.

### Agent/Developer Interfaces

CLI sections:

- auth
- health
- migrations
- seed
- reports
- mcp
- tests

MCP resources/tools:

- family summary
- task catalog
- approval queue
- kid progress summary
- group summary
- audit log
- draft task
- draft reward

## 4. Core User Journeys

### Journey A: Parent Creates A Family

Goal: Go from account creation to usable family system.

1. Adult lands on welcome screen.
2. Chooses sign up.
3. Authenticates with account ID + password, email OTP, or SMS OTP.
4. Creates family name.
5. Creates adult profile and role.
6. Adds first kid.
7. Adds kid avatar and optional voice intro.
8. Selects starter tasks.
9. Creates first reward or imports wishlist item.
10. Lands on adult home with first recommended action.

Success state:

- Family exists.
- Admin exists.
- At least one kid exists.
- At least one task exists.
- At least one reward or wishlist item exists.

Main risk:

- Setup becomes too long.

UX decision:

- Split into "required now" and "decorate later." Voice intro, rewards, groups,
  and advanced permissions can be prompted after activation.

### Journey B: Adult Awards Stars

Goal: Award recognition in the moment.

1. Adult opens Home.
2. Selects kid card or default kid.
3. Taps Award.
4. Chooses task or custom award.
5. Optionally adds text, voice, image, or video memo.
6. Confirms.
7. Kid card animates: stars fly to balance, island path glows, toast confirms.

Success state:

- Star transaction recorded.
- Kid balance updates.
- Activity history updates.
- If task has badge/streak milestone, extra animation triggers.

Animation direction:

- GSAP star burst from the adult's tap point.
- Balance number counts up.
- Kid avatar reacts with a small happy motion.
- Motion completes in under 900 ms for routine awards.

### Journey C: Kid Checks In

Goal: Let kid submit proof or reflection for an assigned task.

1. Kid opens Island.
2. Sees today's task path.
3. Taps a task tile.
4. Chooses check-in type: text, voice, video, or photo.
5. Records or writes.
6. Submits.
7. Sees pending or completed state.

Success state:

- Check-in is stored.
- Media asset is stored in Supabase Storage.
- If approval required, adult sees it in Approvals.
- If auto-approved, stars and streak update.

Kid UX rule:

- The kid should never need to understand backend status. Use simple states:
  "Sent", "Waiting for grown-up", "Done", "Try again."

### Journey D: Kid Requests Wishlist Reward

Goal: Turn motivation into a parent-approved reward.

1. Kid opens Rewards.
2. Sees reward cards and wishlist cards.
3. Taps an affordable reward.
4. Confirms request.
5. Sees a celebratory "request sent" moment.
6. Adult approves or denies.
7. On approval, kid sees redemption celebration.

Wishlist sources:

- Custom app card.
- Taobao product link.
- Other ecommerce product link.
- Other ecommerce SKU/product ID.
- Uploaded photo.

UX decision:

- Ecommerce cards are references only. The app does not purchase products.

### Journey E: Kid Joins An Interest Group

Goal: Join a safe group challenge around an interest.

1. Kid sees suggested interest island, or adult adds a group.
2. Kid taps Join.
3. App says grown-up approval is needed.
4. Adult reviews group details.
5. Adult approves.
6. Group appears in Kid Groups.
7. Kid checks in on group tasks.
8. Group feed shows approved streaks and rankings.

Safety rules:

- No unapproved public discovery.
- No direct messaging.
- Approved check-in content only.
- Parent can disable ranking.
- Parent can leave group for kid at any time.

### Journey F: Trusted Adult Joins

Goal: Invite a grandparent, uncle, aunt, or caregiver safely.

1. Admin creates invite with role and permission scope.
2. Invited adult opens link.
3. Adult authenticates.
4. Adult accepts invite.
5. Admin receives confirmation or approval request.
6. Adult sees only allowed family surfaces.

Critical requirement:

- Auth must happen before family access is granted.

### Journey G: Agent Inspects Product State

Goal: Let MCP/CLI safely support development and automation.

1. Admin/developer authenticates CLI or MCP client.
2. Tool receives scoped token.
3. Tool lists allowed resources.
4. Tool inspects task catalog, approvals, or progress summaries.
5. Any write action creates a draft for adult approval unless explicitly allowed.

Success state:

- Action is logged.
- Permission is enforced.
- Sensitive kid data is minimized.

## 5. Mobile UI Layouts

All layouts optimize for 375px to 430px phone widths first. Interaction
patterns must work naturally in mobile browsers on both Android and iOS, then
carry forward to packaged apps.

Platform considerations:

- Respect safe areas on iOS and Android gesture navigation.
- Use bottom navigation for kid and adult primary flows.
- Keep primary actions within thumb reach.
- Support camera, microphone, and photo library permission states.
- Avoid hover-only affordances.
- Design tap targets at 44px minimum.
- Treat WAP/mobile web, PWA, and packaged apps as the same core UX.

### 5.1 Welcome And Auth

Purpose: Start the family safely.

Layout:

```text
+--------------------------------+
| Animal island brand mark        |
|                                |
| Big friendly headline           |
| Short parent-focused promise    |
|                                |
| [Create family]                 |
| [Sign in]                       |
|                                |
| Auth method selector            |
| Account ID + password           |
| Email OTP                       |
| SMS OTP                         |
+--------------------------------+
```

Design notes:

- Warm island background.
- One illustrated animal guide.
- Auth form is calm and adult-readable.
- Google OAuth and WeChat OAuth appear as "coming later" only when enabled.

### 5.2 Adult Home

Purpose: Daily operating surface.

Layout:

```text
+--------------------------------+
| Family name              alerts |
| Today on the island             |
|                                |
| Kid card                        |
| avatar  name      stars streak  |
| [Award] [Check-in] [Reward]     |
|                                |
| Kid card                        |
| avatar  name      stars streak  |
| [Award] [Check-in] [Reward]     |
|                                |
| Pending approvals strip         |
| Recent activity                 |
| Bottom nav                      |
+--------------------------------+
```

Interaction notes:

- Award is the dominant action.
- Check-in opens media memo flow.
- Reward opens reward request or approval options.
- Cards use Animal Island surfaces, but labels remain product-clear.

### 5.3 Award Stars Sheet

Purpose: Fast recognition.

Layout:

```text
+--------------------------------+
| Bottom sheet handle             |
| avatar Add stars for Mia        |
|                                |
| Task chips or grid              |
| [Reading] [Helping] [Practice]  |
|                                |
| Star amount stepper             |
|        [-]  5  [+]              |
|                                |
| Optional memo                   |
| [Text] [Voice] [Photo] [Video]  |
|                                |
| [Award 5 stars]                 |
+--------------------------------+
```

Motion:

- Confirm button compresses slightly on tap.
- Stars travel from button to kid balance.
- Routine award has short celebration.
- Badge/streak award has larger scene effect.

### 5.4 Kid Island Home

Purpose: Show progress and next action.

Layout:

```text
+--------------------------------+
| Kid avatar + name       profile |
|                                |
| Star balance hero              |
|       128 stars                 |
|                                |
| Island path                     |
| [task] -> [task] -> [reward]    |
|                                |
| Today's tasks                   |
| Big task tile                   |
| Big task tile                   |
|                                |
| Streak + badges strip           |
| Bottom nav                      |
+--------------------------------+
```

Kid UX notes:

- Few words.
- Large icons.
- Task status is visual: open, sent, waiting, complete.
- No admin controls.

### 5.5 Kid Task Check-In

Purpose: Submit proof or reflection.

Layout:

```text
+--------------------------------+
| Task title + icon               |
| Progress reward preview         |
|                                |
| Choose check-in                 |
| [Speak] [Video] [Photo] [Text]  |
|                                |
| Recorder or input area          |
|                                |
| [Send to grown-up]              |
+--------------------------------+
```

States:

- Empty.
- Recording.
- Preview.
- Uploading.
- Waiting for adult.
- Approved.
- Needs retry.

### 5.6 Rewards And Wishlist

Purpose: Make rewards concrete and motivating.

Layout:

```text
+--------------------------------+
| Rewards              star chip  |
| Wishlist                         |
| [photo card] Taobao link item    |
| [photo card] Custom card         |
|                                |
| Reward shop                     |
| [reward] [reward]               |
| [reward] [reward]               |
|                                |
| Suggest a wish                  |
+--------------------------------+
```

Card fields:

- photo
- title
- star cost
- platform/source
- progress toward cost
- request button

Adult-only card actions:

- approve suggestion
- edit photo
- edit star cost
- open source link
- archive

### 5.7 Social Group Island

Purpose: Shared motivation without unsafe social behavior.

Layout:

```text
+--------------------------------+
| Group name + safety badge       |
| Theme island illustration       |
|                                |
| This week's challenge           |
| [Check in]                      |
|                                |
| Streak board                    |
| kid avatar row                  |
| kid avatar row                  |
|                                |
| Ranking                         |
| 1  kid   score                  |
| 2  kid   score                  |
| 3  kid   score                  |
+--------------------------------+
```

Rules:

- Ranking language should say "progress" more than "winner."
- No kid direct message entry point.
- Reactions, if added later, should be sticker-only and moderated.

### 5.8 Adult Approvals

Purpose: One place to keep the system safe.

Layout:

```text
+--------------------------------+
| Approvals                       |
| Filter chips                    |
| [Check-ins] [Rewards] [Groups]  |
|                                |
| Approval card                   |
| kid, action, media preview      |
| [Approve] [Needs edit] [Deny]   |
|                                |
| Approval card                   |
+--------------------------------+
```

Approval card types:

- task check-in
- reward request
- wishlist suggestion
- group join request
- profile change
- new adult invite
- MCP/CLI access grant

### 5.9 Adult Settings

Purpose: Family administration.

Layout:

```text
+--------------------------------+
| Settings                        |
| Family code / invite CTA        |
|                                |
| Sections                        |
| Members                         |
| Kids                            |
| Permissions                     |
| Media moderation                |
| Auth and security               |
| MCP and CLI                     |
+--------------------------------+
```

Settings should be less playful than kid screens, but still use the same
surface language.

## 6. Desktop Layouts

Desktop is secondary but important for adults and developers.

Adult desktop pattern:

- Left sidebar navigation.
- Top family header.
- Main content grid.
- Right rail for approvals or activity where helpful.

Kid desktop pattern:

- Centered mobile-width island experience.
- Avoid making kid UI dense just because screen space exists.

Developer desktop pattern:

- MCP/CLI settings use plain tables, token lists, scopes, and audit logs.

## 7. Key UI Components

### Island Card

Use for kid-facing progress and rewards.

Anatomy:

- soft rounded surface
- illustrated edge or badge
- large icon/avatar
- one primary metric or action
- optional progress path

### Adult Action Card

Use for parent dashboard and approvals.

Anatomy:

- kid avatar
- title
- compact metadata
- clear primary action
- secondary action menu

### Media Recorder

Modes:

- voice
- video
- photo
- text

States:

- ready
- recording
- preview
- uploading
- saved
- failed

### Reward/Wishlist Card

Anatomy:

- photo or generated image
- title
- star cost
- platform/source label
- progress bar
- request/approve action

### Group Score Row

Anatomy:

- rank
- avatar
- display name
- streak
- score
- progress motion on score change

## 8. Motion System

Motion should make progress legible.

### Routine Motion

- Sheet enters: 180 to 220 ms.
- Button press: 80 to 120 ms.
- Card update: 180 to 250 ms.
- Tab change: 150 to 200 ms.

### Celebration Motion

Use GSAP for:

- star bursts
- balance count-up
- badge reveal
- reward redemption scene
- streak milestone path glow
- group ranking reorder

Celebration levels:

- Level 1: routine star award.
- Level 2: streak continues.
- Level 3: badge unlocked.
- Level 4: reward approved.
- Level 5: major group milestone.

Accessibility:

- Respect reduced-motion preferences.
- Provide non-motion feedback through color, text, and sound/haptic options.
- Avoid flashing effects.

## 9. Empty States

Empty states should teach the next action.

Examples:

- No kids: "Add your first kid to start the island."
- No tasks: "Create one tiny win for today."
- No rewards: "Add a reward your kid can work toward."
- No groups: "Create or join an interest island when your family is ready."
- No approvals: "All clear. Nothing needs review."
- No MCP clients: "Connect a trusted tool when you want agent support."

## 10. Product Decisions To Carry Into Build

- Adult workflows optimize for speed and trust.
- Kid workflows optimize for clarity, delight, and safety.
- Social features are opt-in and parent-approved.
- Ecommerce wishlist links are references, not purchase flows.
- Media is first-class but always permissioned.
- Animation is a core part of award-giving, not decorative background noise.
- MCP/CLI surfaces start read-only and expand through explicit approval.

## 11. Open UX Questions

1. Should kid mode require a simple PIN, device trust, or adult handoff?
2. Should kids see global rankings, group-only rankings, or progress bands?
3. Should voice/video check-ins be capped at 10 seconds like voice intros, or
   have a longer task-specific cap?
4. Should wishlist suggestions allow pasted links only, or also browser share
   sheet capture?
5. Should trusted adults see all kids by default, or only kids assigned by admin?
6. Should MCP/CLI access appear in normal family settings, or in a hidden
   developer settings area?
