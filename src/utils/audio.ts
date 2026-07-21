export interface AudioController {
  playClick: () => void
  playWarning: () => void
  startEngine: () => void
  updateEngineRpm: (rpm: number) => void
  stopEngine: () => void
  stopAll: () => void
}

const CLICK_FREQUENCY = 280
const WARNING_FREQUENCY = 880

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function createAudioController(enabled: boolean, volume: number): AudioController {
  let context: AudioContext | null = null
  let masterGain: GainNode | null = null
  let engineGain: GainNode | null = null
  let lowOscillator: OscillatorNode | null = null
  let highOscillator: OscillatorNode | null = null
  let noiseSource: AudioBufferSourceNode | null = null
  let noiseFilter: BiquadFilterNode | null = null
  let engineInitialized = false

  const ensureContext = (): AudioContext | null => {
    if (!enabled) return null
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return null
    }

    if (!context) {
      context = new AudioContext()
      masterGain = context.createGain()
      masterGain.gain.value = clamp(volume, 0, 1)
      masterGain.connect(context.destination)
    }

    if (context.state === 'suspended') {
      void context.resume()
    }

    return context
  }

  const createNoiseBuffer = (ctx: AudioContext): AudioBuffer => {
    const length = Math.floor(ctx.sampleRate * 2)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const output = buffer.getChannelData(0)

    for (let i = 0; i < length; i += 1) {
      output[i] = (Math.random() * 2 - 1) * 0.6
    }

    return buffer
  }

  const initializeEngine = () => {
    const ctx = ensureContext()
    if (!ctx || !masterGain || engineInitialized) return

    engineGain = ctx.createGain()
    engineGain.gain.value = 0

    lowOscillator = ctx.createOscillator()
    lowOscillator.type = 'sawtooth'
    lowOscillator.frequency.value = 34

    highOscillator = ctx.createOscillator()
    highOscillator.type = 'square'
    highOscillator.frequency.value = 72

    noiseSource = ctx.createBufferSource()
    noiseSource.buffer = createNoiseBuffer(ctx)
    noiseSource.loop = true

    noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.value = 220
    noiseFilter.Q.value = 0.8

    lowOscillator.connect(engineGain)
    highOscillator.connect(engineGain)
    noiseSource.connect(noiseFilter)
    noiseFilter.connect(engineGain)
    engineGain.connect(masterGain)

    lowOscillator.start()
    highOscillator.start()
    noiseSource.start()
    engineInitialized = true
  }

  const shortTone = (frequency: number, durationMs: number, gainAmount: number) => {
    const ctx = ensureContext()
    if (!ctx || !masterGain) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const now = ctx.currentTime

    osc.type = 'square'
    osc.frequency.value = frequency

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(gainAmount, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000)

    osc.connect(gain)
    gain.connect(masterGain)

    osc.start(now)
    osc.stop(now + durationMs / 1000 + 0.02)
  }

  return {
    playClick: () => {
      if (!enabled) return
      shortTone(CLICK_FREQUENCY, 60, clamp(volume * 0.25, 0.02, 0.2))
    },
    playWarning: () => {
      if (!enabled) return
      shortTone(WARNING_FREQUENCY, 120, clamp(volume * 0.35, 0.03, 0.25))
    },
    startEngine: () => {
      if (!enabled) return
      initializeEngine()
      if (!context || !engineGain) return

      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(clamp(volume * 0.24, 0.04, 0.35), now, 0.08)
    },
    updateEngineRpm: (rpm: number) => {
      if (!enabled) return
      initializeEngine()
      if (!context || !lowOscillator || !highOscillator || !noiseFilter) return

      const rpmClamped = clamp(rpm, 1000, 8000)
      const normalized = (rpmClamped - 1000) / 7000
      const baseHz = 28 + normalized * 58
      const now = context.currentTime

      lowOscillator.frequency.setTargetAtTime(baseHz, now, 0.06)
      highOscillator.frequency.setTargetAtTime(baseHz * 2.1, now, 0.06)
      noiseFilter.frequency.setTargetAtTime(180 + normalized * 980, now, 0.1)
    },
    stopEngine: () => {
      if (!context || !engineGain) return
      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(0.0001, now, 0.08)
    },
    stopAll: () => {
      if (context) {
        void context.close()
      }

      context = null
      masterGain = null
      engineGain = null
      lowOscillator = null
      highOscillator = null
      noiseSource = null
      noiseFilter = null
      engineInitialized = false
    },
  }
}
