import { AnimatePresence, motion } from 'framer-motion'

interface PlayerBannerProps {
  show: boolean
  playerName: string
  colorHex: string
}

export function PlayerBanner({ show, playerName, colorHex }: PlayerBannerProps) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-black/80" />
          <motion.div
            initial={{ scale: 0.85, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, y: -18 }}
            className="relative rounded-3xl border border-zinc-500 bg-zinc-950 px-8 py-12 text-center shadow-[0_0_45px_rgba(0,0,0,0.85)]"
            style={{ boxShadow: `0 0 60px ${colorHex}66` }}
          >
            <p className="text-lg uppercase tracking-[0.25em] text-zinc-400">Driver Up</p>
            <h2 className="mt-2 text-5xl font-stencil uppercase tracking-[0.08em]" style={{ color: colorHex }}>
              {playerName}
            </h2>
            <p className="mt-3 text-3xl font-black uppercase tracking-[0.26em] text-zinc-200">Drive!</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
