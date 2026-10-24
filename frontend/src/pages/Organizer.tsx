import { useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  FolderOpen,
  Inbox,
  Lock,
  RotateCcw,
  Search,
  SearchX,
  Sparkles,
  Undo2,
  X,
} from 'lucide-react'
import { FileTypeIcon, HealthPill, PageHeader, SampleTag } from '../components/ui'
import type { Workspace } from '../hooks/useWorkspace'
import type { FileKind, HealthResult, ReviewStatus, SampleFile } from '../types'
import { FILE_KIND_META } from '../utils/fileKinds'
import { formatBytes } from '../utils/format'

const FILTERS: { id: string; label: string; kinds: FileKind[] | null }[] = [
  { id: 'all', label: 'All', kinds: null },
  { id: 'documents', label: 'Documents', kinds: ['pdf', 'document'] },
  { id: 'images', label: 'Images', kinds: ['image'] },
  { id: 'sheets', label: 'Spreadsheets', kinds: ['spreadsheet'] },
  { id: 'media', label: 'Media', kinds: ['audio', 'video'] },
  { id: 'archives', label: 'Archives', kinds: ['archive'] },
  { id: 'code', label: 'Code', kinds: ['code'] },
]

const STATUS_LABEL: Record<ReviewStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
}

interface OrganizerProps {
  workspace: Workspace
  health: HealthResult
}

