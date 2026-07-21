import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface DashboardProps {
  accentColor: string
  shaking: boolean
  children: ReactNode
}

export function Dashboard({ accentColor, shaking, children }: DashboardProps) {
  return (
    <motion.main
      animate={
        shaking
          ? {
              x: [0, -2, 2, -2, 2, 0],
              y: [0, 1, -1, 1, -1, 0],
            }
          : { x: 0, y: 0 }
      }
      transition={{ duration: 0.24, repeat: shaking ? Infinity : 0 }}
      className="relative mx-auto min-h-screen w-full max-w-screen-xl overflow-hidden px-4 pb-8 pt-6"
      style={{
        background:
          'radial-gradient(circle at 50% 10%, rgba(250,130,20,0.15), transparent 40%), linear-gradient(145deg, #181818, #0f0f10)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-35 [background-image:linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:30px_30px]" />
      <div className="absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl" style={{ backgroundColor: `${accentColor}33` }} />
      {children}
    </motion.main>
  )
}
