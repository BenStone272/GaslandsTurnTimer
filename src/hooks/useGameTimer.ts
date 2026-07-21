import { useCallback, useEffect, useRef, useState } from 'react'

interface UseGameTimerOptions {
  durationMs: number
  onExpire?: () => void
}

export function useGameTimer({ durationMs, onExpire }: UseGameTimerOptions) {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const [isRunning, setIsRunning] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  const onExpireRef = useRef(onExpire)
  const remainingRef = useRef(durationMs)
  const endTimeRef = useRef<number | null>(null)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    onExpireRef.current = onExpire
  }, [onExpire])

  const stopFrame = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current)
      rafIdRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    setRemainingMs(durationMs)
    remainingRef.current = durationMs
    setIsExpired(false)
    endTimeRef.current = null
  }, [durationMs])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const start = useCallback(
    (fresh = false) => {
      if (fresh) {
        reset()
      }
      setIsRunning(true)
    },
    [reset],
  )

  useEffect(() => {
    if (!isRunning || isExpired) {
      stopFrame()
      return
    }

    const tick = (timestamp: number) => {
      if (endTimeRef.current === null) {
        endTimeRef.current = timestamp + remainingRef.current
      }

      const nextRemaining = Math.max(0, endTimeRef.current - timestamp)
      remainingRef.current = nextRemaining
      setRemainingMs(nextRemaining)

      if (nextRemaining <= 0) {
        setIsRunning(false)
        setIsExpired(true)
        onExpireRef.current?.()
        stopFrame()
        return
      }

      rafIdRef.current = requestAnimationFrame(tick)
    }

    rafIdRef.current = requestAnimationFrame(tick)

    return () => {
      stopFrame()
      endTimeRef.current = null
    }
  }, [isRunning, isExpired, stopFrame])

  useEffect(() => {
    reset()
  }, [durationMs, reset])

  return {
    remainingMs,
    isRunning,
    isExpired,
    start,
    pause,
    reset,
  }
}
