import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import EventForm from "../components/EventForm"
import { adminRequest } from "../services/adminApi"

function AdminEventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const editing = Boolean(id)
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(editing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!editing) return undefined
    let active = true

    const loadEvent = async () => {
      setLoading(true)
      setError("")
      try {
        const result = await adminRequest(`events/${id}`)
        if (active) setEvent(result.data)
      } catch (loadError) {
        if (active) setError(loadError.message || "Unable to load event")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadEvent()
    return () => {
      active = false
    }
  }, [editing, id])

  const saveEvent = async (payload) => {
    setSaving(true)
    setError("")
    try {
      await adminRequest(editing ? `events/${id}` : "events", {
        method: editing ? "PUT" : "POST",
        body: JSON.stringify(payload),
      })
      navigate("/admin/events", {
        replace: true,
        state: { notice: editing ? "Event changes saved." : "Event created successfully." },
      })
    } catch (saveError) {
      setError(saveError.message || "Unable to save event")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/admin/events" className="inline-flex items-center gap-2 text-sm text-[var(--vj-muted)] hover:text-white"><ArrowLeft size={16} /> Events</Link>
      <div className="mb-8 mt-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">VJ ARC / EVENTS</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{editing ? "Edit Event" : "Create Event"}</h1>
        <p className="mt-2 text-sm text-[var(--vj-muted)]">{editing ? "Update the event details shown on the public site." : "Add an event to the VJ ARC calendar."}</p>
      </div>

      {loading ? (
        <p className="border-y border-white/10 py-10 text-sm text-[var(--vj-muted)]">Loading event...</p>
      ) : error && editing && !event ? (
        <div role="alert" className="border border-red-400/20 bg-red-400/5 p-5 text-sm text-red-200">
          <p>{error}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-3 font-semibold underline underline-offset-4">Retry</button>
        </div>
      ) : (
        <EventForm event={event} mode={editing ? "edit" : "create"} saving={saving} error={error} onSubmit={saveEvent} />
      )}
    </div>
  )
}

export default AdminEventFormPage