import { useCallback, useEffect, useState } from 'react'
import { checkHealth } from '../services/api'
import type { HealthResult } from '../types'

const INITIAL: HealthResult = {
  state: 'checking',
  message: 'Checking connection…',
  model: null,
  checkedAt: null,
}

export function useHealth() {
  const [health, setHealth] = useState<HealthResult>(INITIAL)

  const refresh = useCallback(async (silent = false) => {
    if (!silent) {
      setHealth((prev) => ({ ...prev, state: 'checking', message: 'Checking connection…' }))
    }
    setHealth(await checkHealth())
  }, [])

  useEffect(() => {
    void refresh()
    const id = window.setInterval(() => {
      void refresh(true)
    }, 30_000)
    return () => window.clearInterval(id)
  }, [refresh])

  return { health, refresh }
}