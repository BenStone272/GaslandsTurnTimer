import engineLoopUrl from '../assets/muscle car sound2.mp3'
import crashSoundUrl from '../assets/car-crash.mp3'

export interface AudioController {
  playClick: () => void
  playWarning: () => void
  playCrash: () => void
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

type WebAudioContextCtor = typeof AudioContext

function getAudioContextCtor(): WebAudioContextCtor | null {
  if (typeof window === 'undefined') return null

  const maybeWindow = window as Window & {
    webkitAudioContext?: WebAudioContextCtor
  }

  return window.AudioContext ?? maybeWindow.webkitAudioContext ?? null
}

export function createAudioController(enabled: boolean, volume: number): AudioController {
  let context: AudioContext | null = null
  let masterGain: GainNode | null = null
  let engineGain: GainNode | null = null
  let engineFilter: BiquadFilterNode | null = null
  let engineSource: AudioBufferSourceNode | null = null
  let engineBuffer: AudioBuffer | null = null
  let crashBuffer: AudioBuffer | null = null
  let engineBufferPromise: Promise<AudioBuffer> | null = null
  let crashBufferPromise: Promise<AudioBuffer> | null = null
  let engineInitialized = false
  let shouldEngineRun = false
  let startupPlayed = false
  let currentEnginePlaybackRate = 0.68
  const startupDurationSec = 1

  const ensureContext = (): AudioContext | null => {
    if (!enabled) return null
    const AudioContextCtor = getAudioContextCtor()
    if (!AudioContextCtor) {
      return null
    }

    if (!context) {
      context = new AudioContextCtor()
      masterGain = context.createGain()
      masterGain.gain.value = clamp(volume, 0, 1)
      masterGain.connect(context.destination)
    }

    if (context.state === 'suspended') {
      void context.resume()
    }

    return context
  }

  const initializeEngine = () => {
    const ctx = ensureContext()
    if (!ctx || !masterGain || engineInitialized) return

    engineGain = ctx.createGain()
    engineGain.gain.value = 0

    engineFilter = ctx.createBiquadFilter()
    engineFilter.type = 'lowpass'
    engineFilter.frequency.value = 1800
    engineFilter.Q.value = 0.8

    engineFilter.connect(engineGain)
    engineGain.connect(masterGain)

    engineInitialized = true
  }

  const loadBuffer = async (url: string): Promise<AudioBuffer> => {
    const ctx = ensureContext()
    if (!ctx) {
      throw new Error('Audio context unavailable')
    }

    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()
    return ctx.decodeAudioData(arrayBuffer)
  }

  const ensureEngineBuffer = (): Promise<AudioBuffer> => {
    if (engineBuffer) return Promise.resolve(engineBuffer)
    if (engineBufferPromise) return engineBufferPromise

    engineBufferPromise = loadBuffer(engineLoopUrl).then((buffer) => {
      engineBuffer = buffer
      return buffer
    })

    return engineBufferPromise
  }

  const ensureCrashBuffer = (): Promise<AudioBuffer> => {
    if (crashBuffer) return Promise.resolve(crashBuffer)
    if (crashBufferPromise) return crashBufferPromise

    crashBufferPromise = loadBuffer(crashSoundUrl).then((buffer) => {
      crashBuffer = buffer
      return buffer
    })

    return crashBufferPromise
  }

  const stopActiveEngineSource = () => {
    if (!engineSource) return
    try {
      engineSource.stop()
    } catch {
      // Source might already be stopped.
    }
    engineSource.disconnect()
    engineSource = null
  }

  const startEngineSource = (playStartupSegment: boolean) => {
    if (!context || !engineFilter || !engineBuffer) return

    stopActiveEngineSource()

    const source = context.createBufferSource()
    source.buffer = engineBuffer
    source.loop = true
    source.loopStart = startupDurationSec
    source.loopEnd = Math.max(startupDurationSec + 0.01, engineBuffer.duration)
    source.playbackRate.value = currentEnginePlaybackRate

    source.connect(engineFilter)
    source.start(0, playStartupSegment ? 0 : startupDurationSec)

    engineSource = source
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

  const playOneShotSample = (url: string, level: number) => {
    if (!enabled) return

    const ctx = ensureContext()
    if (!ctx || !masterGain) return

    const run = async () => {
      const buffer = url === crashSoundUrl ? await ensureCrashBuffer() : await loadBuffer(url)
      if (!context || !masterGain) return

      const source = context.createBufferSource()
      const gain = context.createGain()
      gain.gain.value = clamp(level, 0, 1)

      source.buffer = buffer
      source.connect(gain)
      gain.connect(masterGain)
      source.start()
    }

    void run().catch(() => {
      // Ignore audio fetch/decode failures gracefully.
    })
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
    playCrash: () => {
      playOneShotSample(crashSoundUrl, volume * 0.9)
    },
    startEngine: () => {
      if (!enabled) return
      shouldEngineRun = true
      initializeEngine()
      if (!context || !engineGain) return

      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(clamp(volume * 0.24, 0.04, 0.35), now, 0.08)

      void ensureEngineBuffer()
        .then(() => {
          if (!shouldEngineRun) return
          startEngineSource(!startupPlayed)
          startupPlayed = true
        })
        .catch(() => {
          // Ignore audio fetch/decode failures gracefully.
        })
    },
    updateEngineRpm: (rpm: number) => {
      if (!enabled) return
      initializeEngine()
      if (!context || !engineFilter) return

      const rpmClamped = clamp(rpm, 1000, 8000)
      const normalized = (rpmClamped - 1000) / 7000
      const now = context.currentTime
      const playbackRate = 0.68 + normalized * 1.32
      currentEnginePlaybackRate = clamp(playbackRate, 0.65, 2)

      if (engineSource) {
        engineSource.playbackRate.setTargetAtTime(currentEnginePlaybackRate, now, 0.08)
      }

      engineFilter.frequency.setTargetAtTime(1200 + normalized * 2600, now, 0.12)
    },
    stopEngine: () => {
      shouldEngineRun = false
      if (!context || !engineGain) return
      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(0.0001, now, 0.08)

      window.setTimeout(() => {
        stopActiveEngineSource()
      }, 120)
    },
    stopAll: () => {
      shouldEngineRun = false
      stopActiveEngineSource()

      if (context) {
        void context.close()
      }

      context = null
      masterGain = null
      engineGain = null
      engineFilter = null
      engineSource = null
      engineBuffer = null
      crashBuffer = null
      engineBufferPromise = null
      crashBufferPromise = null
      engineInitialized = false
      startupPlayed = false
    },
  }
}
