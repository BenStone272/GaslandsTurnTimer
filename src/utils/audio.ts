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

export function createAudioController(enabled: boolean, volume: number): AudioController {
  let context: AudioContext | null = null
  let masterGain: GainNode | null = null
  let engineGain: GainNode | null = null
  let engineFilter: BiquadFilterNode | null = null
  let engineAudio: HTMLAudioElement | null = null
  let engineSource: MediaElementAudioSourceNode | null = null
  let engineInitialized = false
  let startupPlayed = false
  const startupDurationSec = 1

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

  const initializeEngine = () => {
    const ctx = ensureContext()
    if (!ctx || !masterGain || engineInitialized) return

    engineGain = ctx.createGain()
    engineGain.gain.value = 0

    engineFilter = ctx.createBiquadFilter()
    engineFilter.type = 'lowpass'
    engineFilter.frequency.value = 1800
    engineFilter.Q.value = 0.8

    engineAudio = new Audio(engineLoopUrl)
    engineAudio.loop = false
    engineAudio.preload = 'auto'
    engineAudio.volume = 1
    engineAudio.onended = () => {
      if (!engineAudio) return
      engineAudio.currentTime = startupDurationSec
      void engineAudio.play().catch(() => {
        // Playback can fail before first user gesture on some browsers.
      })
    }

    engineSource = ctx.createMediaElementSource(engineAudio)
    engineSource.connect(engineFilter)
    engineFilter.connect(engineGain)
    engineGain.connect(masterGain)

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

  const playOneShotSample = (url: string, level: number) => {
    if (!enabled || typeof window === 'undefined') return
    const sample = new Audio(url)
    sample.preload = 'auto'
    sample.volume = clamp(level, 0, 1)
    sample.currentTime = 0
    void sample.play().catch(() => {
      // Playback can fail before first user gesture on some browsers.
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
      initializeEngine()
      if (!context || !engineGain || !engineAudio) return

      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(clamp(volume * 0.24, 0.04, 0.35), now, 0.08)

      if (!startupPlayed) {
        engineAudio.currentTime = 0
        startupPlayed = true
      } else if (engineAudio.currentTime < startupDurationSec) {
        engineAudio.currentTime = startupDurationSec
      }

      if (engineAudio.paused) {
        void engineAudio.play().catch(() => {
          // Playback can fail before first user gesture on some browsers.
        })
      }
    },
    updateEngineRpm: (rpm: number) => {
      if (!enabled) return
      initializeEngine()
      if (!context || !engineAudio || !engineFilter) return

      const rpmClamped = clamp(rpm, 1000, 8000)
      const normalized = (rpmClamped - 1000) / 7000
      const now = context.currentTime
      const playbackRate = 0.68 + normalized * 1.32

      engineAudio.playbackRate = clamp(playbackRate, 0.65, 2)
      engineFilter.frequency.setTargetAtTime(1200 + normalized * 2600, now, 0.12)

      const preservePitchElement = engineAudio as HTMLAudioElement & {
        mozPreservesPitch?: boolean
        webkitPreservesPitch?: boolean
        preservesPitch?: boolean
      }
      preservePitchElement.preservesPitch = false
      preservePitchElement.webkitPreservesPitch = false
      preservePitchElement.mozPreservesPitch = false
    },
    stopEngine: () => {
      if (!context || !engineGain) return
      const now = context.currentTime
      engineGain.gain.cancelScheduledValues(now)
      engineGain.gain.setTargetAtTime(0.0001, now, 0.08)

      if (engineAudio) {
        engineAudio.pause()
      }
    },
    stopAll: () => {
      if (engineAudio) {
        engineAudio.pause()
        engineAudio.currentTime = 0
        engineAudio.onended = null
      }

      if (context) {
        void context.close()
      }

      context = null
      masterGain = null
      engineGain = null
      engineFilter = null
      engineSource = null
      engineAudio = null
      engineInitialized = false
      startupPlayed = false
    },
  }
}
