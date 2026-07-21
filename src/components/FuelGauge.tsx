interface FuelGaugeProps {
  level: number
}

export function FuelGauge({ level }: FuelGaugeProps) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Fuel</p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-red-700 via-orange-500 to-yellow-400 transition-[width] duration-300"
          style={{ width: `${Math.round(level * 100)}%` }}
        />
      </div>
    </div>
  )
}
