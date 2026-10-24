import type { LucideIcon } from 'lucide-react'
import {
  Activity as ActivityIcon,
  Cpu,
  Feather,
  FolderTree,
  LayoutDashboard,
  Settings as SettingsIcon,
} from 'lucide-react'
import { MODEL_NAME } from '../services/api'
import type { HealthResult, PageId } from '../types'
import { HealthPill } from './ui'

const NAV: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'organizer', label: 'File Organizer', icon: FolderTree },
  { id: 'activity', label: 'Activity', icon: ActivityIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
]

interface SidebarProps {
  page: PageId
  onNavigate: (page: PageId) => void
  health: HealthResult
}

export default function Sidebar({ page, onNavigate, health }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand__mark">
          <Feather size={18} aria-hidden />
        </span>
        <span className="brand__name">
          LazyDesk <em>AI</em>
        </span>
      </div>

      <nav className="nav" aria-label="Main navigation">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`nav__item${page === id ? ' is-active' : ''}`}
            aria-current={page === id ? 'page' : undefined}
            title={label}
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} aria-hidden />
            <span className="nav__label">{label}</span>
          </button>
        ))}
      </nav>

      <div className="ai-panel">
        <div className="ai-panel__head">
          <Cpu size={15} aria-hidden />
          <span className="ai-panel__title">Local AI</span>
        </div>
        <div className="ai-panel__model">{health.model ?? MODEL_NAME}</div>
        <HealthPill state={health.state} />
        <p className="ai-panel__note">
          {health.state === 'connected'
            ? 'Running on this machine.'
            : health.state === 'checking'
              ? 'Looking for the backend…'
              : 'Start the backend to enable AI.'}
        </p>
      </div>
    </aside>
  )
}