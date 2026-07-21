export type TeamColor =
	| 'red'
	| 'blue'
	| 'green'
	| 'yellow'
	| 'purple'
	| 'orange'

export interface Player {
	id: string
	name: string
	color: TeamColor
}

export interface WarningThresholds {
	yellow: number
	red: number
	critical: number
}

export type DashboardTheme = 'wasteland' | 'diesel' | 'scrap'

export interface GameSettings {
	gearDurations: [number, number, number, number, number, number]
	players: Player[]
	randomStartingPlayer: boolean
	saveSettings: boolean
	rememberPreviousGame: boolean
	soundsEnabled: boolean
	masterVolume: number
	animationIntensity: number
	dashboardTheme: DashboardTheme
	warningThresholds: WarningThresholds
}

export interface TurnRecord {
	playerId: string
	durationMs: number
}

export interface GameStats {
	turnsTaken: number
	averageTurnMs: number
	longestTurnMs: number
	shortestTurnMs: number
}
