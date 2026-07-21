import { motion } from 'framer-motion'
import { formatTime } from '../utils/timer'

interface TimerDisplayProps {
  remainingMs: number
  pulse: boolean
}

export function TimerDisplay({ remainingMs, pulse }: TimerDisplayProps) {
  return (
    <motion.div
      key={Math.ceil(remainingMs / 1000)}
      animate={pulse ? { scale: [1, 1.07, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
      className="font-digital text-[clamp(5rem,16vw,13rem)] leading-none tracking-[0.08em] text-amber-100 drop-shadow-[0_0_14px_rgba(255,120,0,0.6)]"
      aria-live="polite"
    >
      {formatTime(remainingMs)}
    </motion.div>
  )
}
