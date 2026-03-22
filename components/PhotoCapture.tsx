'use client'

import { useRef } from 'react'

interface PhotoCaptureProps {
  value: string | undefined
  onChange: (dataUrl: string | undefined) => void
  maxSizeKB?: number
}

export function PhotoCapture({ value, onChange, maxSizeKB = 200 }: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    const reader = new FileReader()
    reader.onload = () => {
      img.onload = () => {
        // Resize to max 800px and compress
        const canvas = document.createElement('canvas')
        const maxDim = 800
        let w = img.width
        let h = img.height
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = (h / w) * maxDim; w = maxDim }
          else { w = (w / h) * maxDim; h = maxDim }
        }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, w, h)

        // Try WebP first, fall back to JPEG
        let quality = 0.8
        let dataUrl = canvas.toDataURL('image/webp', quality)
        if (dataUrl.length > maxSizeKB * 1024 * 1.37) {
          quality = 0.5
          dataUrl = canvas.toDataURL('image/webp', quality)
        }
        if (dataUrl.length > maxSizeKB * 1024 * 1.37) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.5)
        }
        onChange(dataUrl)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
    // Reset input so same file can be selected again
    e.target.value = ''
  }

  if (value) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-line flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Attached photo" className="w-full h-full object-cover" />
        </div>
        <span className="text-xs text-ink-muted flex-1">Photo attached</span>
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="text-red-300 hover:text-red-500 text-xs"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-page text-ink-secondary text-xs font-bold border-2 border-line hover:border-brand hover:text-brand transition-colors"
      >
        📷 Add Photo
      </button>
    </div>
  )
}
