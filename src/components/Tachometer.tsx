import { motion } from 'framer-motion'
import { clamp } from '../utils/timer'

interface TachometerProps {
  rpm: number
  critical: boolean
  intensity: number
}

export function Tachometer({ rpm, critical, intensity }: TachometerProps) {
  const normalized = clamp((rpm - 1000) / 7000, 0, 1)
  const angle = -120 + normalized * 240

  return (
    <div className="relative w-full max-w-[740px] rounded-[2.3rem] border border-zinc-700 bg-zinc-950/70 p-4 shadow-[inset_0_0_40px_rgba(0,0,0,0.9)]">
      <div className="absolute inset-x-8 top-3 flex justify-between text-xs uppercase tracking-[0.25em] text-zinc-500">
        <span>RPM x1000</span>
        <span className="text-red-500">Redline</span>
      </div>

      <div className="relative mx-auto mt-8 h-72 overflow-hidden rounded-full border border-zinc-700 bg-gradient-to-b from-zinc-900 to-zinc-950">
        <div className="absolute inset-10 rounded-full border border-zinc-700/70" />
        <div className="absolute inset-12 rounded-full border border-zinc-800" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.25),transparent_52%)]" />

        <motion.div
          className="absolute left-1/2 top-[86%] h-1.5 origin-left rounded-full bg-gradient-to-r from-zinc-200 to-red-500 shadow-[0_0_10px_rgba(255,50,0,0.8)]"
          style={{ width: '46%', transformOrigin: '0% 50%' }}
          animate={{
            rotate: critical
              ? [angle, angle + 1.8 * intensity, angle - 1.8 * intensity, angle]
              : angle,
          }}
          transition={{
            duration: critical ? 0.08 : 0.28,
            repeat: critical ? Infinity : 0,
            ease: 'easeInOut',
          }}
        />

        <div className="absolute left-1/2 top-[86%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-800 bg-zinc-300" />

        <div className="absolute inset-x-0 bottom-8 flex justify-center text-2xl font-bold tracking-[0.25em] text-orange-400">
          {Math.round(rpm)}
        </div>
      </div>
    </div>
  )
}
