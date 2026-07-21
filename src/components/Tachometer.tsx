import { motion } from 'framer-motion'
import { clamp } from '../utils/timer'

interface TachometerProps {
  rpm: number
  critical: boolean
  intensity: number
}

export function Tachometer({ rpm, critical, intensity }: TachometerProps) {
  const normalized = clamp((rpm - 1000) / 7000, 0, 1)
  const angle = -126 + normalized * 252

  const majorTicks = Array.from({ length: 9 }, (_, index) => {
    const tickAngle = -126 + index * 31.5
    return {
      index,
      angle: tickAngle,
      x1: 50 + Math.cos((tickAngle * Math.PI) / 180) * 38,
      y1: 56 + Math.sin((tickAngle * Math.PI) / 180) * 38,
      x2: 50 + Math.cos((tickAngle * Math.PI) / 180) * 44,
      y2: 56 + Math.sin((tickAngle * Math.PI) / 180) * 44,
      lx: 50 + Math.cos((tickAngle * Math.PI) / 180) * 29,
      ly: 56 + Math.sin((tickAngle * Math.PI) / 180) * 29,
    }
  })

  const minorTicks = Array.from({ length: 36 }, (_, index) => {
    const tickAngle = -126 + index * 7
    const isRedline = tickAngle >= 83
    return {
      angle: tickAngle,
      x1: 50 + Math.cos((tickAngle * Math.PI) / 180) * (isRedline ? 40 : 41),
      y1: 56 + Math.sin((tickAngle * Math.PI) / 180) * (isRedline ? 40 : 41),
      x2: 50 + Math.cos((tickAngle * Math.PI) / 180) * 44.5,
      y2: 56 + Math.sin((tickAngle * Math.PI) / 180) * 44.5,
      stroke: isRedline ? '#ef4444' : '#d4d4d8',
      width: isRedline ? 0.48 : 0.36,
    }
  })

  return (
    <div className="relative w-full max-w-[680px] rounded-[2.3rem] border border-zinc-700 bg-zinc-950/70 p-5 shadow-[inset_0_0_50px_rgba(0,0,0,0.85)]">
      <div className="relative mx-auto aspect-square w-full max-w-[560px] overflow-hidden rounded-full border-[6px] border-zinc-700 bg-gradient-to-b from-zinc-700 via-zinc-900 to-zinc-950 shadow-[inset_0_0_60px_rgba(0,0,0,0.95)]">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <defs>
            <radialGradient id="dialFace" cx="45%" cy="38%" r="65%">
              <stop offset="0%" stopColor="#3f3f46" />
              <stop offset="45%" stopColor="#1f2126" />
              <stop offset="100%" stopColor="#121316" />
            </radialGradient>
          </defs>

          <circle cx="50" cy="56" r="45" fill="url(#dialFace)" />
          <circle cx="50" cy="56" r="44.5" fill="none" stroke="#111216" strokeWidth="0.55" />

          {minorTicks.map((tick) => (
            <line
              key={`minor-${tick.angle}`}
              x1={tick.x1}
              y1={tick.y1}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.stroke}
              strokeWidth={tick.width}
              strokeLinecap="round"
              opacity="0.95"
            />
          ))}

          {majorTicks.map((tick) => (
            <g key={`major-${tick.index}`}>
              <line
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                stroke="#f4f4f5"
                strokeWidth="0.9"
                strokeLinecap="round"
              />
              <text
                x={tick.lx}
                y={tick.ly + 1.7}
                fill="#f4f4f5"
                fontSize="6.8"
                textAnchor="middle"
                fontFamily="Orbitron, sans-serif"
              >
                {tick.index}
              </text>
            </g>
          ))}

          <text x="50" y="36" fill="#e5e7eb" fontSize="8" textAnchor="middle" fontFamily="Rajdhani, sans-serif">
            RPM
          </text>
          <text x="50" y="72" fill="#e5e7eb" fontSize="5.4" textAnchor="middle" fontFamily="Rajdhani, sans-serif">
            1/min
          </text>
          <text x="50" y="78" fill="#e5e7eb" fontSize="5.4" textAnchor="middle" fontFamily="Rajdhani, sans-serif">
            x1000
          </text>
        </svg>

        <motion.div
          className="absolute left-1/2 top-[56%] h-[2.2%] origin-left rounded-full bg-gradient-to-r from-[#ff8b1f] to-[#ff4d00] shadow-[0_0_12px_rgba(255,130,0,0.9)]"
          style={{ width: '36%', transformOrigin: '0% 50%' }}
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

        <div className="absolute left-1/2 top-[56%] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-zinc-700 bg-zinc-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.9)]" />
      </div>

      <div className="mt-4 text-center font-digital text-2xl tracking-[0.2em] text-orange-400">{Math.round(rpm)}</div>
    </div>
  )
}
