# Gaslands Turn Timer

Single-page PWA turn timer for Gaslands with a wasteland dashboard aesthetic.

## Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- Framer Motion
- React Icons
- vite-plugin-pwa
- Local Storage

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

## Features Implemented

- Home screen with Start / Settings / About
- Configurable players (2-8), names, colors, turn duration, options
- Main dashboard gameplay screen with:
  - Large digital countdown
  - Current driver display and player tinting
  - Animated tachometer with increasing RPM and critical jitter
  - Fuel and temperature cosmetic gauges
  - Warning lights at configurable thresholds
  - Timeout lock state with `TIME'S UP / PASS THE WHEEL`
  - One-tap handoff button (`END TURN` -> `PASS THE WHEEL`)
  - New-turn fullscreen banner animation
  - Round and player position tracking
  - Pause overlay (`Resume`, `Restart Round`, `Settings`, `End Game`)
  - End game stats summary
- Offline support via generated service worker and web manifest
- Settings persisted to local storage

## Accessibility Notes

- Tap targets are >= 48px
- High contrast text and controls
- Warning indicators include icon + label (not color alone)

## Optional Next Enhancements

- Additional dashboard skins with full visual swap
- Keep Screen Awake API integration
- Haptic vibration patterns on mobile
- Richer sound engine loop/rev-limiter layering
