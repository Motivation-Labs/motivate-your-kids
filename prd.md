# Motivate Kids - Simplified Product Requirements

Last updated: 2026-06-02
Status: Rebuild PRD

Companion UX plan: `UX_JOURNEYS_AND_LAYOUTS.md`
Companion implementation tickets: `agent-tickets.md`

## 1. Product Summary

Motivate Kids starts as a WAP/mobile web app for fast iteration and immediate
family usage, then expands toward packaged Android and iOS apps. Families use it
to turn daily actions, creative projects, and interest-based challenges into
visible progress through stars, streaks, badges, media-rich check-ins, and
parent-approved rewards.

The rebuild should keep the product simple for families while expanding beyond
a private chore chart into a safe, parent-controlled motivation network for
kids with shared interests.

## 2. Product Direction

The app should feel like a playful island world for children and a fast,
trustworthy operating surface for adults.

Primary design reference:

- Animal Island UI: https://guokaigdg.github.io/animal-island-ui/#/

Design principles:

- Kid-first visual language: large tap targets, animals, islands, maps,
  stickers, cards, progress paths, bright but soft color.
- Rich animation is part of the product, especially when adults award stars,
  badges, rewards, or group recognition. Kids should feel the moment.
- Parent-comfortable management: clear forms, simple approval queues, readable
  history, no clutter.
- Positive reinforcement first: reward effort, consistency, creativity, and
  initiative.
- Safe social by default: every kid interaction is scoped, moderated, and
  parent-controlled.
- Media-rich reflection: kids and caregivers can attach video, text, and voice
  memo evidence to tasks and check-ins.

## 3. Users

| User | Role |
| --- | --- |
| Parent / guardian | Creates the family, manages kids, tasks, rewards, groups, and approvals. |
| Grandparent | Supports the family by logging tasks, encouraging kids, and reviewing progress. |
| Parent sibling | Uncle, aunt, or other trusted relative who can support tasks and encouragement. |
| Kid | Completes tasks, checks in, shares progress in approved groups, and redeems rewards. |
| Agent / developer tool | Uses MCP or CLI access to inspect, automate, or assist app workflows. |

Family roles must support:

- parent
- grandparent
- uncle
- aunt
- nanny or caregiver
- other trusted adult

Each family has one or more admins. Admins control membership, kid visibility,
group participation, and approval rules.

## 4. Goals

1. Let a family create a usable motivation system in under 10 minutes.
2. Support rich kid profiles, including avatar and 10-second voice self-intro.
3. Let adults create tasks, rewards, badges, interest groups, and challenges.
4. Let kids check in with text, voice, or video proof where appropriate.
5. Support safe social groups where kids can share streaks and rankings.
6. Keep all child data private, permissioned, and family-controlled.
7. Provide MCP and CLI surfaces for AI coding agents and automation tools.

## 5. Non-Goals For The First Rebuild

- Public social network or public kid profiles.
- Real-money payments or automated reward fulfillment.
- Unmoderated kid-to-kid messaging.
- School classroom management as a primary use case.
- Complex AI parenting advice.

## 6. Tech Stack

All application code should use JavaScript.

### Frontend

- WAP/mobile web app first, optimized for fast iteration and usage.
- Next.js App Router using JavaScript and JSX for the mobile web/PWA surface.
- React for UI.
- Tailwind CSS for styling.
- Animal Island UI as the primary theme reference.
- GSAP for rich JavaScript animation, visual effects, and kid-facing motion.
- Supabase JavaScript SDK for auth, database, storage, and realtime access.
- PWA support as the web baseline.
- Android and iOS packaging support after the mobile web experience stabilizes.

### Backend

- Supabase Auth for accounts and sessions.
- Supabase Postgres as the database.
- Supabase Storage for avatars, video, voice memos, and image attachments.
- Supabase Realtime for live task, group, and approval updates.
- JavaScript server functions or API routes where custom backend behavior is
  required.

### Authentication

Required auth methods:

- account ID + password
- email OTP
- SMS OTP

Planned auth methods:

- Google OAuth
- WeChat OAuth

