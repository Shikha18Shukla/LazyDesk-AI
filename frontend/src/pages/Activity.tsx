import { ActivityRow, PageHeader } from '../components/ui'
import type { ActivityItem } from '../types'

export default function Activity({ activity }: { activity: ActivityItem[] }) {
  const done = activity.filter((a) => a.state === 'done').length
  const pending = activity.filter((a) => a.state === 'pending').length

  return (
    <div className="page">
      <PageHeader
        title="Activity"
        subtitle="A timeline of completed and pending actions. Entries marked Sample come from demo data."
        actions={
          <div className="summary">
            <span>
              <strong>{done}</strong> completed
            </span>
            <span>
              <strong>{pending}</strong> pending
            </span>
          </div>
        }
      />
      <section className="card">
        <ul className="timeline">
          {activity.map((item) => (
            <ActivityRow key={item.id} item={item} />
          ))}
        </ul>
      </section>
    </div>
  )
}