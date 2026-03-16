'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

type AuthMode = 'password' | 'otp'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('password')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/'

  async function handleGoogleLogin() {
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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = redirect
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setOtpSent(true)
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otpCode) return
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    window.location.href = redirect
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#58CC02] to-[#46A302] flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">⭐</p>
          <h1 className="text-3xl font-extrabold text-white font-[Nunito]">
            Welcome Back!
          </h1>
          <p className="text-white/70 mt-1 font-[Nunito] font-semibold">
            Log in to your family
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
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

        {/* Auth mode toggle */}
        <div className="flex rounded-xl overflow-hidden border-2 border-white/30 mb-4">
          <button
            type="button"
            onClick={() => { setAuthMode('password'); setError(''); setOtpSent(false) }}
            className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
              authMode === 'password' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('otp'); setError('') }}
            className={`flex-1 py-2.5 text-sm font-bold font-[Nunito] transition-colors ${
              authMode === 'otp' ? 'bg-white text-[#58CC02]' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            Email Code
          </button>
        </div>

        {authMode === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
              placeholder="Password"
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
              className="w-full h-14 rounded-2xl bg-white text-[#58CC02] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

        {authMode === 'otp' && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
              className="w-full h-14 rounded-2xl bg-white text-[#58CC02] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Sending...' : 'Send Login Code'}
            </button>

            <p className="text-white/60 text-xs font-[Nunito] font-semibold text-center">
              We&apos;ll send a 6-digit code to your email
            </p>
          </form>
        )}

        {authMode === 'otp' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-white/90 text-sm font-[Nunito] font-semibold">
                Code sent to <strong>{email}</strong>
              </p>
            </div>

            <input
              type="text"
              inputMode="numeric"
              placeholder="6-digit code"
              value={otpCode}
              onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              maxLength={6}
              autoFocus
              className="w-full h-14 px-4 rounded-2xl bg-white text-[#3C3C3C] font-[Nunito] font-extrabold text-2xl text-center tracking-[0.3em] placeholder:text-gray-400 placeholder:text-base placeholder:tracking-normal placeholder:font-semibold outline-none"
            />

            {error && (
              <p className="text-red-200 text-sm font-[Nunito] font-semibold text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || otpCode.length < 6}
              className="w-full h-14 rounded-2xl bg-white text-[#58CC02] font-[Nunito] font-extrabold text-lg shadow-[0_4px_0_#d1d5db] active:shadow-none active:translate-y-1 transition-all disabled:opacity-60"
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtpCode(''); setError('') }}
              className="w-full text-center text-white/70 font-[Nunito] font-semibold text-sm"
            >
              ← Use a different email
            </button>
          </form>
        )}

        <p className="text-center mt-6 text-white/80 font-[Nunito] font-semibold text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-white underline font-bold">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
