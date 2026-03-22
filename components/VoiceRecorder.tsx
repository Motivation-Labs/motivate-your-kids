'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface VoiceRecorderProps {
  value: string | undefined
  onChange: (dataUrl: string | undefined) => void
  maxDuration?: number // seconds, default 10
}

export function VoiceRecorder({ value, onChange, maxDuration = 10 }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [playing, setPlaying] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setRecording(false)
  }, [])

  // Auto-stop at max duration
  useEffect(() => {
    if (recording && elapsed >= maxDuration) {
      stopRecording()
    }
  }, [elapsed, maxDuration, recording, stopRecording])

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach(t => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onloadend = () => {
          onChange(reader.result as string)
        }
        reader.readAsDataURL(blob)
      }

      mediaRecorder.start()
      setElapsed(0)
      setRecording(true)

      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1)
      }, 1000)
    } catch {
      // Permission denied or no mic
    }
  }

  function togglePlay() {
    if (!value) return
    if (playing && audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setPlaying(false)
      return
    }
    const audio = new Audio(value)
    audioRef.current = audio
    audio.onended = () => setPlaying(false)
    audio.play()
    setPlaying(true)
  }

  function handleRemove() {
    if (audioRef.current) {
      audioRef.current.pause()
      setPlaying(false)
    }
    onChange(undefined)
  }

  if (value) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-xs font-bold border-2 border-green-200 hover:bg-green-100 transition-colors"
        >
          {playing ? '⏸ Pause' : '▶️ Play'}
        </button>
        <span className="text-xs text-ink-muted">Voice memo attached</span>
        <button
          type="button"
          onClick={handleRemove}
          className="text-red-300 hover:text-red-500 text-xs ml-auto"
        >
          Remove
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {recording ? (
        <>
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 text-xs font-bold border-2 border-red-200 hover:bg-red-100 transition-colors animate-pulse"
          >
            ⏹ Stop
          </button>
          <span className="text-xs text-red-500 font-mono font-bold">
            {elapsed}s / {maxDuration}s
          </span>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        </>
      ) : (
        <button
          type="button"
          onClick={startRecording}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-page text-ink-secondary text-xs font-bold border-2 border-line hover:border-brand hover:text-brand transition-colors"
        >
          🎙 Record Voice ({maxDuration}s max)
        </button>
      )}
    </div>
  )
}
