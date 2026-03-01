'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'

const tabs = [
  { href: '/parent', key: 'nav.home', icon: '🏠', exact: true },
  { href: '/parent/actions', key: 'nav.actions', icon: '✅' },
  { href: '/parent/rewards', key: 'nav.rewards', icon: '🎁' },
  { href: '/parent/more', key: 'nav.more', icon: '☰' },
]

export function ParentNav() {
  const pathname = usePathname()
  const { t } = useLocale()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-amber-100 flex z-40">
      {tabs.map(tab => {
        const active = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              active ? 'text-amber-600' : 'text-amber-400 hover:text-amber-500'
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span>{t(tab.key)}</span>
          </Link>
        )
      })}
    </nav>
  )
}
