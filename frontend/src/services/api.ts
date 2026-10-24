import type { HealthResult } from '../types'

export const BACKEND_URL = 'http://127.0.0.1:8000'
export const MODEL_NAME = 'gemma3:4b'
const HEALTH_PATH = '/api/health'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function pickString(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return null
}

/**
 * Calls GET /api/health on the local backend and converts the outcome into a
 * UI-friendly result. This function never throws.
 */
export async function checkHealth(timeoutMs = 4000): Promise<HealthResult> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  const checkedAt = new Date()

  try {
    const response = await fetch(`${BACKEND_URL}${HEALTH_PATH}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      return {
        state: 'degraded',
        message: `The backend answered with HTTP ${response.status}.`,
        model: null,
        checkedAt,
      }
    }

    let body: unknown = null
    try {
      body = await response.json()
    } catch {
      body = null
    }

    const record = asRecord(body)
    const model = record ? pickString(record, ['model', 'model_name', 'ollama_model']) : null
    const status = record ? pickString(record, ['status', 'state'])?.toLowerCase() : undefined

    const flaggedUnhealthy =
      record !== null &&
      (record.ok === false ||
        record.model_available === false ||
        record.model_loaded === false ||
        record.ollama === false ||
        record.ollama_connected === false)

    const statusUnhealthy =
      status !== undefined && ['error', 'unhealthy', 'down', 'degraded'].includes(status)

    if (flaggedUnhealthy || statusUnhealthy) {
      return {
        state: 'degraded',
        message: 'The backend is running, but the local model is not ready.',
        model,
        checkedAt,
      }
    }

    return {
      state: 'connected',
      message: 'Backend and local model are reachable.',
      model,
      checkedAt,
    }
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === 'AbortError'
    return {
      state: 'offline',
      message: timedOut
        ? `No response from ${BACKEND_URL} after ${Math.round(timeoutMs / 1000)} seconds.`
        : `Could not reach ${BACKEND_URL}. Make sure the backend is running (and allows requests from this page's origin).`,
      model: null,
      checkedAt,
    }
  } finally {
    window.clearTimeout(timer)
  }
}