Auth requirements:

- Adults authenticate with a real account before creating or joining a family.
- Kids may use parent-approved kid sessions or family-scoped kid mode.
- Invite links must require adult authentication before granting family access.
- OAuth providers must map back to the same family membership model as password
  and OTP accounts.

### Agent And Developer Interfaces

- MCP server support for structured agent access.
- CLI support for local and remote operations.
- Supported agent/tool ecosystems:
  - OpenClaw
  - Hermes
  - Codex
  - Claude Code
  - OpenCode

## 7. Core Product Features

### 7.1 Family Management

Families can invite and manage trusted adults.

Required capabilities:

- Create a family.
- Invite parents, grandparents, uncles, aunts, nannies, and other caregivers.
- Assign roles and permissions.
- Transfer family ownership.
- Remove or deactivate members.
- Show member profile, avatar, relationship, and activity.
- Parent/admin approval for sensitive changes.

### 7.2 Kid Profiles

Each kid has a full profile.

Required fields:

- name
- avatar
- birthday
- gender or prefer not to say
- hobbies and interests
- favorite rewards
- avatar frame or island theme
- short voice self-intro, max 10 seconds
- optional parent notes

Profile rules:

- Kid profile visibility is controlled by family admins.
- Voice intro must be stored securely in Supabase Storage.
- Parents can edit all kid profile fields.
- Kids may suggest profile changes, but adults approve them.

### 7.3 Tasks And Check-Ins

Tasks represent actions worth tracking, rewarding, or sharing.

Task types:

- family routine task
- learning task
- chore task
- creativity task
- health task
- behavior task
- social group challenge
- custom task

Check-in media:

- text memo
- voice memo
- video memo
- optional image/photo attachment

Rules:

- Adults can create and assign tasks.
- Kids can check in only on tasks they are allowed to see.
- Some tasks require adult approval before points are awarded.
- Every check-in creates an auditable activity record.
- Media attachments are stored in Supabase Storage.

### 7.4 Stars, Streaks, Badges, And Rewards

The motivation loop uses multiple progress signals.

Required capabilities:

- Award stars for task completion.
- Deduct stars only when family settings allow it.
- Track streaks for repeated check-ins.
- Award badges manually or through task rules.
- Let kids browse rewards.
- Let kids request rewards.
- Let kids and adults maintain wishlists.
- Require adult approval before rewards spend stars.
- Compute balances from transaction history, not mutable counters.

Wishlist and reward catalog requirements:

- A wishlist item can be a custom card created inside the app.
- A wishlist item can include a Taobao product link.
- A wishlist item can include another ecommerce product link or SKU.
- Adults can attach or upload a custom photo for any wishlist/reward card.
- Wishlist cards support title, description, star cost, source URL, platform,
  SKU/product ID, photo, and notes.
- Kids can suggest wishlist items, but adults approve before the item becomes
  visible as an active reward.
- Ecommerce links are references only; the app does not purchase or fulfill
  products in the first rebuild.

Award-giving animation requirements:

- Awarding stars should trigger a clear, delightful visual effect.
- Badge awards should feel more special than routine star awards.
- Reward approvals should produce a celebratory redemption moment.
- Group ranking movement should animate clearly without feeling stressful.
- Streak milestones should use island-map or path-progress animation.
- Effects should be playful, performant, and safe for repeated daily use.
- Motion must respect reduced-motion preferences.

Animation reference:

- GSAP community and examples: https://gsap.com/community/

### 7.5 Social Interest Groups

Some tasks can become group challenges. Kids can join approved groups with other
kids around shared interests.

Example groups:

- reading club
- drawing challenge
- piano practice group
- sports practice group
- language learning group
- kindness challenge

Required capabilities:

- Adults create or approve social groups.
- Kids join groups only with family permission.
- Group tasks support check-ins.
- Kids can share streak progress in the group.
- Groups can show rankings and scoring.
- Rankings should be encouraging, not shaming.
- Parents can remove a kid from any group.

Safety requirements:

