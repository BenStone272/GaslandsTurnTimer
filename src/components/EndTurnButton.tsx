import { motion } from 'framer-motion'

interface EndTurnButtonProps {
  label: string
  onClick: () => void
  tone: 'normal' | 'critical'
}

export function EndTurnButton({ label, onClick, tone }: EndTurnButtonProps) {
  const className =
    tone === 'critical'
      ? 'from-red-800 via-red-600 to-orange-500'
      : 'from-zinc-300 via-zinc-100 to-zinc-300'

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`mx-auto min-h-24 w-full max-w-md rounded-full border-4 border-zinc-950 bg-gradient-to-b px-8 py-5 text-xl font-black uppercase tracking-[0.2em] text-zinc-950 shadow-[0_16px_35px_rgba(0,0,0,0.65)] ${className}`}
    >
      {label}
    </motion.button>
  )
}
