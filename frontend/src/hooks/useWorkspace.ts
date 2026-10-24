import { useCallback, useEffect, useRef, useState } from 'react'
import { SAMPLE_FILES, SEED_ACTIVITY } from '../data/sample'
import { formatNow } from '../utils/format'
import type {
  ActivityItem,
  ActivityState,
  ReviewStatus,
  SampleFile,
  WorkspacePhase,
} from '../types'

/**
 * Holds the DEMO workspace. Nothing here touches the file system:
 * files are sample data and approvals only change in-memory state.
 */
export function useWorkspace() {
  const [phase, setPhase] = useState<WorkspacePhase>('empty')
  const [files, setFiles] = useState<SampleFile[]>([])
  const [activity, setActivity] = useState<ActivityItem[]>(SEED_ACTIVITY)
  const [notice, setNotice] = useState<string | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    }
  }, [])

  const log = useCallback((title: string, detail: string, state: ActivityState) => {
    const entry: ActivityItem = {
      id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title,
      detail,
      time: formatNow(),
      state,
      sample: true,
    }
    setActivity((prev) => [entry, ...prev])
  }, [])

  const loadSample = useCallback(() => {
    setNotice(null)
    setPhase('loading')
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setFiles(SAMPLE_FILES.map((file) => ({ ...file })))
      setPhase('ready')
      log('Sample data loaded', '12 clearly labelled sample files added to the demo table.', 'info')
    }, 900)
  }, [log])

  const previewError = useCallback(() => {
    setNotice(null)
    setPhase('loading')
    if (timer.current !== null) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setPhase('error'), 800)
  }, [])

  const reset = useCallback(() => {
    if (timer.current !== null) window.clearTimeout(timer.current)
    setFiles([])
    setNotice(null)
    setPhase('empty')
  }, [])

  const review = useCallback(
    (ids: string[], status: ReviewStatus) => {
      const changed = files.filter((f) => ids.includes(f.id) && f.status !== status).length
      if (changed === 0) return
      setFiles((prev) => prev.map((f) => (ids.includes(f.id) ? { ...f, status } : f)))
      const noun = changed === 1 ? 'suggestion' : 'suggestions'
      const verb =
        status === 'approved'
          ? 'approved'
          : status === 'rejected'
            ? 'rejected'
            : 'returned to pending'
      log(
        `${changed} sample ${noun} ${verb}`,
        'Demo only — no files were renamed or moved.',
        status === 'pending' ? 'info' : 'done',
      )
      setNotice(`${changed} ${noun} ${verb}. Demo only — no real files were changed.`)
    },
    [files, log],
  )

  const dismissNotice = useCallback(() => setNotice(null), [])

  return { phase, files, activity, notice, loadSample, previewError, reset, review, dismissNotice }
}

export type Workspace = ReturnType<typeof useWorkspace>