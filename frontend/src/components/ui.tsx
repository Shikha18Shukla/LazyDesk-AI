import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, Clock, FlaskConical, Info, Loader2 } from 'lucide-react'
import { FILE_KIND_META } from '../utils/fileKinds'
import type { ActivityItem, FileKind, HealthState } from '../types'

const HEALTH_LABEL: Record<HealthState, string> = {
  checking: 'Checking…',
  connected: 'Connected',
  degraded: 'Needs attention',
  offline: 'Offline',
}

export function HealthPill({ state }: { state: HealthState }) {
  return (
    <span className={`pill pill--${state}`}>
      {state === 'checking' ? (
        <Loader2 size={12} className="spin" aria-hidden />
      ) : (
        <span className="pill__dot" aria-hidden />
      )}
      {HEALTH_LABEL[state]}
    </span>
  )
}

export function SampleTag({ children = 'Sample data' }: { children?: ReactNode }) {
  return (
    <span className="sample-tag">
      <FlaskConical size={11} aria-hidden />
      {children}
    </span>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle: string
  actions?: ReactNode
}) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {actions ? <div className="page-header__actions">{actions}</div> : null}
    </header>
  )
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tag,
}: {
  label: string
  value: string
  hint: string
  icon: LucideIcon
  tag?: ReactNode
}) {
  return (
    <div className="card stat-card">
      <div className="stat-card__top">
        <span className="icon-chip">
          <Icon size={16} aria-hidden />
        </span>
        {tag}
      </div>
      <div className="stat-card__value">{value}</div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__hint">{hint}</div>
    </div>
  )
}

export function FileTypeIcon({ kind, size = 18 }: { kind: FileKind; size?: number }) {
  const meta = FILE_KIND_META[kind]
  const Icon = meta.icon
  return (
    <span className={`file-icon file-icon--${meta.tone}`} title={meta.label}>
      <Icon size={size} aria-hidden />
    </span>
  )
}

const ACTIVITY_ICON = {
  done: CheckCircle2,
  pending: Clock,
  info: Info,
} as const

export function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = ACTIVITY_ICON[item.state]
  return (
    <li className={`timeline__item timeline__item--${item.state}`}>
      <span className="timeline__marker">
        <Icon size={14} aria-hidden />
      </span>
      <div className="timeline__body">
        <div className="timeline__title">
          {item.title}
          {item.sample ? <SampleTag>Sample</SampleTag> : null}
        </div>
        <p>{item.detail}</p>
      </div>
      <time className="timeline__time">{item.time}</time>
    </li>
  )
}