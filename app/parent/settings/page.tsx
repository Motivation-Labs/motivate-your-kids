'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useFamily } from '@/context/FamilyContext'
import { useLocale } from '@/context/LocaleContext'
import { clearStore } from '@/lib/store'
import { loadMeta, saveMeta } from '@/lib/meta'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'
import type { MemberRelationship } from '@/lib/supabase/types'

const RELATIONSHIPS: { value: MemberRelationship; label: string; emoji: string }[] = [
  { value: 'mother', label: 'Mom', emoji: '👩' },
  { value: 'father', label: 'Dad', emoji: '👨' },
  { value: 'grandma', label: 'Grandma', emoji: '👵' },
  { value: 'grandpa', label: 'Grandpa', emoji: '👴' },
  { value: 'aunt', label: 'Aunt', emoji: '👩‍🦰' },
  { value: 'uncle', label: 'Uncle', emoji: '👨‍🦰' },
  { value: 'other', label: 'Other', emoji: '🧑' },
]

interface FamilyMember {
  id: string
  display_name: string
  relationship: MemberRelationship
  is_owner: boolean
  email: string
}

interface Invite {
  id: string
  email: string | null
  relationship: MemberRelationship
  status: string
  expires_at: string
}

export default function SettingsPage() {
  const router = useRouter()
  const {
    store,
    updateFamilyName,
    addCategory,
    removeCategory,
  } = useFamily()
  const { locale, setLocale, t } = useLocale()

  const [editingName, setEditingName] = useState(false)
  const [familyNameDraft, setFamilyNameDraft] = useState('')
  const [newCatEmoji, setNewCatEmoji] = useState('📚')
  const [newCatName, setNewCatName] = useState('')
  const [showAddCat, setShowAddCat] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(() => loadMeta().soundEnabled)

  // Family members state
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRelationship, setInviteRelationship] = useState<MemberRelationship>('mother')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [familyId, setFamilyId] = useState<string | null>(null)

  const fetchMembers = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Get user's family ID
    const { data: memberRows } = await supabase
      .from('family_members')
      .select('family_id')
      .eq('user_id', user.id)
      .limit(1)

    const fId = memberRows?.[0]?.family_id
    if (!fId) {
      setMembersLoading(false)
      return
    }
    setFamilyId(fId)

    // Fetch members
    const { data: membersData } = await supabase
      .from('family_members')
      .select('id, display_name, relationship, is_owner, email')
      .eq('family_id', fId)
      .order('joined_at', { ascending: true })

    if (membersData) setMembers(membersData)

    // Fetch pending invites
    const { data: invitesData } = await supabase
      .from('invites')
      .select('id, email, relationship, status, expires_at')
      .eq('family_id', fId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (invitesData) setInvites(invitesData)
    setMembersLoading(false)
  }, [])

  useEffect(() => {
    if (!store.family) router.replace('/')
    else fetchMembers()
  }, [store.family, router, fetchMembers])

  if (!store.family) return null

  function startEditName() {
    setFamilyNameDraft(store.family!.name)
    setEditingName(true)
  }

  function saveFamilyName() {
    if (familyNameDraft.trim()) updateFamilyName(familyNameDraft.trim())
    setEditingName(false)
  }

  function handleAddCategory() {
    if (!newCatName.trim()) return
    addCategory({ name: newCatName.trim(), icon: newCatEmoji })
    setNewCatName('')
    setNewCatEmoji('📚')
    setShowAddCat(false)
  }

  function handleDeleteCategory(cat: Category) {
    const usedByAction = store.actions.some(a => a.categoryId === cat.id)
    if (usedByAction) {
      alert(`"${cat.name}" is used by one or more actions. Archive those actions first before removing this category.`)
      return
    }
    if (confirm(`Remove category "${cat.name}"?`)) {
      removeCategory(cat.id)
    }
  }

  function handleReset() {
    clearStore()
    window.location.href = '/setup'
  }

  async function handleSendInvite() {
    if (!inviteEmail.trim() || !familyId) return
    setInviteError('')
    setInviteSending(true)
    setInviteSuccess(null)

    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          familyId,
          email: inviteEmail.trim(),
          relationship: inviteRelationship,
        }),
      })

      if (!res.ok) {
        const body = await res.json()
        setInviteError(body.error || 'Failed to send invite')
        setInviteSending(false)
        return
      }

      const { inviteLink } = await res.json()
      setInviteSuccess(inviteLink)
      setInviteEmail('')
      setInviteSending(false)
      fetchMembers() // Refresh invites list
    } catch {
      setInviteError('Network error — please try again')
      setInviteSending(false)
    }
  }

  function getRelLabel(rel: MemberRelationship): string {
    return RELATIONSHIPS.find(r => r.value === rel)?.label ?? rel
  }

  function getRelEmoji(rel: MemberRelationship): string {
    return RELATIONSHIPS.find(r => r.value === rel)?.emoji ?? '🧑'
  }

  function expiryLabel(expiresAt: string): string {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / 3600000)
    if (hours > 0) return `${hours}h left`
    const mins = Math.floor(diff / 60000)
    return `${mins}m left`
  }

  return (
    <main className="p-5 max-w-lg mx-auto pb-28">
      <header className="pt-4 mb-6">
        <h1 className="text-2xl font-bold text-ink-primary">Settings</h1>
      </header>

      {/* Family name */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <h2 className="text-sm font-semibold text-brand uppercase tracking-wide mb-3">Family</h2>
        {editingName ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={familyNameDraft}
              onChange={e => setFamilyNameDraft(e.target.value)}
              className="flex-1 rounded-xl border-2 border-line px-3 py-2 text-ink-primary outline-none focus:border-brand"
              onKeyDown={e => { if (e.key === 'Enter') saveFamilyName() }}
            />
            <button
              onClick={saveFamilyName}
              className="px-4 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-colors text-sm"
            >
              Save
            </button>
            <button
              onClick={() => setEditingName(false)}
              className="px-3 py-2 rounded-xl text-ink-muted text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <p className="text-ink-primary font-bold text-lg">{store.family.name}</p>
            <button
              onClick={startEditName}
              className="text-sm text-ink-muted hover:text-ink-secondary transition-colors"
            >
              Edit
            </button>
          </div>
        )}
      </section>

      {/* Family Members */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-brand uppercase tracking-wide">Family Members</h2>
          <button
            onClick={() => setShowInviteForm(v => !v)}
            className="text-sm text-brand hover:text-ink-secondary font-medium transition-colors"
          >
            {showInviteForm ? 'Cancel' : '+ Invite'}
          </button>
        </div>

        {/* Invite form */}
        {showInviteForm && (
          <div className="bg-page rounded-2xl p-4 mb-4">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              className="w-full rounded-xl border-2 border-line px-3 py-2 text-ink-primary outline-none focus:border-brand text-sm mb-3"
            />
            <p className="text-xs text-ink-muted font-medium mb-2">Relationship:</p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {RELATIONSHIPS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setInviteRelationship(r.value)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                    inviteRelationship === r.value
                      ? 'bg-brand text-white'
                      : 'bg-white border border-line text-ink-secondary hover:border-brand'
                  }`}
                >
                  <span>{r.emoji}</span> {r.label}
                </button>
              ))}
            </div>
            {inviteError && (
              <p className="text-red-500 text-xs font-semibold mb-2">{inviteError}</p>
            )}
            {inviteSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
                <p className="text-green-700 text-xs font-semibold mb-1">Invite sent! Share this link:</p>
                <p className="text-green-600 text-xs break-all font-mono">{inviteSuccess}</p>
              </div>
            )}
            <button
              onClick={handleSendInvite}
              disabled={!inviteEmail.trim() || inviteSending}
              className="w-full py-2.5 rounded-xl bg-brand disabled:opacity-40 text-white font-bold text-sm transition-colors"
            >
              {inviteSending ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        )}

        {/* Members list */}
        {membersLoading ? (
          <p className="text-ink-muted text-sm text-center py-4 animate-pulse">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-4">No members found. Invite someone to join your family!</p>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 py-2 border-b border-line-subtle last:border-0">
                <span className="text-xl">{getRelEmoji(m.relationship)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-primary font-medium text-sm truncate">{m.display_name}</p>
                  <p className="text-ink-muted text-xs">{getRelLabel(m.relationship)}</p>
                </div>
                {m.is_owner && (
                  <span className="text-[10px] font-bold text-brand bg-brand-light px-2 py-0.5 rounded-full">Owner</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pending invites */}
        {invites.length > 0 && (
          <div className="mt-4 pt-3 border-t border-line-subtle">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-2">Pending Invites</p>
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center gap-3 py-2 border-b border-line-subtle last:border-0">
                <span className="text-lg opacity-50">{getRelEmoji(inv.relationship)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-ink-secondary text-sm truncate">{inv.email || 'Link invite'}</p>
                  <p className="text-ink-muted text-xs">{getRelLabel(inv.relationship)} · {expiryLabel(inv.expires_at)}</p>
                </div>
                <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Language */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <h2 className="text-sm font-semibold text-brand uppercase tracking-wide mb-3">{t('settings.language')}</h2>
        <div className="flex rounded-xl overflow-hidden border-2 border-line-subtle">
          <button
            onClick={() => setLocale('en')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              locale === 'en' ? 'bg-brand text-white' : 'text-brand hover:bg-page'
            }`}
          >
            {t('settings.lang.en')}
          </button>
          <button
            onClick={() => setLocale('zh')}
            className={`flex-1 py-2.5 text-sm font-bold transition-colors ${
              locale === 'zh' ? 'bg-brand text-white' : 'text-brand hover:bg-page'
            }`}
          >
            {t('settings.lang.zh')}
          </button>
        </div>
      </section>

      {/* Sound Effects */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-brand uppercase tracking-wide">Sound Effects</h2>
            <p className="text-ink-muted text-xs mt-1">Play sounds on earn, deduct, and redeem</p>
          </div>
          <button
            onClick={() => {
              const next = !soundEnabled
              setSoundEnabled(next)
              saveMeta({ soundEnabled: next })
            }}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              soundEnabled ? 'bg-brand' : 'bg-gray-300'
            }`}
          >
            <span
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                soundEnabled ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Manage Categories */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-brand uppercase tracking-wide">Categories</h2>
          <button
            onClick={() => setShowAddCat(v => !v)}
            className="text-sm text-brand hover:text-ink-secondary font-medium transition-colors"
          >
            {showAddCat ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showAddCat && (
          <div className="flex gap-2 mb-4">
            <input
              value={newCatEmoji}
              onChange={e => setNewCatEmoji(e.target.value)}
              maxLength={2}
              className="w-14 text-center rounded-xl border-2 border-line px-2 py-2 text-xl outline-none focus:border-brand"
            />
            <input
              autoFocus
              placeholder="Category name"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory() }}
              className="flex-1 rounded-xl border-2 border-line px-3 py-2 text-ink-primary outline-none focus:border-brand"
            />
            <button
              onClick={handleAddCategory}
              disabled={!newCatName.trim()}
              className="px-4 py-2 rounded-xl bg-brand disabled:opacity-40 text-white font-bold hover:bg-brand-hover transition-colors text-sm"
            >
              Add
            </button>
          </div>
        )}

        {store.categories.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-4">No categories yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {store.categories.map(cat => (
              <div key={cat.id} className="flex items-center gap-3 py-2 border-b border-line-subtle last:border-0">
                <span className="text-xl">{cat.icon}</span>
                <span className="flex-1 text-ink-primary font-medium">{cat.name}</span>
                <button
                  onClick={() => handleDeleteCategory(cat)}
                  className="text-red-300 hover:text-red-500 text-sm transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="bg-red-50 rounded-2xl p-5 shadow-card border border-red-100">
        <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wide mb-3">Danger Zone</h2>
        <p className="text-red-600 text-sm mb-4">
          This will permanently delete all family data including kids, actions, rewards, and history. This cannot be undone.
        </p>
        {!showResetConfirm ? (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full py-3 rounded-2xl bg-red-100 hover:bg-red-200 text-red-600 font-bold transition-colors"
          >
            Reset all data
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-red-700 font-bold text-center">Are you absolutely sure?</p>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
            >
              Yes, delete everything
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="text-center text-red-400 text-sm"
            >
              Cancel
            </button>
          </div>
        )}
      </section>
    </main>
  )
}
