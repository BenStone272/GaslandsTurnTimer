import type { GameSettings } from '../types/game'

const SETTINGS_KEY = 'gaslands.settings.v1'
const DEFAULT_GEAR_DURATIONS: [number, number, number, number, number, number] = [40, 35, 30, 25, 20, 15]

export const DEFAULT_SETTINGS: GameSettings = {
  gearDurations: DEFAULT_GEAR_DURATIONS,
  players: [
    { id: crypto.randomUUID(), name: 'Red Team', color: 'red' },
    { id: crypto.randomUUID(), name: 'Blue Team', color: 'blue' },
  ],
  randomStartingPlayer: false,
  saveSettings: true,
  rememberPreviousGame: true,
  soundsEnabled: false,
  masterVolume: 0.6,
  animationIntensity: 0.85,
  dashboardTheme: 'wasteland',
  warningThresholds: {
    yellow: 20,
    red: 10,
    critical: 5,
  },
}

export function saveSettings(settings: GameSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) {
      return DEFAULT_SETTINGS
    }

    const parsed = JSON.parse(raw) as Partial<GameSettings> & { turnDuration?: number }

    const parsedGearDurations = parsed.gearDurations
    const migratedGearDurations: [number, number, number, number, number, number] =
      Array.isArray(parsedGearDurations) && parsedGearDurations.length === 6
        ? [
            Number(parsedGearDurations[0]) || DEFAULT_GEAR_DURATIONS[0],
            Number(parsedGearDurations[1]) || DEFAULT_GEAR_DURATIONS[1],
            Number(parsedGearDurations[2]) || DEFAULT_GEAR_DURATIONS[2],
            Number(parsedGearDurations[3]) || DEFAULT_GEAR_DURATIONS[3],
            Number(parsedGearDurations[4]) || DEFAULT_GEAR_DURATIONS[4],
            Number(parsedGearDurations[5]) || DEFAULT_GEAR_DURATIONS[5],
          ]
        : [
            parsed.turnDuration ?? DEFAULT_GEAR_DURATIONS[0],
            DEFAULT_GEAR_DURATIONS[1],
            DEFAULT_GEAR_DURATIONS[2],
            DEFAULT_GEAR_DURATIONS[3],
            DEFAULT_GEAR_DURATIONS[4],
            DEFAULT_GEAR_DURATIONS[5],
          ]

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      gearDurations: migratedGearDurations,
      warningThresholds: {
        ...DEFAULT_SETTINGS.warningThresholds,
        ...parsed.warningThresholds,
      },
      players:
        parsed.players && parsed.players.length >= 2
          ? parsed.players
          : DEFAULT_SETTINGS.players,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}
