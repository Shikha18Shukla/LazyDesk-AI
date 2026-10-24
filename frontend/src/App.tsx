import { useState } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import { useHealth } from './hooks/useHealth'
import { useWorkspace } from './hooks/useWorkspace'
import Activity from './pages/Activity'
import Organizer from './pages/Organizer'
import Overview from './pages/Overview'
import Settings from './pages/Settings'
import type { PageId } from './types'

export default function App() {
  const [page, setPage] = useState<PageId>('overview')
  const { health, refresh } = useHealth()
  const workspace = useWorkspace()

  const recheck = () => {
    void refresh()
  }

  return (
    <div className="app">
      <Sidebar page={page} onNavigate={setPage} health={health} />
      <main className="main">
        <div className="main__inner" key={page}>
          {page === 'overview' && (
            <Overview
              health={health}
              onRecheck={recheck}
              workspace={workspace}
              onNavigate={setPage}
            />
          )}
          {page === 'organizer' && <Organizer workspace={workspace} health={health} />}
          {page === 'activity' && <Activity activity={workspace.activity} />}
          {page === 'settings' && <Settings health={health} onRecheck={recheck} />}
        </div>
      </main>
    </div>
  )
}