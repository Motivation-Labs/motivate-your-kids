'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

type SignupMode = 'password' | 'magic-link'

function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [signupMode, setSignupMode] = useState<SignupMode>('password')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  async function handleGoogleSignup() {
    setError('')
    setGoogleLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setGoogleLoading(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMagicLinkSent(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-5xl mb-4">📬</p>
          <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
            Check your email!
          </h1>
          <p className="text-white/80 mt-2 font-[Nunito] font-semibold text-sm leading-relaxed">
            We sent a confirmation link to <strong>{email}</strong>.
            Click it to activate your account.
          </p>
        </div>
      </div>
    )
  }

  if (magicLinkSent) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-5xl mb-4">✨</p>
          <h1 className="text-2xl font-extrabold text-white font-[Nunito]">
            Magic link sent!
          </h1>
          <p className="text-white/80 mt-2 font-[Nunito] font-semibold text-sm leading-relaxed">
            Check <strong>{email}</strong> for a sign-in link.
            Click it to create your account — no password needed!
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
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🌟</p>
          <h1 className="text-3xl font-extrabold text-white font-[Nunito]">
            Create Account
          </h1>
          <p className="text-white/70 mt-1 font-[Nunito] font-semibold">
            Start your family&apos;s rewards journey
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
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

        {/* Signup mode toggle */}
        <div className="flex rounded-xl overflow-hidden border-2 border-white/30 mb-4">
          <button
            type="button"
            onClick={() => { setSignupMode('password'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
              signupMode === 'password' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setSignupMode('magic-link'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
              signupMode === 'magic-link' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Magic Link
          </button>
        </div>

        {signupMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />
            <input
              type="password"
              placeholder="Password (6+ characters)"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />

            {error && (
              <p className="text-red-200 text-sm font-[Nunito] font-semibold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#FFC800] text-[#3C3C3C] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#CC9F00] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Creating...' : 'Sign Up'}
            </button>
          </form>
        )}

        {signupMode === 'magic-link' && (
          <form onSubmit={handleMagicLink} className="space-y-4">
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-semibold placeholder:text-gray-400 outline-none"
            />

            {error && (
              <p className="text-red-200 text-sm font-[Nunito] font-semibold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 rounded-2xl bg-[#FFC800] text-[#3C3C3C] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#CC9F00] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>

            <p className="text-white/60 text-xs font-[Nunito] font-semibold text-center">
              No password needed — just click the link in your email
            </p>
          </form>
        )}

        <p className="text-center mt-6 text-white/80 font-[Nunito] font-semibold text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-white underline font-bold">
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
