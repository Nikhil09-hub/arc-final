import { useEffect, useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ArrowUpRight,
  CalendarDays,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react"
import { getEvents } from "../services/eventService"
import { adminRequest } from "../services/adminApi"

const categoryNames = {
  workshop: "Workshop",
  hackathon: "Hackathon",
  "ai-ml": "AI / ML",
  coding: "Coding",
  other: "Other",
}

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
  if (!value) return "Not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Not set"
    : date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

function AdminEventsPage() {
  const location = useLocation()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [notice, setNotice] = useState(location.state?.notice || "")
  const [reload, setReload] = useState(0)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true

    const loadEvents = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await getEvents()
        if (active) setEvents(data)
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load events")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [reload])

  const confirmDelete = async () => {
    if (!eventToDelete) return
    setDeleting(true)

    try {
      await adminRequest(`events/${eventToDelete._id}`, { method: "DELETE" })
      setEventToDelete(null)
      setNotice(`${eventToDelete.title} was deleted.`)
      setReload((value) => value + 1)
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete event")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">VJ ARC / ADMIN</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Events</h1>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">Create, update, and publish club events.</p>
        </div>
        <Link to="/admin/events/create" className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--vj-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90">
          <Plus size={17} /> Create Event
        </Link>
      </div>

      {notice && (
        <div role="status" className="mb-5 flex items-center justify-between border border-green-400/20 bg-green-400/5 px-4 py-3 text-sm text-green-200">
          <span>{notice}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")} className="p-1"><X size={16} /></button>
        </div>
      )}

      {error && (
        <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          <span>{error}</span>
          <button type="button" onClick={() => setReload((value) => value + 1)} className="inline-flex items-center gap-2 font-semibold"><RefreshCw size={15} /> Retry</button>
        </div>
      )}

      {loading ? (
        <div className="border-y border-white/10 py-14 text-center text-sm text-[var(--vj-muted)]">Loading events...</div>
      ) : events.length === 0 ? (
        <div className="border-y border-white/10 py-16 text-center">
          <CalendarDays size={28} className="mx-auto text-[var(--vj-blue)]" />
          <h2 className="mt-4 text-lg font-semibold">No events yet</h2>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">Create your first event to get started.</p>
          <Link to="/admin/events/create" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--vj-blue)] hover:underline"><Plus size={16} /> Create Event</Link>
        </div>
      ) : (
        <div className="divide-y divide-white/10 border-y border-white/10">
          {events.map((event) => {
            const status = getEventStatus(event)
            return (
              <article key={event._id} className="grid gap-4 py-5 md:grid-cols-[112px_minmax(0,1fr)_auto] md:items-center">
                <img src={event.coverImage} alt={`${event.title} cover`} className="aspect-[16/10] w-full object-cover md:w-28" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{event.title}</h2>
                    <span className={`border px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] ${status === "Upcoming" ? "border-[var(--vj-blue)]/40 text-[var(--vj-blue)]" : status === "Ongoing" ? "border-green-400/30 text-green-300" : "border-white/15 text-[var(--vj-muted)]"}`}>{status}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--vj-muted)]">{categoryNames[event.category] || event.category} · {event.venue || "Venue not set"}</p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-2 text-xs text-[var(--vj-muted)]"><span>{formatDate(event.startDate)}</span><span aria-hidden="true">to</span><span>{formatDate(event.endDate)}</span></p>
                </div>
                <div className="flex items-center gap-1 md:justify-end">
                  <Link to={`/events/${event.slug}`} target="_blank" rel="noreferrer" aria-label={`View ${event.title}`} title="View public event" className="rounded-lg p-2 text-[var(--vj-muted)] hover:bg-white/5 hover:text-white"><ArrowUpRight size={18} /></Link>
                  <Link to={`/admin/events/edit/${event._id}`} aria-label={`Edit ${event.title}`} title="Edit event" className="rounded-lg p-2 text-[var(--vj-muted)] hover:bg-white/5 hover:text-white"><Pencil size={17} /></Link>
                  <button type="button" onClick={() => setEventToDelete(event)} aria-label={`Delete ${event.title}`} title="Delete event" className="rounded-lg p-2 text-[var(--vj-muted)] hover:bg-red-400/10 hover:text-red-300"><Trash2 size={17} /></button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {eventToDelete && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-5" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-event-title" className="w-full max-w-md border border-white/10 bg-[var(--vj-dark)] p-6 shadow-2xl">
            <h2 id="delete-event-title" className="text-xl font-semibold">Delete this event?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--vj-muted)]">“{eventToDelete.title}” will be permanently removed from the events list.</p>
            <div className="mt-7 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setEventToDelete(null)} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50">{deleting ? "Deleting..." : "Delete Event"}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default AdminEventsPage