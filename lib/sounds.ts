// Web Audio API sound synthesis — zero external files.
// All sounds are generated programmatically for offline PWA support.

let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    try {
      audioCtx = new AudioContext()
    } catch {
      return null
    }
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.3,
  delay = 0,
) {
  const ctx = getCtx()
  if (!ctx) return

  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0, ctx.currentTime + delay)
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(ctx.currentTime + delay)
  osc.stop(ctx.currentTime + delay + duration)
}

/** Ascending major arpeggio — happy earn chime */
export function playEarnSound() {
  if (!isSoundEnabled()) return
  // C5 → E5 → G5 (major triad, ascending)
  playTone(523, 0.15, 'sine', 0.25, 0)
  playTone(659, 0.15, 'sine', 0.25, 0.1)
  playTone(784, 0.25, 'sine', 0.3, 0.2)
}

/** Soft descending minor tone — firm but gentle deduct sound */
export function playDeductSound() {
  if (!isSoundEnabled()) return
  // E4 → C4 (gentle descend)
  playTone(330, 0.2, 'triangle', 0.2, 0)
  playTone(262, 0.3, 'triangle', 0.15, 0.15)
}

/** Celebratory bell — redeem reward */
export function playRedeemSound() {
  if (!isSoundEnabled()) return
  // G5 → C6 (bright bell interval)
  playTone(784, 0.2, 'sine', 0.25, 0)
  playTone(1047, 0.35, 'sine', 0.3, 0.12)
  // Soft shimmer
  playTone(1319, 0.2, 'sine', 0.15, 0.25)
}

/** Subtle click — confirm button */
export function playClickSound() {
  if (!isSoundEnabled()) return
  playTone(800, 0.05, 'square', 0.08, 0)
}

/** Check if sound is enabled from meta storage */
function isSoundEnabled(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const raw = localStorage.getItem('motivate_your_kids_meta')
    if (!raw) return true // default on
    const meta = JSON.parse(raw)
    return meta.soundEnabled !== false // default on
  } catch {
    return true
  }
}
