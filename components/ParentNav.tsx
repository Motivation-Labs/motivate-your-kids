'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/parent', label: 'Home', icon: '🏠', exact: true },
  { href: '/parent/actions', label: 'Actions', icon: '✅' },
  { href: '/parent/rewards', label: 'Rewards', icon: '🎁' },
  { href: '/parent/more', label: 'More', icon: '☰' },
]

export function ParentNav() {
  const pathname = usePathname()

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
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
