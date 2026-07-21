import { motion } from 'framer-motion'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SettingsModal } from '../components/SettingsModal'
import type { GameSettings } from '../types/game'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../utils/storage'

export function Home() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<GameSettings>(loadSettings())
  const [showSettings, setShowSettings] = useState(false)
  const [showAbout, setShowAbout] = useState(false)

  const startGame = () => {
    if (settings.saveSettings) {
      saveSettings(settings)
    }
    navigate('/game', { state: { settings } })
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="dust-layer" />
      <div className="relative z-10 w-full max-w-2xl rounded-[2rem] border border-zinc-700 bg-zinc-950/80 p-8 text-center shadow-[0_0_50px_rgba(0,0,0,0.85)]">
        <h1 className="font-stencil text-[clamp(2.2rem,7vw,4.6rem)] uppercase leading-none tracking-[0.08em] text-zinc-100">
          Gaslands Turn Timer
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-300">
          Shared tabletop timer with a brutal dashboard vibe. One tap to end turn. One tap to pass the wheel.
        </p>

        <div className="mt-10 grid gap-3">
          <motion.button whileTap={{ scale: 0.97 }} type="button" className="home-btn accent" onClick={startGame}>
            Start Game
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} type="button" className="home-btn" onClick={() => setShowSettings(true)}>
            Settings
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} type="button" className="home-btn" onClick={() => setShowAbout((v) => !v)}>
            About
          </motion.button>
        </div>

        {showAbout ? (
          <div className="mt-6 rounded-2xl border border-zinc-700 bg-black/40 p-4 text-left text-sm text-zinc-300">
            <p>Built for shared use in the center of the table.</p>
            <p className="mt-2">Offline-ready PWA, high contrast controls, and dramatic timeout state.</p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
          <span>{settings.players.length} Drivers</span>
          <span>-</span>
          <span>G1 {settings.gearDurations[0]}s</span>
        </div>

        <button
          type="button"
          className="mt-5 text-sm uppercase tracking-[0.2em] text-zinc-500 hover:text-zinc-300"
          onClick={() => {
            setSettings(DEFAULT_SETTINGS)
            saveSettings(DEFAULT_SETTINGS)
          }}
        >
          Reset Defaults
        </button>
      </div>

      {showSettings ? (
        <SettingsModal
          initialSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(nextSettings) => {
            setSettings(nextSettings)
            if (nextSettings.saveSettings) saveSettings(nextSettings)
            setShowSettings(false)
          }}
        />
      ) : null}
    </main>
  )
}
