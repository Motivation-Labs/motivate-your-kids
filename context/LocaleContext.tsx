'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { loadMeta, saveMeta, type Locale } from '@/lib/meta'
import { getT } from '@/lib/i18n'

interface LocaleContextValue {
  locale: Locale
  setLocale: (lang: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')

  useEffect(() => {
    const meta = loadMeta()
    if (meta.language) setLocaleState(meta.language)
  }, [])

  const setLocale = useCallback((lang: Locale) => {
    saveMeta({ language: lang })
    setLocaleState(lang)
  }, [])

  const t = useCallback(getT(locale), [locale])

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) throw new Error('useLocale must be inside <LocaleProvider>')
  return ctx
}
