import { useMemo, useState } from 'react'
import type { Player } from '../types/game'

function randomIndex(length: number): number {
  if (length <= 1) return 0
  return Math.floor(Math.random() * length)
}

export function usePlayerRotation(players: Player[], randomStart: boolean) {
  const initialIndex = useMemo(
    () => (randomStart ? randomIndex(players.length) : 0),
    [players.length, randomStart],
  )
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [round, setRound] = useState(1)

  const currentPlayer = players[currentIndex]

  const nextPlayer = () => {
    setCurrentIndex((prev) => {
      const next = (prev + 1) % players.length
      if (next === 0) {
        setRound((value) => value + 1)
      }
      return next
    })
  }

  const restartRound = () => {
    setCurrentIndex(0)
  }

  return {
    currentIndex,
    currentPlayer,
    round,
    nextPlayer,
    restartRound,
  }
}
