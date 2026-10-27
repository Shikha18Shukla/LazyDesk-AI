import type { HealthResult } from '../types'

export const BACKEND_URL = 'http://127.0.0.1:8000'
export const MODEL_NAME = 'gemma3:4b'

const HEALTH_PATH = '/api/health'

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function pickString(
  record: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return null
}

/**
 * Calls the local backend health endpoint and converts its response
 * into a UI-friendly result. This function never throws.
 */
export async function checkHealth(
  timeoutMs = 4000,
): Promise<HealthResult> {
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
    const model = record
      ? pickString(record, ['model', 'model_name', 'ollama_model'])
      : null

    const status = record
      ? pickString(record, ['status', 'state'])?.toLowerCase()
      : undefined

    const flaggedUnhealthy =
      record !== null &&
      (record.ok === false ||
        record.model_available === false ||
        record.model_loaded === false ||
        record.ollama === false ||
        record.ollama_connected === false ||
        record.ollama === 'not connected')

    const statusUnhealthy =
      status !== undefined &&
      ['error', 'unhealthy', 'down', 'degraded'].includes(status)

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
    const timedOut =
      error instanceof DOMException && error.name === 'AbortError'

    return {
      state: 'offline',
      message: timedOut
        ? `No response from ${BACKEND_URL} after ${Math.round(timeoutMs / 1000)} seconds.`
        : `Could not reach ${BACKEND_URL}. Make sure the backend is running and allows requests from this page's origin.`,
      model: null,
      checkedAt,
    }
  } finally {
    window.clearTimeout(timer)
  }
}

export interface SelectedFile {
  filename: string
  extension: string
  size_bytes: number
}

export interface SelectedFolderResult {
  cancelled: boolean
  folder: string | null
  files: SelectedFile[]
  count?: number
}

export interface MemoryAnalysisResult {
  filename: string
  summary: string
  topics: string[]
  key_points: string[]
  memory_type: string
  truncated: boolean
  processed_locally: boolean
}

async function readApiError(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json()

    if (
      typeof body === 'object' &&
      body !== null &&
      'detail' in body &&
      typeof body.detail === 'string'
    ) {
      return body.detail
    }
  } catch {
    // Fall through to the generic HTTP message.
  }

  return `Request failed with HTTP ${response.status}.`
}

export async function selectFolder(): Promise<SelectedFolderResult> {
  const response = await fetch(`${BACKEND_URL}/api/select-folder`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  return (await response.json()) as SelectedFolderResult
}

export async function analyzeMemoryFile(
  folder: string,
  filename: string,
): Promise<MemoryAnalysisResult> {
  const response = await fetch(`${BACKEND_URL}/api/memory/analyze-file`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ folder, filename }),
  })

  if (!response.ok) {
    throw new Error(await readApiError(response))
  }

  return (await response.json()) as MemoryAnalysisResult
}