export default function Organizer({ workspace, health }: OrganizerProps) {
  const { phase, files, notice, loadSample, previewError, reset, review, dismissNotice } = workspace

  const [query, setQuery] = useState('')
  const [filterId, setFilterId] = useState('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const allRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    const kinds = FILTERS.find((f) => f.id === filterId)?.kinds ?? null
    const q = query.trim().toLowerCase()
    return files.filter((file) => {
      if (kinds && !kinds.includes(file.kind)) return false
      if (!q) return true
      return (
        file.name.toLowerCase().includes(q) ||
        file.proposedName.toLowerCase().includes(q) ||
        file.category.toLowerCase().includes(q)
      )
    })
  }, [files, filterId, query])

  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const f of FILTERS) {
      result[f.id] = f.kinds ? files.filter((file) => f.kinds?.includes(file.kind)).length : files.length
    }
    return result
  }, [files])

  const selectedIds = files.filter((f) => selected.has(f.id)).map((f) => f.id)
  const visibleSelected = filtered.filter((f) => selected.has(f.id)).length
  const allVisibleSelected = filtered.length > 0 && visibleSelected === filtered.length
  const someVisibleSelected = visibleSelected > 0 && !allVisibleSelected
  const pendingCount = files.filter((f) => f.status === 'pending').length
  const focused: SampleFile | null = files.find((f) => f.id === focusedId) ?? null

  useEffect(() => {
    if (allRef.current) allRef.current.indeterminate = someVisibleSelected
  }, [someVisibleSelected])

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) filtered.forEach((f) => next.delete(f.id))
      else filtered.forEach((f) => next.add(f.id))
      return next
    })
  }

  function bulk(status: ReviewStatus) {
    review(selectedIds, status)
    setSelected(new Set())
  }

  function resetDemo() {
    setSelected(new Set())
    setFocusedId(null)
    setQuery('')
    setFilterId('all')
    reset()
  }

  const ready = phase === 'ready'

  return (
    <div className="page">
      <PageHeader
        title="File Organizer"
        subtitle="Review AI-suggested names and folders before anything changes."
        actions={ready ? <SampleTag>Showing sample data</SampleTag> : null}
      />

      <section className="card folder-card">
        <span className="icon-chip icon-chip--lg">
          <FolderOpen size={20} aria-hidden />
        </span>
        <div className="folder-card__body">
          <div className="folder-card__title">
            Source folder
            <span className="sample-tag sample-tag--muted">
              <Lock size={11} aria-hidden />
              Scanning unavailable
            </span>
          </div>
          <p>
            Folder scanning, renaming and moving are not implemented in the backend yet, so no real
            files are read or changed. Use sample data to explore the workflow.
          </p>
          <div className="folder-card__path" aria-disabled="true">
            No folder selected
          </div>
        </div>
        <div className="folder-card__actions">
          <button
            type="button"
            className="btn"
            disabled
            title="Unavailable until the backend can scan folders"
          >
            <FolderOpen size={15} aria-hidden />
            Choose folder
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={loadSample}
            disabled={phase === 'loading'}
          >
            <Sparkles size={15} aria-hidden />
            Load sample data
          </button>
        </div>
      </section>

      {notice ? (
        <div className="banner banner--success" role="status">
          <CheckCircle2 size={16} aria-hidden />
          <span>{notice}</span>
          <button type="button" className="icon-btn" aria-label="Dismiss message" onClick={dismissNotice}>
            <X size={14} aria-hidden />
          </button>
        </div>
      ) : null}

      {phase === 'empty' ? (
        <EmptyState onLoad={loadSample} onPreviewError={previewError} health={health} />
      ) : null}

      {phase === 'loading' ? <LoadingState /> : null}

      {phase === 'error' ? <ErrorState onRetry={loadSample} onReset={resetDemo} /> : null}

      {ready ? (
        <>
          {pendingCount === 0 ? (
            <div className="banner banner--success" role="status">
              <CheckCircle2 size={16} aria-hidden />
              <span>All sample suggestions have been reviewed. No real files were touched.</span>
              <button type="button" className="btn btn--sm" onClick={resetDemo}>
                <RotateCcw size={13} aria-hidden />
                Reset demo
              </button>
            </div>
          ) : null}

          <div className="toolbar">
            <label className="search">
              <Search size={15} aria-hidden />
              <input
                type="search"
                placeholder="Search names, proposals or categories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search sample files"
              />
            </label>
            <div className="chips" role="group" aria-label="Filter by file type">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`chip${filterId === f.id ? ' is-active' : ''}`}
                  aria-pressed={filterId === f.id}
                  onClick={() => setFilterId(f.id)}
                >
                  {f.label}
                  <span>{counts[f.id]}</span>
                </button>
              ))}
            </div>
          </div>

          {selectedIds.length > 0 ? (
            <div className="bulkbar" role="region" aria-label="Bulk actions">
              <strong>{selectedIds.length} selected</strong>
              <button type="button" className="btn btn--sm btn--ok" onClick={() => bulk('approved')}>
                <Check size={14} aria-hidden />
                Approve
              </button>
              <button type="button" className="btn btn--sm btn--danger" onClick={() => bulk('rejected')}>
                <X size={14} aria-hidden />
                Reject
              </button>
              <button type="button" className="link-btn" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          ) : null}

          <div className="organizer-grid">
            <div className="card table-card">
              {filtered.length === 0 ? (
                <div className="state state--inline">
                  <span className="state__icon">
                    <SearchX size={22} aria-hidden />
                  </span>
                  <h3>No sample files match</h3>
                  <p>Try a different search term or choose another file type.</p>
                  <button
                    type="button"
                    className="btn btn--sm"
                    onClick={() => {
                      setQuery('')
                      setFilterId('all')
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th className="col-check">
                        <input
                          ref={allRef}
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleAllVisible}
                          aria-label="Select all visible files"
                        />
                      </th>
                      <th>Filename</th>
                      <th className="col-type">Type</th>
                      <th className="col-size">Size</th>
                      <th className="col-cat">Category</th>
                      <th>Proposed filename</th>
                      <th className="col-status">Status</th>
                      <th className="col-actions">Review</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((file) => {
                      const isSelected = selected.has(file.id)
                      return (
                        <tr
                          key={file.id}
                          className={`${isSelected ? 'is-selected' : ''}${focusedId === file.id ? ' is-focused' : ''}`}
                          onClick={() => setFocusedId(file.id)}
                        >
                          <td className="col-check" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleOne(file.id)}
                              aria-label={`Select ${file.name}`}
                            />
                          </td>
                          <td>
                            <div className="cell-file">
                              <FileTypeIcon kind={file.kind} />
                              <span className="truncate" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="col-type muted">{FILE_KIND_META[file.kind].label}</td>
                          <td className="col-size muted">{formatBytes(file.sizeBytes)}</td>
                          <td className="col-cat">
                            <span className="truncate cat" title={file.category}>
                              {file.category}
                            </span>
                          </td>
                          <td>
                            <span className="truncate proposed" title={file.proposedName}>
                              {file.proposedName}
                            </span>
                          </td>
                          <td className="col-status">
                            <span className={`status status--${file.status}`}>
                              {STATUS_LABEL[file.status]}
                            </span>
                          </td>
                          <td className="col-actions" onClick={(e) => e.stopPropagation()}>
                            <div className="row-actions">
                              {file.status === 'pending' ? (
                                <>
                                  <button
                                    type="button"
                                    className="icon-btn icon-btn--ok"
                                    aria-label={`Approve suggestion for ${file.name}`}
                                    title="Approve (demo)"
                                    onClick={() => review([file.id], 'approved')}
                                  >
                                    <Check size={15} aria-hidden />
                                  </button>
                                  <button
                                    type="button"
                                    className="icon-btn icon-btn--danger"
                                    aria-label={`Reject suggestion for ${file.name}`}
                                    title="Reject (demo)"
                                    onClick={() => review([file.id], 'rejected')}
                                  >
                                    <X size={15} aria-hidden />
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="icon-btn"
                                  aria-label={`Undo decision for ${file.name}`}
                                  title="Undo"
                                  onClick={() => review([file.id], 'pending')}
                                >
                                  <Undo2 size={15} aria-hidden />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <aside className="card preview" aria-label="Filename preview">
              <div className="card__head">
                <h2>Preview</h2>
                <SampleTag />
              </div>
              {focused ? (
                <>
                  <div className="preview__block preview__block--before">
                    <span className="preview__label">Before</span>
                    <code>{focused.name}</code>
                  </div>
                  <div className="preview__arrow">
                    <ArrowRight size={16} aria-hidden />
                  </div>
                  <div className="preview__block preview__block--after">
                    <span className="preview__label">After</span>
                    <code>{focused.proposedName}</code>
                  </div>
                  <dl className="meta-list meta-list--stack">
                    <div>
                      <dt>Suggested category</dt>
                      <dd>{focused.category}</dd>
                    </div>
                    <div>
                      <dt>Type · size</dt>
                      <dd>
                        {FILE_KIND_META[focused.kind].label} · {formatBytes(focused.sizeBytes)}
                      </dd>
                    </div>
                  </dl>
                  <p className="preview__note">
                    <Lock size={12} aria-hidden /> Preview only. Renaming and moving are unavailable
                    until the backend supports them.
                  </p>
                </>
              ) : (
                <p className="preview__empty">
                  Select a row to compare the current filename with the proposed one.
                </p>
              )}
            </aside>
          </div>
        </>
      ) : null}
    </div>
  )
}

function EmptyState({
  onLoad,
  onPreviewError,
  health,
}: {
  onLoad: () => void
  onPreviewError: () => void
  health: HealthResult
}) {
  return (
    <section className="card state">
      <span className="state__icon">
        <Inbox size={24} aria-hidden />
      </span>
      <h3>Nothing to review yet</h3>
      <p>
        When folder scanning becomes available, suggestions will appear here. For now you can explore
        the interface with clearly labelled sample files.
      </p>
      <div className="state__actions">
        <button type="button" className="btn btn--primary" onClick={onLoad}>
          <Sparkles size={15} aria-hidden />
          Load sample data
        </button>
        <button type="button" className="link-btn" onClick={onPreviewError}>
          Preview the error state
        </button>
      </div>
      <div className="state__meta">
        Local AI <HealthPill state={health.state} />
      </div>
    </section>
  )
}

function LoadingState() {
  return (
    <section className="card table-card" aria-busy="true" aria-live="polite">
      <div className="skeleton-head">Preparing sample data…</div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--lg" />
          <span className="skeleton skeleton--md" />
          <span className="skeleton skeleton--lg" />
        </div>
      ))}
    </section>
  )
}

function ErrorState({ onRetry, onReset }: { onRetry: () => void; onReset: () => void }) {
  return (
    <section className="card state state--error" role="alert">
      <span className="state__icon state__icon--error">
        <AlertTriangle size={24} aria-hidden />
      </span>
      <h3>Couldn't load suggestions</h3>
      <p>
        This is a simulated error shown for design review. In the finished product, backend failures
        will appear here with a way to retry.
      </p>
      <div className="state__actions">
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          <Sparkles size={15} aria-hidden />
          Load sample data
        </button>
        <button type="button" className="link-btn" onClick={onReset}>
          Back
        </button>
      </div>
    </section>
  )
}