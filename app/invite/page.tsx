'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MemberRelationship } from '@/lib/supabase/types'

const RELATIONSHIPS: { value: MemberRelationship; label: string; emoji: string }[] = [
  { value: 'mother', label: 'Mom / Mama', emoji: '👩' },
  { value: 'father', label: 'Dad / Papa', emoji: '👨' },
  { value: 'grandma', label: 'Grandma', emoji: '👵' },
  { value: 'grandpa', label: 'Grandpa', emoji: '👴' },
  { value: 'aunt', label: 'Aunt', emoji: '👩‍🦰' },
  { value: 'uncle', label: 'Uncle', emoji: '👨‍🦰' },
  { value: 'other', label: 'Other', emoji: '🧑' },
]

interface InviteData {
  id: string
  family_id: string
  relationship: string
  families: { name: string }
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteFlow />
    </Suspense>
  )
}

type AuthMethod = 'password' | 'magic-link'

function InviteFlow() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'loading' | 'auth' | 'configure' | 'error'>('loading')

  const [displayName, setDisplayName] = useState('')
  const [relationship, setRelationship] = useState<MemberRelationship>('mother')
  const [submitting, setSubmitting] = useState(false)

  // Auth form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [authMethod, setAuthMethod] = useState<AuthMethod>('magic-link')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  useEffect(() => {
    if (!token) {
      setError('No invite token provided')
      setStep('error')
      setLoading(false)
      return
    }

    async function validateInvite() {
      const res = await fetch(`/api/invite?token=${token}`)
      if (!res.ok) {
        const body = await res.json()
        setError(body.error || 'Invalid invite')
        setStep('error')
        setLoading(false)
        return
      }

      const { invite: inv } = await res.json()
      setInvite(inv)
      setRelationship(inv.relationship)

      // Check if user is already logged in
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setDisplayName(user.user_metadata?.display_name || '')
        setStep('configure')
      } else {
        setStep('auth')
      }
      setLoading(false)
    }

    validateInvite()
  }, [token])

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const supabase = createClient()

    if (authMode === 'signup') {
      if (authMethod === 'magic-link') {
        // Magic link signup — no password needed
        const { error: authError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            data: { display_name: displayName },
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(`/invite?token=${token}`)}`,
          },
        })
        if (authError) {
          setError(authError.message)
          setSubmitting(false)
          return
        }
        setMagicLinkSent(true)
        setSubmitting(false)
        return
      }

      // Password signup
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
          emailRedirectTo: `${window.location.origin}/invite?token=${token}`,
        },
      })
      if (authError) {
        setError(authError.message)
        setSubmitting(false)
        return
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStep('configure')
      } else {
        setError('Check your email to confirm your account, then come back to this link.')
      }
    } else {
      // Login
      if (authMethod === 'magic-link') {
        const { error: authError } = await supabase.auth.signInWithOtp({ email })
        if (authError) {
          setError(authError.message)
          setSubmitting(false)
          return
        }
        setMagicLinkSent(true)
        setSubmitting(false)
        return
      }

      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (authError) {
        setError(authError.message)
        setSubmitting(false)
        return
      }
      setStep('configure')
    }

    setSubmitting(false)
  }

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    const res = await fetch('/api/invite/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        displayName,
        relationship,
      }),
    })

    if (!res.ok) {
      const body = await res.json()
      setError(body.error || 'Failed to accept invite')
      setSubmitting(false)
      return
    }

    router.push('/parent')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex items-center justify-center">
        <p className="text-white font-[Nunito] font-bold text-lg animate-pulse">
          Loading invite...
        </p>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
        <div className="text-center">
          <p className="text-5xl mb-4">😔</p>
          <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
            Invite Not Valid
          </h1>
          <p className="text-white/80 mt-2 font-[Nunito] font-semibold text-sm">
            {error}
          </p>
          <a
            href="/login"
            className="inline-block mt-6 px-6 h-12 leading-[48px] rounded-2xl bg-white text-[#58CC02] font-[Nunito] font-extrabold shadow-[0_4px_0_#d1d5db]"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  const familyName = invite?.families?.name || 'a family'

  if (step === 'auth') {
    if (magicLinkSent) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-sm text-center">
            <p className="text-5xl mb-4">✨</p>
            <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
              Check your email!
            </h1>
            <p className="text-white/80 mt-2 font-[Nunito] font-semibold text-sm leading-relaxed">
              We sent a {authMode === 'signup' ? 'sign-up' : 'login'} link to <strong>{email}</strong>.
              Click it to join <strong>{familyName}</strong>!
            </p>
            <button
              onClick={() => { setMagicLinkSent(false); setError('') }}
              className="mt-6 text-white/70 font-[Nunito] font-semibold text-sm underline"
            >
              ← Use a different email
            </button>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <p className="text-5xl mb-3">🎉</p>
            <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
              You&apos;re invited to join
            </h1>
            <p className="text-white font-[Nunito] font-bold text-lg mt-1">
              {familyName}
            </p>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError('')
              setGoogleLoading(true)
              const supabase = createClient()
              const { error: authError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                  redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(`/invite?token=${token}`)}`,
                },
              })
              if (authError) {
                setError(authError.message)
                setGoogleLoading(false)
              }
            }}
            disabled={googleLoading}
            className="w-full h-14 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-extrabold text-base shadow-[0_4px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.01 24.01 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
            {googleLoading ? 'Redirecting...' : 'Continue with Google'}
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/30" />
            <span className="text-white/60 font-[Nunito] font-semibold text-xs uppercase">or</span>
            <div className="flex-1 h-px bg-white/30" />
          </div>

          {/* Auth method toggle */}
          <div className="flex rounded-xl overflow-hidden border-2 border-white/30 mb-4">
            <button
              type="button"
              onClick={() => { setAuthMethod('magic-link'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
                authMethod === 'magic-link' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Magic Link
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('password'); setError('') }}
              className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
                authMethod === 'password' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              Password
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'signup' && (
              <input
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />
            {authMethod === 'password' && (
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
              />
            )}

            {error && (
              <p className="text-red-200 text-sm font-[Nunito] font-semibold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-14 rounded-2xl bg-[#FFC800] text-[#3C3C3C] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#CC9F00] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {submitting
                ? 'Please wait...'
                : authMethod === 'magic-link'
                  ? (authMode === 'signup' ? 'Send Magic Link' : 'Send Login Link')
                  : (authMode === 'signup' ? 'Sign Up & Join' : 'Log In & Join')
              }
            </button>
          </form>

          {authMethod === 'magic-link' && (
            <p className="text-white/60 text-xs font-[Nunito] font-semibold text-center mt-2">
              No password needed — just click the link in your email
            </p>
          )}

          <p className="text-center mt-5 text-white/80 font-[Nunito] font-semibold text-sm">
            {authMode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button onClick={() => setAuthMode('login')} className="text-white underline font-bold">
                  Log In
                </button>
              </>
            ) : (
              <>
                Need an account?{' '}
                <button onClick={() => setAuthMode('signup')} className="text-white underline font-bold">
                  Sign Up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    )
  }

  // step === 'configure'
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-5xl mb-3">👋</p>
          <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
            Almost there!
          </h1>
          <p className="text-white/80 mt-1 font-[Nunito] font-semibold text-sm">
            Set up your role in <strong>{familyName}</strong>
          </p>
        </div>

        <form onSubmit={handleAccept} className="space-y-5">
          <div>
            <label className="text-white/80 font-[Nunito] font-semibold text-xs uppercase tracking-wider block mb-2">
              Your name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold outline-none"
            />
          </div>

          <div>
            <label className="text-white/80 font-[Nunito] font-semibold text-xs uppercase tracking-wider block mb-2">
              Your relationship
            </label>
            <div className="grid grid-cols-2 gap-3">
              {RELATIONSHIPS.map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRelationship(r.value)}
                  className={`h-12 rounded-2xl font-[Nunito] font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    relationship === r.value
                      ? 'bg-white text-[#58CC02] shadow-[0_3px_0_#d1d5db]'
                      : 'bg-white/20 text-white'
                  }`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-200 text-sm font-[Nunito] font-semibold text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 rounded-2xl bg-[#FFC800] text-[#3C3C3C] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#CC9F00] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
          >
            {submitting ? 'Joining...' : 'Join Family 🎉'}
          </button>
        </form>
      </div>
    </div>
  )
}
