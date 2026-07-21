interface TemperatureGaugeProps {
  level: number
}

export function TemperatureGauge({ level }: TemperatureGaugeProps) {
  return (
    <div className="rounded-2xl border border-zinc-700 bg-zinc-950/70 p-4">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Engine Temp</p>
      <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-yellow-500 to-red-600 transition-[width] duration-300"
          style={{ width: `${Math.round(level * 100)}%` }}
        />
      </div>
    </div>
  )
}
