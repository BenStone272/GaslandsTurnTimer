interface PauseOverlayProps {
  onResume: () => void
  onRestartRound: () => void
  onSettings: () => void
  onEndGame: () => void
}

export function PauseOverlay({
  onResume,
  onRestartRound,
  onSettings,
  onEndGame,
}: PauseOverlayProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-zinc-600 bg-zinc-950 p-7 shadow-[0_0_50px_rgba(0,0,0,0.85)]">
        <h2 className="text-center font-stencil text-5xl uppercase tracking-[0.1em] text-zinc-100">Engine Off</h2>
        <div className="mt-8 grid gap-3">
          <button type="button" className="panel-btn" onClick={onResume}>
            Resume
          </button>
          <button type="button" className="panel-btn" onClick={onRestartRound}>
            Restart Round
          </button>
          <button type="button" className="panel-btn" onClick={onSettings}>
            Settings
          </button>
          <button type="button" className="panel-btn critical" onClick={onEndGame}>
            End Game
          </button>
        </div>
      </div>
    </div>
  )
}
