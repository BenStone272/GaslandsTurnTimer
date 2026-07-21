import { motion } from 'framer-motion'
import { AiFillWarning } from 'react-icons/ai'

interface WarningLightsProps {
  yellowOn: boolean
  redOn: boolean
  criticalOn: boolean
}

function Light({ active, color, label }: { active: boolean; color: string; label: string }) {
  return (
    <motion.div
      animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.25 }}
      transition={{ duration: active ? 0.45 : 0.2, repeat: active ? Infinity : 0 }}
      className="flex min-w-[96px] items-center gap-2 rounded-full border border-zinc-700 px-3 py-2 text-xs uppercase tracking-[0.22em] text-zinc-300"
    >
      <AiFillWarning className={`text-lg ${color}`} aria-hidden="true" />
      <span>{label}</span>
    </motion.div>
  )
}

export function WarningLights({ yellowOn, redOn, criticalOn }: WarningLightsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      <Light active={yellowOn} color="text-yellow-400" label="Warning" />
      <Light active={redOn} color="text-red-500" label="Danger" />
      <Light active={criticalOn} color="text-red-600" label="Critical" />
    </div>
  )
}
