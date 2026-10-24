import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  Cpu,
  FileSearch,
  FolderCheck,
  Hourglass,
  Lock,
  RefreshCw,
} from 'lucide-react'
import { ActivityRow, HealthPill, SampleTag, StatCard } from '../components/ui'
import { BACKEND_URL, MODEL_NAME } from '../services/api'
import type { Workspace } from '../hooks/useWorkspace'
import type { HealthResult, PageId } from '../types'
import { formatClock } from '../utils/format'

interface OverviewProps {
  health: HealthResult
  onRecheck: () => void
  workspace: Workspace
  onNavigate: (page: PageId) => void
}

export default function Overview({ health, onRecheck, workspace, onNavigate }: OverviewProps) {
  const { files, phase, activity } = workspace
  const ready = phase === 'ready'
  const reviewed = files.filter((f) => f.status !== 'pending').length
  const pending = files.filter((f) => f.status === 'pending').length
  const connected = health.state === 'connected'

  const steps = [
    {
      title: 'Start the local backend',
      body: `Run the Python server so it listens on ${BACKEND_URL}.`,
      state: connected ? 'done' : 'todo',
    },
    {
      title: `Confirm ${MODEL_NAME} is ready`,
      body: 'The status card above reports the real result of /api/health.',
      state: connected ? 'done' : 'todo',
    },
    {
      title: 'Choose a folder to scan',
      body: 'Unavailable until the backend supports folder scanning.',
      state: 'locked',
    },
    {
      title: 'Review suggestions',
      body: 'Try the interface with clearly labelled sample data.',
      state: ready ? 'done' : 'todo',
    },
  ] as const

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h1 className="hero__title">A calmer, cleaner workspace.</h1>
          <p className="hero__text">
            LazyDesk AI proposes tidy names and folders for your files, using a model that runs
            on your own machine. You stay in control of every change.
          </p>
        </div>
        <button type="button" className="btn btn--primary btn--lg" onClick={() => onNavigate('organizer')}>
          Organize files
          <ArrowRight size={16} aria-hidden />
        </button>
      </section>

      <section className="grid grid--3" aria-label="Statistics">
        <StatCard
          icon={FileSearch}
          label="Files Reviewed"
          value={ready ? String(reviewed) : '—'}
          hint={ready ? 'Approved or rejected in the demo' : 'Load sample data to try it'}
          tag={<SampleTag />}
        />
        <StatCard
          icon={Hourglass}
          label="Pending Suggestions"
          value={ready ? String(pending) : '—'}
          hint={ready ? 'Waiting for your decision' : 'No suggestions yet'}
          tag={<SampleTag />}
        />
        <StatCard
          icon={FolderCheck}
          label="Files Organized"
          value="0"
          hint="Renaming and moving are unavailable until the backend supports them"
          tag={<span className="sample-tag sample-tag--muted">Unavailable</span>}
        />
      </section>

      <section className="card ai-card">
        <div className="ai-card__main">
          <span className="icon-chip icon-chip--lg">
            <Cpu size={20} aria-hidden />
          </span>
          <div>
            <div className="ai-card__title">
              Gemma 3 · local model
              <HealthPill state={health.state} />
            </div>
            <p className="ai-card__text">{health.message}</p>
            <dl className="meta-list">
              <div>
                <dt>Model</dt>
                <dd>{health.model ?? MODEL_NAME}</dd>
              </div>
              <div>
                <dt>Backend</dt>
                <dd>{BACKEND_URL}</dd>
              </div>
              <div>
                <dt>Last checked</dt>
                <dd>{health.checkedAt ? formatClock(health.checkedAt) : '—'}</dd>
              </div>
            </dl>
          </div>
        </div>
        <button
          type="button"
          className="btn"
          onClick={onRecheck}
          disabled={health.state === 'checking'}
        >
          <RefreshCw size={15} className={health.state === 'checking' ? 'spin' : ''} aria-hidden />
          Re-check
        </button>
      </section>

      <div className="grid grid--2">
        <section className="card">
          <div className="card__head">
            <h2>Recent activity</h2>
            <button type="button" className="link-btn" onClick={() => onNavigate('activity')}>
              View all
            </button>
          </div>
          <ul className="timeline timeline--compact">
            {activity.slice(0, 4).map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
          </ul>
        </section>

        <section className="card">
          <div className="card__head">
            <h2>Getting started</h2>
          </div>
          <ol className="steps">
            {steps.map((step) => (
              <li key={step.title} className={`steps__item steps__item--${step.state}`}>
                <span className="steps__icon">
                  {step.state === 'done' ? (
                    <CheckCircle2 size={18} aria-hidden />
                  ) : step.state === 'locked' ? (
                    <Lock size={16} aria-hidden />
                  ) : (
                    <CircleDashed size={18} aria-hidden />
                  )}
                </span>
                <div>
                  <div className="steps__title">{step.title}</div>
                  <p>{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}