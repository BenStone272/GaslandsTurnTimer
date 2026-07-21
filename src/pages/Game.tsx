import { useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { FiPause } from 'react-icons/fi'
import { useLocation, useNavigate } from 'react-router-dom'
import { Dashboard } from '../components/Dashboard'
import { EndTurnButton } from '../components/EndTurnButton'
import { FuelGauge } from '../components/FuelGauge'
import { PauseOverlay } from '../components/PauseOverlay'
import { PlayerBanner } from '../components/PlayerBanner'
import { SettingsModal } from '../components/SettingsModal'
import { Tachometer } from '../components/Tachometer'
import { TemperatureGauge } from '../components/TemperatureGauge'
import { TimerDisplay } from '../components/TimerDisplay'
import { WarningLights } from '../components/WarningLights'
import { useGameTimer } from '../hooks/useGameTimer'
import { usePlayerRotation } from '../hooks/usePlayerRotation'
import type { GameSettings, GameStats, TeamColor, TurnRecord } from '../types/game'
import { createAudioController } from '../utils/audio'
import { loadSettings, saveSettings } from '../utils/storage'
import { progressFromRemaining, rpmFromProgress } from '../utils/timer'

const PLAYER_COLORS: Record<TeamColor, string> = {
  red: '#ef4444',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#facc15',
  purple: '#a855f7',
  orange: '#f97316',
}

interface GameLocationState {
  settings?: GameSettings
}

function getStats(turns: TurnRecord[]): GameStats {
  if (turns.length === 0) {
    return {
      turnsTaken: 0,
      averageTurnMs: 0,
      longestTurnMs: 0,
      shortestTurnMs: 0,
    }
  }

  const durations = turns.map((turn) => turn.durationMs)
  const total = durations.reduce((acc, value) => acc + value, 0)

  return {
    turnsTaken: turns.length,
    averageTurnMs: total / turns.length,
    longestTurnMs: Math.max(...durations),
    shortestTurnMs: Math.min(...durations),
  }
}

export function Game() {
  const navigate = useNavigate()
  const location = useLocation()
  const passedState = location.state as GameLocationState | null

  const [settings, setSettings] = useState<GameSettings>(
    passedState?.settings ?? loadSettings(),
  )
  const [showPause, setShowPause] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showBanner, setShowBanner] = useState(true)
  const [turns, setTurns] = useState<TurnRecord[]>([])
  const [gameEnded, setGameEnded] = useState(false)
  const [gearPhase, setGearPhase] = useState(1)

  const durationMs = settings.gearDurations[gearPhase - 1] * 1000
  const rotation = usePlayerRotation(settings.players, settings.randomStartingPlayer)

  const timer = useGameTimer({
    durationMs,
    onExpire: () => {
      audio.playWarning()
    },
  })

  const audio = useMemo(
    () => createAudioController(settings.soundsEnabled, settings.masterVolume),
    [settings.soundsEnabled, settings.masterVolume],
  )

  useEffect(() => {
    timer.start(true)
    const timeout = window.setTimeout(() => setShowBanner(false), 1000)
    return () => {
      window.clearTimeout(timeout)
      audio.stopAll()
    }
    // Intentional mount-only start.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = progressFromRemaining(timer.remainingMs, durationMs)
  const rpm = timer.isExpired ? 8000 : rpmFromProgress(progress)

  const remainingSeconds = Math.ceil(timer.remainingMs / 1000)
  const yellowOn = remainingSeconds <= settings.warningThresholds.yellow
  const redOn = remainingSeconds <= settings.warningThresholds.red
  const criticalOn = remainingSeconds <= settings.warningThresholds.critical

  const fuelLevel = 1 - progress
  const temperatureLevel = progress

  const currentPlayer = rotation.currentPlayer
  const accentColor = currentPlayer ? PLAYER_COLORS[currentPlayer.color] : '#f97316'

  const endCurrentTurn = () => {
    const elapsedMs = durationMs - timer.remainingMs
    const durationUsed = Math.min(durationMs, Math.max(0, elapsedMs))

    setTurns((currentTurns) => [
      ...currentTurns,
      {
        playerId: currentPlayer.id,
        durationMs: durationUsed,
      },
    ])

    rotation.nextPlayer()
    timer.reset()
    timer.start(true)
    setShowBanner(true)
    window.setTimeout(() => setShowBanner(false), 900)
    audio.playClick()
  }

  const advanceGearPhase = () => {
    setGearPhase((currentPhase) => (currentPhase % 6) + 1)
    timer.reset()
    timer.start(true)
    audio.playClick()
  }

  const handleSurfaceTap = (event: MouseEvent<HTMLDivElement>) => {
    const targetElement = event.target as HTMLElement
    if (targetElement.closest('button,input,select,textarea,label,a,[data-no-end-turn]')) {
      return
    }
    if (showPause || showSettings || showBanner || gameEnded) {
      return
    }
    endCurrentTurn()
  }

  useEffect(() => {
    if (settings.saveSettings) {
      saveSettings(settings)
    }
  }, [settings])

  if (gameEnded) {
    const stats = getStats(turns)
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-5 text-center">
        <h1 className="font-stencil text-5xl uppercase tracking-[0.08em] text-zinc-100">Run Complete</h1>
        <div className="mt-7 w-full rounded-2xl border border-zinc-700 bg-zinc-900/70 p-5 text-zinc-200">
          <p>Total rounds: {rotation.round}</p>
          <p>Turns taken: {stats.turnsTaken}</p>
          <p>Average turn: {(stats.averageTurnMs / 1000).toFixed(1)}s</p>
          <p>Longest turn: {(stats.longestTurnMs / 1000).toFixed(1)}s</p>
          <p>Shortest turn: {(stats.shortestTurnMs / 1000).toFixed(1)}s</p>
        </div>
        <button type="button" className="home-btn accent mt-7" onClick={() => navigate('/')}>
          Back Home
        </button>
      </main>
    )
  }

  return (
    <Dashboard accentColor={accentColor} shaking={criticalOn || timer.isExpired}>
      <PlayerBanner show={showBanner} playerName={currentPlayer.name} colorHex={accentColor} />

      <div className="relative z-10" onClick={handleSurfaceTap}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-zinc-400">Round {rotation.round}</p>
            <p className="text-sm uppercase tracking-[0.22em] text-zinc-400">
              Player {rotation.currentIndex + 1} / {settings.players.length}
            </p>
            <p className="text-sm uppercase tracking-[0.22em] text-amber-400">
              Gear {gearPhase} - {settings.gearDurations[gearPhase - 1]}s
            </p>
          </div>
          <button
            type="button"
            className="min-h-12 min-w-12 rounded-full border border-zinc-700 bg-zinc-900/70 text-zinc-200"
            onClick={() => {
              timer.pause()
              setShowPause(true)
            }}
            aria-label="Pause"
          >
            <FiPause className="mx-auto" />
          </button>
        </div>

        <div className="mt-5 rounded-3xl border border-zinc-700 bg-black/30 p-5 text-center">
          <p className="text-base uppercase tracking-[0.27em] text-zinc-400">Current Driver</p>
          <h2 className="mt-1 font-stencil text-[clamp(2rem,6vw,4rem)] uppercase tracking-[0.08em]" style={{ color: accentColor }}>
            {currentPlayer.name}
          </h2>

          <TimerDisplay remainingMs={timer.remainingMs} pulse={criticalOn} />

          {timer.isExpired ? (
            <div className="mx-auto mb-3 max-w-lg rounded-2xl border border-red-500/80 bg-red-900/35 px-4 py-3 text-center shadow-[0_0_25px_rgba(255,0,0,0.4)]">
              <p className="font-stencil text-4xl uppercase tracking-[0.08em] text-red-300">Time&apos;s Up</p>
              <p className="mt-1 text-lg font-bold uppercase tracking-[0.2em] text-zinc-100">Pass The Wheel</p>
            </div>
          ) : null}

          <WarningLights yellowOn={yellowOn} redOn={redOn} criticalOn={criticalOn || timer.isExpired} />
        </div>

        <div className="mt-6 flex justify-center">
          <Tachometer rpm={rpm} critical={criticalOn || timer.isExpired} intensity={settings.animationIntensity} />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <FuelGauge level={fuelLevel} />
          <TemperatureGauge level={temperatureLevel} />
        </div>

        <div className="mt-6">
          <EndTurnButton
            label={`Next Gear (${gearPhase} -> ${(gearPhase % 6) + 1})`}
            tone="normal"
            onClick={advanceGearPhase}
          />
        </div>
      </div>

      {showPause ? (
        <PauseOverlay
          onResume={() => {
            setShowPause(false)
            timer.start(false)
          }}
          onRestartRound={() => {
            rotation.restartRound()
            timer.reset()
            timer.start(true)
            setShowPause(false)
          }}
          onSettings={() => {
            setShowSettings(true)
          }}
          onEndGame={() => {
            setShowPause(false)
            setGameEnded(true)
          }}
        />
      ) : null}

      {showSettings ? (
        <SettingsModal
          initialSettings={settings}
          onClose={() => setShowSettings(false)}
          onSave={(next) => {
            setSettings(next)
            setShowSettings(false)
          }}
        />
      ) : null}
    </Dashboard>
  )
}
