export type PageId = 'overview' | 'organizer' | 'activity' | 'settings'

export type FileKind =
  | 'pdf'
  | 'image'
  | 'document'
  | 'spreadsheet'
  | 'archive'
  | 'audio'
  | 'video'
  | 'code'

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface SampleFile {
  id: string
  name: string
  kind: FileKind
  sizeBytes: number
  category: string
  proposedName: string
  status: ReviewStatus
}

export type ActivityState = 'done' | 'pending' | 'info'

export interface ActivityItem {
  id: string
  title: string
  detail: string
  time: string
  state: ActivityState
  /** true when the entry describes sample/demo data rather than real files */
  sample: boolean
}

export type HealthState = 'checking' | 'connected' | 'degraded' | 'offline'

export interface HealthResult {
  state: HealthState
  message: string
  model: string | null
  checkedAt: Date | null
}

export type WorkspacePhase = 'empty' | 'loading' | 'ready' | 'error'