- No public group discovery for kids without adult approval.
- No open direct messaging in the first rebuild.
- Group feeds show approved check-in content only.
- Adults can report, hide, or remove inappropriate media.
- Default group visibility is family-only unless explicitly shared.

### 7.6 Ranking And Scoring

Groups may include rankings for motivation.

Scoring inputs:

- check-in completion
- streak length
- stars earned
- badge progress
- task difficulty
- consistency over time

Rules:

- Rankings must be scoped to a group.
- Ranking views should emphasize progress and encouragement.
- The app should support weekly, monthly, and all-time score windows.
- Family admins can disable ranking for their kids.

### 7.7 Multimedia Activity History

Families need a clear history of what happened.

Required activity types:

- task check-in
- star award
- star deduction
- reward request
- reward approval
- badge award
- group join
- group ranking update
- profile update

Activity records may include:

- text memo
- voice memo
- video memo
- image attachment
- adult approval status
- related task, reward, group, or kid

### 7.8 MCP And CLI Support

Motivate Kids should expose structured interfaces for agent-assisted workflows.

MCP capabilities:

- inspect family-safe product data with permission checks
- list tasks, rewards, badges, and groups
- create draft tasks or rewards for parent approval
- summarize kid progress for parents
- inspect failed workflows and logs
- support coding-agent development workflows

CLI capabilities:

- authenticate as an admin or developer
- inspect app health
- run migrations
- seed demo data
- export family-safe reports
- manage MCP server configuration
- trigger test walkthroughs

Supported tool integrations:

- OpenClaw
- Hermes
- Codex
- Claude Code
- OpenCode

## 8. Data Model

Core tables:

- families
- family_members
- kids
- kid_profiles
- tasks
- task_assignments
- check_ins
- media_assets
- categories
- rewards
- reward_requests
- wishlist_items
- badges
- kid_badges
- star_transactions
- social_groups
- group_memberships
- group_tasks
- group_scores
- group_rankings
- approvals
- app_settings
- audit_events
- mcp_clients
- cli_tokens

Important invariants:

- Every family-owned record has `family_id`.
- Every kid-owned record has `kid_id`.
- Every social group membership requires adult permission.
- Every media asset has owner, scope, and moderation status.
- Star balances are computed from approved star transactions.
- Reward approval is idempotent.
- Ranking is group-scoped.
- MCP and CLI access must be permissioned and auditable.

## 9. Permissions

Permission model:

- Family admin: full family management.
- Trusted adult: can log tasks, review progress, and approve limited items.
- Kid: can view own dashboard, check in, join approved groups, and request rewards.
- Agent/CLI: can only perform actions granted by an authenticated admin or
  developer permission.

Sensitive actions requiring approval:

- joining a social group
- sharing check-in media outside the family
- approving reward redemption
- changing kid profile voice intro
- inviting a new adult
- enabling rankings for a kid
- granting MCP or CLI access

## 10. Release Criteria

The rebuild MVP is ready when:

- A family can sign up and create profiles for at least two kids.
- Parents can invite grandparents and parent siblings.
- Each kid can have an avatar and 10-second voice self-intro.
- Adults can create tasks and rewards.
- Kids can submit text, voice, and video check-ins.
- Adults can approve check-ins and rewards.
- Stars, streaks, badges, and rewards work end to end.
- Kids can join an approved interest group.
- Group streak sharing and ranking work safely.
- Supabase Auth, Postgres, Storage, and Realtime are wired.
- MCP and CLI interfaces exist for at least read-only product inspection.
- The UI follows the Animal Island visual theme.
- The WAP/mobile web app works well on Android and iOS browsers starting at
  375px width.
- The web/PWA surface is installable and usable before packaged apps ship.

## 11. Open Questions

1. Should social groups be limited to families we invite, or can trusted public
   groups exist later?
2. Should video check-ins have a max length in MVP, such as 15 or 30 seconds?
3. Should rankings use stars, streaks, task difficulty, or a blended score?
4. Should kids be able to react to each other's check-ins with stickers?
5. Which MCP actions are safe for write access in the first release?
6. Should the CLI be developer-only or available to family admins too?
