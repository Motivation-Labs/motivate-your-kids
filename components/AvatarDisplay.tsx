'use client'

import { parseAvatar, presetAvatarSrc } from '@/lib/avatars'

interface AvatarDisplayProps {
  avatar: string
  size?: number
  className?: string
}

/**
 * Renders any avatar type (emoji, preset SVG, uploaded photo URL) as a circular element.
 */
export function AvatarDisplay({ avatar, size = 48, className = '' }: AvatarDisplayProps) {
  const parsed = parseAvatar(avatar)

  if (parsed.type === 'emoji') {
    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-page flex-shrink-0 leading-none ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.55 }}
      >
        {parsed.value}
      </span>
    )
  }

  const src = parsed.type === 'preset' ? presetAvatarSrc(parsed.value) : parsed.value

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Avatar"
      className={`rounded-full object-cover flex-shrink-0 bg-page ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // Fallback to emoji on broken image
        const el = e.target as HTMLImageElement
        el.style.display = 'none'
        const span = document.createElement('span')
        span.textContent = '🧒'
        span.style.fontSize = `${size * 0.55}px`
        span.style.width = `${size}px`
        span.style.height = `${size}px`
        span.className = 'inline-flex items-center justify-center rounded-full bg-page'
        el.parentNode?.insertBefore(span, el)
      }}
    />
  )
}
