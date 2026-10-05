import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Loader2,
  MapPin,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react"
import {
  deleteRegistration,
  getRegistrationsByEvent,
  getRegistrationsSummary,
} from "../services/registrationService"

function formatDate(value) {
  if (!value) return "Date not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
}

function formatDateTime(value) {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "—"
    : `${date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })} · ${date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      })}`
}

function getRegistrationParticipants(registration) {
  if (registration.registrationType !== "team" || !registration.team) {
    return [{
      role: "Individual",
      name: registration.fullName || "",
      rollNo: registration.rollNo || "",
      email: registration.email || "",
      phone: registration.phone || "",
    }]
  }

  return [
    {
      role: "Leader",
      ...registration.team.leader,
    },
    ...(registration.team.members || []).map((member) => ({
      role: "Member",
      ...member,
    })),
  ]
}

function exportRegistrationsToCsv(registrations, eventTitle) {
  const headers = [
    "Event",
    "Registration Type",
    "Team Name",
    "Team Size",
    "Role",
    "Full Name",
    "Roll Number",
    "Email",
    "Phone",
    "College",
    "Department",
    "Year",
    "Registered At",
  ]

  const escapeCsvField = (field) => {
    if (field === null || field === undefined) return '""'
    const value = String(field)
    const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value
    const str = safeValue.replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = registrations.flatMap((registration) =>
    getRegistrationParticipants(registration).map((participant) => [
      eventTitle || registration.eventId?.title || "VJ ARC Event",
      registration.registrationType === "team" ? "Team" : "Individual",
      registration.team?.teamName || "",
      registration.team?.teamSize || "",
      participant.role,
      participant.name,
      participant.rollNo,
      participant.email,
      participant.phone || "",
      registration.college || "",
      registration.department || "",
      registration.year || "",
      registration.createdAt
        ? new Date(registration.createdAt).toLocaleString("en-IN")
        : "",
    ].map(escapeCsvField))
  )

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n")
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  const safeTitle = (eventTitle || "registrations")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  link.setAttribute("href", url)
  link.setAttribute("download", `${safeTitle}-registrations.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// -------------------------------------------------------------
// 1. OVERVIEW PAGE: List events with registration counts
// -------------------------------------------------------------
export default function AdminRegistrationsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true

    const loadSummary = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await getRegistrationsSummary()
        if (active) setEvents(data)
      } catch (err) {
        if (active) setError(err.message || "Failed to load registrations summary")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSummary()
    return () => {
      active = false
    }
  }, [])

  return (
    <div>
      <div className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
          VJ ARC / ADMIN
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Registrations</h1>
        <p className="mt-2 text-sm text-[var(--vj-muted)]">
          Manage attendees registered for VJ ARC internal events.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-sm text-[var(--vj-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--vj-blue)]" />
          <span>Loading registrations...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[var(--vj-dark)] p-12 text-center">
          <Users size={32} className="mx-auto text-[var(--vj-muted)] opacity-50" />
          <h2 className="mt-4 text-lg font-semibold">No Internal Events Configured</h2>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">
            Create or edit an event in the Events section and enable VJ ARC Website Registration.
          </p>
          <Link
            to="/admin/events"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--vj-blue)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Manage Events
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <div
              key={event._id}
              className="flex flex-col justify-between rounded-xl border border-white/10 bg-[var(--vj-dark)] p-5 transition hover:border-[var(--vj-blue)]/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[8px] uppercase tracking-wider text-[var(--vj-muted)]">
                    {event.category}
                  </span>
                  <span className="rounded-full border border-[var(--vj-blue)]/30 bg-[var(--vj-blue)]/10 px-2.5 py-1 font-mono text-[9px] font-semibold text-[var(--vj-blue)]">
                    {event.registrationCount} {event.registrationCount === 1 ? "registration" : "registrations"}
                  </span>
                </div>

                <h2 className="mt-3 text-lg font-semibold text-white line-clamp-2">
                  {event.title}
                </h2>

                <div className="mt-3 space-y-1.5 text-xs text-[var(--vj-muted)]">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={13} className="text-[var(--vj-blue)]" />
                    <span>{formatDate(event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-[var(--vj-blue)]" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <Link
                  to={`/admin/registrations/${event._id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--vj-blue)] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white shadow-[0_0_16px_rgba(37,99,255,0.2)] transition hover:opacity-90"
                >
                  <Users size={14} />
                  VIEW
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// 2. DETAIL PAGE: Event registrations list, search, delete, CSV
// -------------------------------------------------------------
export function AdminRegistrationsDetailPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  useEffect(() => {
    let active = true

    const loadRegistrations = async () => {
      setLoading(true)
      setError("")
      try {
        const response = await getRegistrationsByEvent(eventId)
        if (active) {
          setEvent(response.event)
          setRegistrations(response.data || [])
        }
      } catch (err) {
        if (active) setError(err.message || "Failed to load registrations")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadRegistrations()
    return () => {
      active = false
    }
  }, [eventId])

  // Filtered registrations based on search query
  const filteredRegistrations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return registrations

    return registrations.filter((reg) => {
      const searchable = [
        reg.team?.teamName,
        reg.fullName,
        reg.rollNo,
        reg.email,
        reg.phone,
        reg.college,
        reg.department,
        reg.year,
        ...getRegistrationParticipants(reg).flatMap((participant) => [
          participant.name,
          participant.rollNo,
          participant.email,
          participant.phone,
        ]),
      ]
      return searchable.some((value) => (value || "").toLowerCase().includes(q))
    })
  }, [registrations, searchQuery])

  // Delete handler
  const confirmDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setDeleteError("")
    try {
      await deleteRegistration(deleteTarget._id)
      setRegistrations((prev) => prev.filter((r) => r._id !== deleteTarget._id))
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(err.message || "Failed to delete registration")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      {/* Back button */}
      <Link
        to="/admin/registrations"
        className="inline-flex items-center gap-2 text-sm text-[var(--vj-muted)] hover:text-white"
      >
        <ArrowLeft size={16} /> Back to Registrations
      </Link>

      {/* Header and Actions */}
      <div className="mt-4 mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
            VJ ARC / REGISTRATIONS
          </p>
          <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
            {event?.title || "Event Registrations"}
          </h1>
          <p className="mt-1 text-xs text-[var(--vj-muted)]">
            {registrations.length} total {registrations.length === 1 ? "registration" : "registrations"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={registrations.length === 0}
            onClick={() => exportRegistrationsToCsv(filteredRegistrations, event?.title)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-50"
          >
            <Download size={15} />
            EXPORT CSV {searchQuery && `(${filteredRegistrations.length})`}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"
        >
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="mb-6 relative max-w-md">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--vj-muted)]"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Name, Roll No, Email, College..."
          className="w-full rounded-lg border border-white/10 bg-[var(--vj-dark)] pl-10 pr-9 py-2.5 text-xs text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--vj-muted)] hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 py-16 text-sm text-[var(--vj-muted)]">
          <Loader2 size={18} className="animate-spin text-[var(--vj-blue)]" />
          <span>Loading registrations...</span>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[var(--vj-dark)] p-10 text-center text-sm text-[var(--vj-muted)]">
          {searchQuery
            ? "No registrations match your search criteria."
            : "No participants have registered for this event yet."}
        </div>
      ) : (
        <>
          {/* Desktop / Tablet Table View */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-white/10 bg-[var(--vj-dark)]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.02] text-[var(--vj-muted)] uppercase tracking-wider font-mono text-[10px]">
                <tr>
                  <th className="px-4 py-3.5">Name / Team</th>
                  <th className="px-4 py-3.5">Roll No</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Phone</th>
                  <th className="px-4 py-3.5">College</th>
                  <th className="px-4 py-3.5">Dept</th>
                  <th className="px-4 py-3.5">Year</th>
                  <th className="px-4 py-3.5">Registered At</th>
                  <th className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg._id} className="transition hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5 font-medium text-white whitespace-nowrap">
                      {reg.registrationType === "team" ? (
                        <div>
                          <p>{reg.team?.teamName || "Team Registration"}</p>
                          <p className="mt-1 text-[10px] text-[var(--vj-muted)]">
                            Team · {reg.team?.teamSize || getRegistrationParticipants(reg).length} members · Leader: {reg.team?.leader?.name || reg.fullName}
                          </p>
                          <details className="mt-2 whitespace-normal">
                            <summary className="cursor-pointer text-[10px] font-medium text-[var(--vj-blue)]">
                              View all team members
                            </summary>
                            <ul className="mt-2 space-y-1 text-[10px] text-[var(--vj-muted)]">
                              {getRegistrationParticipants(reg).map((participant) => (
                                <li key={`${participant.role}-${participant.rollNo}`}>
                                  {participant.role}: {participant.name} · {participant.rollNo} · {participant.email}
                                  {participant.phone ? ` · ${participant.phone}` : ""}
                                </li>
                              ))}
                            </ul>
                          </details>
                        </div>
                      ) : (
                        <>
                          {reg.fullName}
                          <span className="ml-2 text-[9px] uppercase text-[var(--vj-muted)]">Individual</span>
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[var(--vj-blue)] font-semibold whitespace-nowrap">
                      {reg.team?.leader?.rollNo || reg.rollNo}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--vj-muted)] whitespace-nowrap">
                      {reg.team?.leader?.email || reg.email}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--vj-muted)] whitespace-nowrap">
                      {reg.team?.leader?.phone || reg.phone || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-white/80 max-w-[180px] truncate" title={reg.college}>
                      {reg.college}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--vj-muted)] whitespace-nowrap">
                      {reg.department}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--vj-muted)] whitespace-nowrap">
                      {reg.year}
                    </td>
                    <td className="px-4 py-3.5 text-[var(--vj-muted)] whitespace-nowrap">
                      {formatDateTime(reg.createdAt)}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(reg)}
                        title="Delete registration"
                        aria-label={`Delete registration for ${reg.fullName}`}
                        className="rounded p-1.5 text-[var(--vj-muted)] transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="grid gap-3 md:hidden">
            {filteredRegistrations.map((reg) => (
              <div
                key={reg._id}
                className="rounded-xl border border-white/10 bg-[var(--vj-dark)] p-4 space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {reg.registrationType === "team"
                        ? reg.team?.teamName || "Team Registration"
                        : reg.fullName}
                    </p>
                    {reg.registrationType === "team" && (
                      <p className="mt-1 text-[var(--vj-muted)]">
                        Team · {reg.team?.teamSize || getRegistrationParticipants(reg).length} members
                      </p>
                    )}
                    <p className="font-mono text-[var(--vj-blue)] font-medium mt-0.5">
                      {reg.team?.leader?.rollNo || reg.rollNo}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(reg)}
                    aria-label={`Delete registration for ${reg.fullName}`}
                    className="rounded p-1.5 text-[var(--vj-muted)] transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[var(--vj-muted)]">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/40">Email</span>
                    <span className="text-white/80 break-all">{reg.team?.leader?.email || reg.email}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/40">Phone</span>
                    <span className="text-white/80">{reg.team?.leader?.phone || reg.phone || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block text-[9px] uppercase tracking-wider text-white/40">College</span>
                    <span className="text-white/80">{reg.college || "—"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/40">Dept / Year</span>
                    <span className="text-white/80">{reg.department || "—"} · {reg.year || "—"}</span>
                  </div>
                  {reg.registrationType === "team" && (
                    <div className="col-span-2">
                      <details>
                        <summary className="cursor-pointer text-[var(--vj-blue)]">View team members</summary>
                        <ul className="mt-2 space-y-1 text-white/80">
                          {getRegistrationParticipants(reg).map((participant) => (
                            <li key={`${participant.role}-${participant.rollNo}`}>
                              {participant.role}: {participant.name} · {participant.rollNo} · {participant.email}
                              {participant.phone ? ` · ${participant.phone}` : ""}
                            </li>
                          ))}
                        </ul>
                      </details>
                    </div>
                  )}
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-white/40">Registered</span>
                    <span className="text-white/80">{formatDateTime(reg.createdAt)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4"
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-6 shadow-2xl"
          >
            <h2 className="text-lg font-bold text-white">Delete this registration?</h2>
            <p className="mt-2 text-xs text-[var(--vj-muted)]">
              Are you sure you want to delete the registration for:
            </p>
            <div className="mt-3 rounded-lg border border-white/10 bg-[var(--vj-black)] p-3 text-xs">
              <p className="font-semibold text-white">{deleteTarget.fullName}</p>
              <p className="font-mono text-[var(--vj-blue)] mt-0.5">{deleteTarget.rollNo}</p>
              <p className="text-[var(--vj-muted)] mt-0.5">{deleteTarget.email}</p>
            </div>

            {deleteError && (
              <p className="mt-3 text-xs text-red-300">{deleteError}</p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setDeleteTarget(null)
                  setDeleteError("")
                }}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-medium text-white hover:bg-white/5 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
