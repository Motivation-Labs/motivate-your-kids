// Avatar utility — supports emoji, preset SVGs, and uploaded photo URLs.

export type AvatarType = 'emoji' | 'preset' | 'url'

export interface ParsedAvatar {
  type: AvatarType
  value: string
}

/** Preset avatar filenames (without extension). User will supply SVGs in /public/avatars/presets/ */
export const PRESET_AVATARS = [
  'bear', 'bunny', 'cat', 'dog', 'elephant', 'fox',
  'giraffe', 'koala', 'lion', 'monkey', 'owl', 'panda',
  'penguin', 'tiger', 'unicorn', 'whale',
] as const

/** Default emoji avatars (existing set from the app) */
export const EMOJI_AVATARS = [
  '🧒', '👧', '👦', '👶', '🧒🏻', '👧🏻', '👦🏻',
  '🐱', '🐶', '🐰', '🦊', '🐼', '🐨', '🦁',
  '🐸', '🐵', '🦄', '🐧', '🐻', '🐯',
]

/** Parse an avatar string into its type and display value */
export function parseAvatar(avatar: string): ParsedAvatar {
  if (avatar.startsWith('preset:')) {
    return { type: 'preset', value: avatar.slice(7) }
  }
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return { type: 'url', value: avatar }
  }
  return { type: 'emoji', value: avatar }
}

/** Get the display src for a preset avatar */
export function presetAvatarSrc(name: string): string {
  return `/avatars/presets/${name}.svg`
}
