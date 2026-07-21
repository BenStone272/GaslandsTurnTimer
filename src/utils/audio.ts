export interface AudioController {
  playClick: () => void
  playWarning: () => void
  stopAll: () => void
}

const CLICK_FREQUENCY = 280
const WARNING_FREQUENCY = 880

function beep(frequency: number, durationMs: number, volume: number): void {
  const context = new AudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.frequency.value = frequency
  oscillator.type = 'square'

  gain.gain.value = volume

  oscillator.connect(gain)
  gain.connect(context.destination)

  oscillator.start()
  oscillator.stop(context.currentTime + durationMs / 1000)

  setTimeout(() => {
    context.close()
  }, durationMs + 50)
}

export function createAudioController(enabled: boolean, volume: number): AudioController {
  return {
    playClick: () => {
      if (!enabled) return
      beep(CLICK_FREQUENCY, 60, volume * 0.25)
    },
    playWarning: () => {
      if (!enabled) return
      beep(WARNING_FREQUENCY, 120, volume * 0.35)
    },
    stopAll: () => {
      // Oscillators are short-lived and cleaned after playback.
    },
  }
}
