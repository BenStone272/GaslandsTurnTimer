import { useState } from 'react'
import type { GameSettings, Player, TeamColor } from '../types/game'

const PLAYER_COLORS: TeamColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']

interface SettingsModalProps {
  initialSettings: GameSettings
  onClose: () => void
  onSave: (settings: GameSettings) => void
}

function createPlayer(index: number, color: TeamColor): Player {
  return {
    id: crypto.randomUUID(),
    name: `Player ${index + 1}`,
    color,
  }
}

export function SettingsModal({ initialSettings, onClose, onSave }: SettingsModalProps) {
  const [settings, setSettings] = useState(initialSettings)

  const setGearDuration = (gearIndex: number, value: number) => {
    const nextDurations = [...settings.gearDurations] as [number, number, number, number, number, number]
    nextDurations[gearIndex] = Math.max(5, Math.min(180, Number(value) || 5))
    setSettings({ ...settings, gearDurations: nextDurations })
  }

  const setPlayerCount = (count: number) => {
    setSettings((current) => {
      const nextPlayers = [...current.players]

      while (nextPlayers.length < count) {
        const color = PLAYER_COLORS[nextPlayers.length % PLAYER_COLORS.length]
        nextPlayers.push(createPlayer(nextPlayers.length, color))
      }

      while (nextPlayers.length > count) {
        nextPlayers.pop()
      }

      return { ...current, players: nextPlayers }
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 p-4">
      <div className="mx-auto w-full max-w-3xl rounded-3xl border border-zinc-600 bg-zinc-950 p-6 text-zinc-100 shadow-[0_0_55px_rgba(0,0,0,0.9)]">
        <div className="flex items-center justify-between">
          <h2 className="font-stencil text-4xl uppercase tracking-[0.08em]">Settings</h2>
          <button type="button" className="panel-btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="field">
            <span>Players (2-8)</span>
            <input
              type="number"
              min={2}
              max={8}
              value={settings.players.length}
              onChange={(event) => {
                const count = Math.min(8, Math.max(2, Number(event.target.value) || 2))
                setPlayerCount(count)
              }}
            />
          </label>

          <label className="field">
            <span>Master Volume</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(event) =>
                setSettings({ ...settings, masterVolume: Number(event.target.value) })
              }
            />
          </label>

          <label className="field">
            <span>Animation Intensity</span>
            <input
              type="range"
              min={0.2}
              max={1}
              step={0.05}
              value={settings.animationIntensity}
              onChange={(event) =>
                setSettings({ ...settings, animationIntensity: Number(event.target.value) })
              }
            />
          </label>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {settings.gearDurations.map((duration, index) => (
            <label key={`gear-${index + 1}`} className="field">
              <span>Gear {index + 1} Time (seconds)</span>
              <input
                type="number"
                min={5}
                max={180}
                value={duration}
                onChange={(event) => setGearDuration(index, Number(event.target.value))}
              />
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label className="check-field">
            <input
              type="checkbox"
              checked={settings.randomStartingPlayer}
              onChange={(event) =>
                setSettings({ ...settings, randomStartingPlayer: event.target.checked })
              }
            />
            Random Starting Player
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={settings.saveSettings}
              onChange={(event) => setSettings({ ...settings, saveSettings: event.target.checked })}
            />
            Save Settings Automatically
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={settings.rememberPreviousGame}
              onChange={(event) =>
                setSettings({ ...settings, rememberPreviousGame: event.target.checked })
              }
            />
            Remember Previous Game
          </label>
          <label className="check-field">
            <input
              type="checkbox"
              checked={settings.soundsEnabled}
              onChange={(event) => setSettings({ ...settings, soundsEnabled: event.target.checked })}
            />
            Enable Sounds
          </label>
        </div>

        <div className="mt-6 grid gap-2">
          <p className="text-sm uppercase tracking-[0.25em] text-zinc-400">Players</p>
          {settings.players.map((player, index) => (
            <div key={player.id} className="grid gap-2 rounded-xl border border-zinc-700 p-3 sm:grid-cols-[1fr_120px]">
              <input
                className="input"
                value={player.name}
                onChange={(event) => {
                  const updated = [...settings.players]
                  updated[index] = { ...player, name: event.target.value }
                  setSettings({ ...settings, players: updated })
                }}
                aria-label={`Player ${index + 1} name`}
              />
              <select
                className="input"
                value={player.color}
                onChange={(event) => {
                  const updated = [...settings.players]
                  updated[index] = { ...player, color: event.target.value as TeamColor }
                  setSettings({ ...settings, players: updated })
                }}
                aria-label={`Player ${index + 1} color`}
              >
                {PLAYER_COLORS.map((color) => (
                  <option key={color} value={color}>
                    {color.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="panel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="panel-btn accent"
            onClick={() => {
              onSave(settings)
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
