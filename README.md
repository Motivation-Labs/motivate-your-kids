# Motivate Your Kids ⭐

A warm, family-friendly web app that helps parents motivate young kids (ages 4–8) by rewarding positive actions with points and badges.

Parents define custom actions, log completions, and approve reward redemptions. Kids see their star balance grow and redeem points for rewards they care about.

---

## Features (v1)

- **Family setup wizard** — name your family, add kids, pick starter actions
- **Actions catalog** — create custom actions with point values (1–10 ⭐) across categories like Chores, Academics, Behavior, Health, and Creativity
- **Points system** — parents log completions via FAB, kid profile, or dashboard; kids earn stars
- **Badges** — parents create and award emoji badges as honorary milestones
- **Reward redemption** — kids browse rewards and submit requests; parents approve or deny
- **Kid dashboard** — big bold star count, badge wall, and reward catalog (unaffordable items greyed out)
- **Parent dashboard** — per-kid summary cards, pending approval alerts, activity feed
- **PWA-ready** — mobile-first layout, installable on any device

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| State | React Context + localStorage |
| Font | Nunito (rounded, friendly) |
| Deployment | Vercel |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). On first launch you'll be guided through the family setup wizard.

```bash
npm test       # run the test suite (64 tests)
npm run build  # production build
```

## Iteration Plan

| Version | Focus |
|---------|-------|
| **v1** *(current)* | Web PWA · localStorage · trust-based role switching · full reward loop |
| **v2** | Supabase backend · multi-device sync · multi-parent · recurring actions · push notifications · data export |
| **v3** | Native iOS + Android · AI-suggested actions · streaks & multipliers |

See [`prd.md`](./prd.md) for the full product requirements, data model, and design decisions.

## Project Structure

```
app/                  Next.js App Router pages
  setup/              Onboarding wizard
  parent/             Parent-facing pages (dashboard, actions, rewards, etc.)
  kids/[id]/          Kid-facing pages (dashboard, badges, rewards)
components/           Shared UI components (ParentNav, KidNav, LogActionFab, etc.)
context/              FamilyContext — global state + reducer
lib/                  Helpers, localStorage utilities, seed data, ID generator
types/                TypeScript domain types
__tests__/            Jest test suite
```

## License

MIT
