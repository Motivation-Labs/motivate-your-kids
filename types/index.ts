// ── Domain entity types ───────────────────────────────────────────────────────

export type TransactionType = 'earn' | 'redeem' | 'deduct'
export type TransactionStatus = 'approved' | 'pending' | 'denied'

export interface Family {
  id: string
  name: string
  createdAt: string
}

export interface Kid {
  id: string
  familyId: string
  name: string
  /** Emoji character used as avatar */
  avatar: string
  /** Hex color used as the kid's accent color */
  colorAccent: string
  createdAt: string
  /** Reward IDs the kid has wishlisted (max 3) */
  wishlist?: string[]
  /** Decorative frame around avatar (e.g., "stars", "crown", "rainbow") */
  avatarFrame?: string
}

export interface Category {
  id: string
  familyId: string
  name: string
  /** Emoji icon */
  icon: string
}

export interface Action {
  id: string
  familyId: string
  name: string
  description: string
  categoryId: string
  /** Points awarded (or deducted) on completion. Recommended range: 1–10 */
  pointsValue: number
  /** If true, logging this action deducts points instead of adding */
  isDeduction: boolean
  /** Optional badge automatically awarded on completion */
  badgeId?: string
  isTemplate: boolean
  isActive: boolean
}

export interface Badge {
  id: string
  familyId: string
  name: string
  /** Emoji icon */
  icon: string
  description: string
}

export interface Reward {
  id: string
  familyId: string
  name: string
  description: string
  pointsCost: number
  isActive: boolean
}

export interface Transaction {
  id: string
  kidId: string
  type: TransactionType
  amount: number
  actionId?: string
  rewardId?: string
  status: TransactionStatus
  timestamp: string
  note?: string
  /** Recorded when the logged amount differs from the action's default, or for deductions */
  reason?: string
  /** Base64 data URL of an attached photo */
  photoUrl?: string
  /** Base64 data URL of an attached voice memo (max 10s) */
  voiceMemoUrl?: string
}

export interface KidBadge {
  kidId: string
  badgeId: string
  awardedAt: string
}

export type FamilyRole = 'mother' | 'father' | 'grandma' | 'grandpa' | 'aunt' | 'uncle' | 'nanny' | 'other'

export interface FamilyMember {
  id: string
  familyId: string
  name: string
  avatar: string
  role: FamilyRole
  birthday?: string
  createdAt: string
}

export interface FamilyInvite {
  id: string
  familyId: string
  token: string
  role: FamilyRole
  createdAt: string
  expiresAt: string
}

// ── Persisted store shape ─────────────────────────────────────────────────────

export interface AppStore {
  family: Family | null
  kids: Kid[]
  categories: Category[]
  actions: Action[]
  badges: Badge[]
  rewards: Reward[]
  transactions: Transaction[]
  kidBadges: KidBadge[]
  familyMembers: FamilyMember[]
  familyInvites: FamilyInvite[]
}
