'use client'

import { useState } from 'react'
import { useFamily } from '@/context/FamilyContext'
import { AvatarPicker } from '@/components/AvatarPicker'
import { AvatarDisplay } from '@/components/AvatarDisplay'
import type { FamilyMember, FamilyRole, FamilyInvite } from '@/types'

const ROLES: { value: FamilyRole; label: string; emoji: string }[] = [
  { value: 'mother', label: 'Mother', emoji: '👩' },
  { value: 'father', label: 'Father', emoji: '👨' },
  { value: 'grandma', label: 'Grandma', emoji: '👵' },
  { value: 'grandpa', label: 'Grandpa', emoji: '👴' },
  { value: 'aunt', label: 'Aunt', emoji: '👩‍🦰' },
  { value: 'uncle', label: 'Uncle', emoji: '👨‍🦱' },
  { value: 'nanny', label: 'Nanny', emoji: '🧑‍🍼' },
  { value: 'other', label: 'Other', emoji: '👤' },
]

function getRoleLabel(role: FamilyRole): string {
  return ROLES.find(r => r.value === role)?.label ?? role
}

function getRoleEmoji(role: FamilyRole): string {
  return ROLES.find(r => r.value === role)?.emoji ?? '👤'
}

export default function FamilyMembersPage() {
  const {
    store,
    addFamilyMember,
    updateFamilyMember,
    removeFamilyMember,
    createFamilyInvite,
    removeFamilyInvite,
  } = useFamily()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<FamilyMember | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('👩')
  const [role, setRole] = useState<FamilyRole>('mother')
  const [birthday, setBirthday] = useState('')
  const [showAvatarPicker, setShowAvatarPicker] = useState(false)

  // Invite state
  const [showInvite, setShowInvite] = useState(false)
  const [inviteRole, setInviteRole] = useState<FamilyRole>('mother')
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  // Determine which roles are already taken (single-occupancy)
  const takenRoles = new Set(store.familyMembers.map(m => m.role))

  function getAvailableRoles(currentRole?: FamilyRole) {
    const singleOccupancy: FamilyRole[] = ['mother', 'father']
    return ROLES.filter(r => {
      if (singleOccupancy.includes(r.value) && takenRoles.has(r.value) && r.value !== currentRole) {
        return false
      }
      return true
    })
  }

  function openNew() {
    setEditing(null)
    setName('')
    setAvatar('👩')
    setRole('mother')
    setBirthday('')
    setShowForm(true)
  }

  function openEdit(member: FamilyMember) {
    setEditing(member)
    setName(member.name)
    setAvatar(member.avatar)
    setRole(member.role)
    setBirthday(member.birthday ?? '')
    setShowForm(true)
  }

  function handleSave() {
    if (!name.trim()) return
    if (editing) {
      updateFamilyMember({
        ...editing,
        name: name.trim(),
        avatar,
        role,
        birthday: birthday || undefined,
      })
    } else {
      addFamilyMember({
        name: name.trim(),
        avatar,
        role,
        birthday: birthday || undefined,
      })
    }
    setShowForm(false)
  }

  function handleRemove(member: FamilyMember) {
    if (confirm(`Remove ${member.name} from the family?`)) {
      removeFamilyMember(member.id)
    }
  }

  function handleCreateInvite() {
    const invite = createFamilyInvite(inviteRole)
    const url = `${window.location.origin}/invite?token=${invite.token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedInviteId(invite.id)
      setTimeout(() => setCopiedInviteId(null), 3000)
    }).catch(() => {
      // Fallback: select text
    })
    setShowInvite(false)
  }

  function copyInviteLink(invite: FamilyInvite) {
    const url = `${window.location.origin}/invite?token=${invite.token}`
    navigator.clipboard.writeText(url).then(() => {
      setCopiedInviteId(invite.id)
      setTimeout(() => setCopiedInviteId(null), 3000)
    }).catch(() => {})
  }

  const activeInvites = store.familyInvites.filter(
    i => new Date(i.expiresAt) > new Date(),
  )

  return (
    <main className="p-5 max-w-lg mx-auto pb-28">
      <header className="flex items-center justify-between mb-6 pt-4">
        <h1 className="text-2xl font-bold text-ink-primary">Family Members</h1>
        <button
          onClick={openNew}
          className="px-4 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-colors text-sm"
        >
          + Add
        </button>
      </header>

      {/* Members list */}
      {store.familyMembers.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-5xl mb-3">👨‍👩‍👧</div>
          <p className="text-ink-secondary mb-1">No family members yet.</p>
          <p className="text-brand text-sm mb-4">Add parents, grandparents, and other caregivers.</p>
          <button
            onClick={openNew}
            className="px-5 py-2 rounded-xl bg-brand text-white font-bold hover:bg-brand-hover transition-colors text-sm"
          >
            Add first member
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-6">
          {store.familyMembers.map(member => (
            <div
              key={member.id}
              className="bg-white rounded-2xl p-4 shadow-card flex items-center gap-3"
            >
              <AvatarDisplay avatar={member.avatar} size={48} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-ink-primary">{member.name}</p>
                <div className="flex items-center gap-2 text-sm text-ink-secondary">
                  <span>{getRoleEmoji(member.role)} {getRoleLabel(member.role)}</span>
                  {member.birthday && (
                    <>
                      <span className="text-ink-muted">·</span>
                      <span>🎂 {member.birthday}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(member)}
                  className="text-ink-muted hover:text-ink-secondary text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleRemove(member)}
                  className="text-red-300 hover:text-red-500 text-sm"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite section */}
      <section className="bg-white rounded-2xl p-5 shadow-card mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-brand uppercase tracking-wide">Invite Link</h2>
          <button
            onClick={() => setShowInvite(true)}
            className="text-sm text-brand hover:text-ink-secondary font-medium transition-colors"
          >
            + Create
          </button>
        </div>
        <p className="text-ink-muted text-xs mb-3">
          Create a link to invite family members. Links expire after 24 hours.
        </p>

        {activeInvites.length === 0 ? (
          <p className="text-ink-muted text-sm text-center py-3">No active invites.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeInvites.map(invite => {
              const expiresIn = Math.max(0, Math.round((new Date(invite.expiresAt).getTime() - Date.now()) / 3600000))
              return (
                <div key={invite.id} className="flex items-center gap-3 py-2 border-b border-line-subtle last:border-0">
                  <span className="text-lg">{getRoleEmoji(invite.role)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink-primary text-sm font-medium">{getRoleLabel(invite.role)}</p>
                    <p className="text-ink-muted text-xs">Expires in {expiresIn}h</p>
                  </div>
                  <button
                    onClick={() => copyInviteLink(invite)}
                    className="px-3 py-1 rounded-lg bg-brand-light text-brand text-xs font-bold hover:bg-brand hover:text-white transition-colors"
                  >
                    {copiedInviteId === invite.id ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => removeFamilyInvite(invite.id)}
                    className="text-red-300 hover:text-red-500 text-xs"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Create Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowInvite(false)}>
          <div className="bg-white w-full rounded-t-3xl p-6 flex flex-col gap-4 max-w-lg mx-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-ink-primary">Create Invite Link</h2>

            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-2 uppercase tracking-wide">
                Role for invitee
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ROLES.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setInviteRole(r.value)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                      inviteRole === r.value
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-line text-ink-secondary hover:border-line-subtle'
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateInvite}
              className="w-full py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-bold transition-colors"
            >
              Create & Copy Link
            </button>
            <button onClick={() => setShowInvite(false)} className="text-center text-ink-muted text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit member modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end" onClick={() => setShowForm(false)}>
          <div
            className="bg-white w-full rounded-t-3xl p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto max-w-lg mx-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-ink-primary">
              {editing ? 'Edit Member' : 'Add Family Member'}
            </h2>

            {/* Avatar */}
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-2 uppercase tracking-wide">
                Avatar
              </label>
              {showAvatarPicker ? (
                <div>
                  <AvatarPicker value={avatar} onChange={(v) => { setAvatar(v); setShowAvatarPicker(false) }} />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="flex items-center gap-3 w-full p-3 rounded-xl border-2 border-line hover:border-brand transition-colors"
                >
                  <AvatarDisplay avatar={avatar} size={48} />
                  <span className="text-sm text-brand font-medium">Tap to change avatar</span>
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wide">
                Name
              </label>
              <input
                autoFocus
                autoComplete="off"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Sarah"
                className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink-primary outline-none focus:border-brand transition-colors"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-2 uppercase tracking-wide">
                Relationship to kids
              </label>
              <div className="grid grid-cols-4 gap-2">
                {getAvailableRoles(editing?.role).map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all ${
                      role === r.value
                        ? 'border-brand bg-brand-light text-brand'
                        : 'border-line text-ink-secondary hover:border-line-subtle'
                    }`}
                  >
                    <span className="text-lg">{r.emoji}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Birthday */}
            <div>
              <label className="block text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wide">
                Birthday (optional)
              </label>
              <input
                type="date"
                value={birthday}
                onChange={e => setBirthday(e.target.value)}
                className="w-full rounded-xl border-2 border-line px-4 py-3 text-ink-primary outline-none focus:border-brand transition-colors"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="w-full py-3 rounded-2xl bg-brand hover:bg-brand-hover disabled:opacity-40 text-white font-bold transition-colors"
            >
              {editing ? 'Save Changes' : 'Add Member'}
            </button>
            <button onClick={() => setShowForm(false)} className="text-center text-ink-muted text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
