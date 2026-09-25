import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import {
  ArrowRight,
  CalendarDays,
  Images,
  Plus,
  Upload,
} from "lucide-react"
import { getEvents } from "../services/eventService"
import { getGalleryPhotos } from "../services/galleryService"

function getEventStatus(event) {
  const now = Date.now()
  const start = new Date(event.startDate).getTime()
  const end = new Date(event.endDate).getTime()

  if (Number.isNaN(start) || Number.isNaN(end)) return "Unknown"
  if (now < start) return "Upcoming"
  if (now <= end) return "Ongoing"
  return "Past"
}

function formatDate(value) {
  if (!value) return "Date not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function AdminDashboardPage() {
  const [events, setEvents] = useState([])
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      setLoading(true)
      setError("")

      try {
        const [eventData, galleryData] = await Promise.all([
          getEvents(),
          getGalleryPhotos(),
        ])

        if (active) {
          setEvents(eventData)
          setPhotos(galleryData)
        }
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load dashboard data")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => {
      active = false
    }
  }, [attempt])

  const statuses = events.map(getEventStatus)
  const upcomingCount = statuses.filter((status) => status === "Upcoming").length
  const pastCount = statuses.filter((status) => status === "Past").length
  const recentEvents = [...events]
    .sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate))
    .slice(0, 5)
  const recentPhotos = [...photos]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  const stats = [
    { label: "Total Events", value: events.length, icon: CalendarDays },
    { label: "Gallery Photos", value: photos.length, icon: Images },
    { label: "Upcoming Events", value: upcomingCount, icon: CalendarDays },
    { label: "Past Events", value: pastCount, icon: CalendarDays },
  ]

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">VJ ARC / ADMIN</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Dashboard</h1>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">A current view of events and gallery activity.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/events/create" className="inline-flex items-center gap-2 rounded-lg bg-[var(--vj-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
            <Plus size={17} /> Create Event
          </Link>
          <Link to="/admin/gallery" className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium hover:bg-white/5">
            <Upload size={17} /> Upload Photos
          </Link>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="font-semibold underline underline-offset-4">Retry</button>
        </div>
      )}

      <section aria-label="Admin statistics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="border border-white/10 bg-[var(--vj-dark)] p-5">
            <div className="flex items-center justify-between text-[var(--vj-muted)]">
              <span className="text-sm">{label}</span>
              <Icon size={18} className="text-[var(--vj-blue)]" />
            </div>
            <p className="mt-5 font-display text-3xl font-semibold">{loading ? "—" : value}</p>
          </div>
        ))}
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold">Recent Events</h2>
            <Link to="/admin/events" className="inline-flex items-center gap-1 text-sm text-[var(--vj-blue)] hover:underline">View Events <ArrowRight size={15} /></Link>
          </div>
          {loading ? (
            <p className="py-6 text-sm text-[var(--vj-muted)]">Loading events...</p>
          ) : recentEvents.length ? (
            <ul className="divide-y divide-white/10">
              {recentEvents.map((event) => (
                <li key={event._id} className="flex items-center gap-4 py-4">
                  <img src={event.coverImage} alt="" className="size-14 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{event.title}</p>
                    <p className="mt-1 text-xs text-[var(--vj-muted)]">{formatDate(event.startDate)} · {getEventStatus(event)}</p>
                  </div>
                  <Link aria-label={`Edit ${event.title}`} to={`/admin/events/edit/${event._id}`} className="rounded p-2 text-[var(--vj-muted)] hover:bg-white/5 hover:text-white"><ArrowRight size={17} /></Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-sm text-[var(--vj-muted)]">No events have been added yet.</p>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-lg font-semibold">Recent Gallery Uploads</h2>
            <Link to="/admin/gallery" className="inline-flex items-center gap-1 text-sm text-[var(--vj-blue)] hover:underline">View Gallery <ArrowRight size={15} /></Link>
          </div>
          {loading ? (
            <p className="py-6 text-sm text-[var(--vj-muted)]">Loading gallery...</p>
          ) : recentPhotos.length ? (
            <ul className="divide-y divide-white/10">
              {recentPhotos.map((photo) => (
                <li key={photo._id} className="flex items-center gap-4 py-4">
                  <img src={photo.imageUrl} alt={photo.caption || photo.eventName} className="size-14 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{photo.eventName}</p>
                    <p className="mt-1 text-xs text-[var(--vj-muted)]">{formatDate(photo.createdAt)} · {photo.category}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-6 text-sm text-[var(--vj-muted)]">No gallery photos have been uploaded yet.</p>
          )}
        </section>
      </div>
    </div>
  )
}

export default AdminDashboardPage