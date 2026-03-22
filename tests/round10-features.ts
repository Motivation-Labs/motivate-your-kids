/**
 * Round 10 feature screenshots — Settings rename, Family Members, Memo UI.
 * Saves PNGs to tests/round10-features/
 */
import { chromium } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const BASE_URL = 'http://localhost:3000'
const OUT_DIR = path.join(process.cwd(), 'tests', 'round10-features')

const SEED_DATA = {
  family: { id: 'f1', name: 'The Smiths', createdAt: '2026-03-01' },
  kids: [
    { id: 'k1', familyId: 'f1', name: 'Mia', avatar: 'preset:avatar-01', colorAccent: '#F59E0B', createdAt: '2026-03-01', wishlist: [] },
    { id: 'k2', familyId: 'f1', name: 'Leo', avatar: '🦊', colorAccent: '#3B82F6', createdAt: '2026-03-01', wishlist: [] },
  ],
  categories: [
    { id: 'c1', familyId: 'f1', name: 'Chores', icon: '🧹' },
    { id: 'c2', familyId: 'f1', name: 'Learning', icon: '📚' },
  ],
  actions: [
    { id: 'a1', familyId: 'f1', name: 'Clean room', description: '', categoryId: 'c1', pointsValue: 5, isDeduction: false, isTemplate: false, isActive: true },
    { id: 'a2', familyId: 'f1', name: 'Read a book', description: '20 mins', categoryId: 'c2', pointsValue: 3, isDeduction: false, isTemplate: false, isActive: true },
    { id: 'a3', familyId: 'f1', name: 'Screen time over', description: '', categoryId: '', pointsValue: 2, isDeduction: true, isTemplate: false, isActive: true },
  ],
  badges: [],
  rewards: [
    { id: 'r1', familyId: 'f1', name: 'Movie Night', description: 'Pick a movie', pointsCost: 20, isActive: true },
  ],
  transactions: [
    { id: 't1', kidId: 'k1', type: 'earn', amount: 5, actionId: 'a1', status: 'approved', timestamp: new Date().toISOString() },
    { id: 't2', kidId: 'k2', type: 'earn', amount: 3, actionId: 'a2', status: 'approved', timestamp: new Date().toISOString() },
  ],
  kidBadges: [],
  familyMembers: [
    { id: 'm1', familyId: 'f1', name: 'Sarah', avatar: '👩', role: 'mother', birthday: '1990-05-15', createdAt: '2026-03-01' },
    { id: 'm2', familyId: 'f1', name: 'Mike', avatar: 'preset:avatar-05', role: 'father', createdAt: '2026-03-01' },
  ],
  familyInvites: [
    {
      id: 'inv1', familyId: 'f1',
      token: 'abc123def456',
      role: 'grandma',
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: 'light',
  })

  // Seed localStorage before any page loads
  await ctx.addInitScript((data: typeof SEED_DATA) => {
    localStorage.setItem('motivate_your_kids_v1', JSON.stringify(data))
  }, SEED_DATA)

  const page = await ctx.newPage()

  async function shot(name: string) {
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: false })
    console.log(`  ✓ ${name}.png`)
  }

  // 1. Settings tab (renamed from More)
  await page.goto(`${BASE_URL}/parent/more`)
  await page.waitForLoadState('networkidle')
  await shot('01-settings-hub')

  // 2. Family Members page — with existing members
  await page.goto(`${BASE_URL}/parent/family`)
  await page.waitForLoadState('networkidle')
  await shot('02-family-members')

  // 3. Add Member form
  await page.locator('button', { hasText: 'Add' }).first().click()
  await page.waitForTimeout(400)
  await shot('03-add-member-form')

  // 4. Fill in member details
  await page.fill('input[placeholder="e.g. Sarah"]', 'Grandma Li')
  // Click the Grandma role button inside the modal
  await page.locator('[class*="fixed"] button:has-text("Grandma")').click()
  await page.waitForTimeout(200)
  await shot('04-add-member-filled')

  // 5. Close form
  await page.locator('[class*="fixed"] button:has-text("Cancel")').click()
  await page.waitForTimeout(200)
  await shot('05-invite-section')

  // 6. Create invite modal
  await page.locator('button', { hasText: '+ Create' }).click()
  await page.waitForTimeout(400)
  await shot('06-create-invite')

  // 7. Home page — per-kid cards with memo buttons visible
  await page.goto(`${BASE_URL}/parent`)
  await page.waitForLoadState('networkidle')
  await shot('07-home-page')

  // 8. Open earn sheet for Mia — shows memo section
  await page.locator('button:has-text("Add Stars")').first().click()
  await page.waitForTimeout(500)
  await shot('08-quick-log-with-memo')

  // 9. Actions page — quick log with memo
  await page.goto(`${BASE_URL}/parent/actions`)
  await page.waitForLoadState('networkidle')
  await shot('09-actions-page')

  // 10. Open log modal from actions page
  await page.locator('button:has-text("Log")').first().click()
  await page.waitForTimeout(500)
  await shot('10-action-log-with-memo')

  // 11. Bottom nav showing "Settings" tab
  await page.goto(`${BASE_URL}/parent`)
  await page.waitForLoadState('networkidle')
  // Screenshot just the bottom nav area
  await shot('11-bottom-nav-settings')

  await browser.close()
  console.log(`\n✅ Round 10 screenshots saved to tests/round10-features/`)
}

main().catch(err => { console.error(err); process.exit(1) })
