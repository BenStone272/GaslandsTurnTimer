export function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function progressFromRemaining(remainingMs: number, durationMs: number): number {
  if (durationMs <= 0) return 1
  return clamp(1 - remainingMs / durationMs, 0, 1)
}

export function rpmFromProgress(progress: number): number {
  if (progress <= 0.25) return 1000 + progress * 6000
  if (progress <= 0.5) return 2500 + (progress - 0.25) * 8000
  if (progress <= 0.75) return 4500 + (progress - 0.5) * 6000
  return 6000 + (progress - 0.75) * 8000
}
