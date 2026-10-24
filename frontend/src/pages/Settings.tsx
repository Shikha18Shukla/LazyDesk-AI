import type { ReactNode } from 'react'
import { Cpu, RefreshCw, Server, ShieldCheck } from 'lucide-react'
import { HealthPill, PageHeader } from '../components/ui'
import { BACKEND_URL, MODEL_NAME } from '../services/api'
import type { HealthResult } from '../types'
import { formatClock } from '../utils/format'

function Row({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-row__label">{label}</div>
        {hint ? <p>{hint}</p> : null}
      </div>
      <div className="setting-row__value">{children}</div>
    </div>
  )
}

export default function Settings({
  health,
  onRecheck,
}: {
  health: HealthResult
  onRecheck: () => void
}) {
  return (
    <div className="page">
      <PageHeader
        title="Settings"
        subtitle="Connection details for the local AI backend. Values are read-only in this prototype."
      />

      <section className="card">
        <div className="card__head">
          <h2>
            <Cpu size={16} aria-hidden /> Local model
          </h2>
        </div>
        <Row label="Model name" hint="Runs locally through your own backend.">
          <code className="field">{MODEL_NAME}</code>
        </Row>
        <Row label="Reported by backend" hint="Shown when /api/health includes a model name.">
          <code className="field">{health.model ?? '—'}</code>
        </Row>
      </section>

      <section className="card">
        <div className="card__head">
          <h2>
            <Server size={16} aria-hidden /> Backend connection
          </h2>
          <button
            type="button"
            className="btn btn--sm"
            onClick={onRecheck}
            disabled={health.state === 'checking'}
          >
            <RefreshCw size={13} className={health.state === 'checking' ? 'spin' : ''} aria-hidden />
            Re-check
          </button>
        </div>
        <Row label="Backend address" hint="Health endpoint: GET /api/health">
          <code className="field">{BACKEND_URL}</code>
        </Row>
        <Row label="AI connection status" hint={health.message}>
          <HealthPill state={health.state} />
        </Row>
        <Row label="Last checked">
          <span className="muted">{health.checkedAt ? formatClock(health.checkedAt) : '—'}</span>
        </Row>
      </section>

      <section className="card privacy">
        <span className="icon-chip icon-chip--lg">
          <ShieldCheck size={20} aria-hidden />
        </span>
        <div>
          <h2>Privacy</h2>
          <p>
            Local inference is intended to keep your file metadata — names, types and sizes — on your
            own machine. This interface talks only to the backend address above and does not call any
            external AI service.
          </p>
          <p>
            In this prototype no real folders are scanned, and nothing is renamed or moved. All files
            in the organizer are sample data.
          </p>
        </div>
      </section>
    </div>
  )
}