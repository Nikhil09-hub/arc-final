import { useEffect, useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ClipboardList,
  FileText,
  FolderOpen,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  QrCode,
  Search,
  Trash2,
  X,
} from "lucide-react"
import { getEvents } from "../services/eventService"
import {
  createEventDocument,
  deleteEventDocument,
  getAllEventDocuments,
  getEventDocuments,
  updateEventDocument,
} from "../services/eventDocumentService"

const DOCUMENT_TYPES = [
  { value: "plan-of-action", label: "Plan of Action", description: "Planning and execution document" },
  { value: "event-report", label: "Event Report", description: "Final event report" },
  { value: "logistics", label: "Logistics", description: "Venue, equipment and logistics" },
  { value: "certificates", label: "Certificates", description: "Certificates and completion records" },
  { value: "attendance", label: "Attendance", description: "Attendance records" },
  { value: "posters-creatives", label: "Posters / Creatives", description: "Promotional artwork and creatives" },
  { value: "registration", label: "Registration", description: "Registration information" },
  { value: "other", label: "Other", description: "Additional event documentation" },
]

const QR_TYPES = [
  { value: "registration", label: "Registration" },
  { value: "attendance", label: "Attendance" },
  { value: "feedback", label: "Feedback" },
  { value: "certificate", label: "Certificate" },
  { value: "other", label: "Other" },
]

const fieldClass = "mt-2 w-full rounded-lg border border-white/10 bg-[var(--vj-black)] px-3.5 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"

function formatDate(value) {
  if (!value) return "Date not set"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date not set"
    : date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })
}

function formatQrType(value) {
  return QR_TYPES.find((item) => item.value === value)?.label || "Other"
}

function EventDocumentForm({ document, initialType, qrOnly, onClose, onSave }) {
  const [type, setType] = useState(document?.type || initialType || DOCUMENT_TYPES[0].value)
  const [qrType, setQrType] = useState(document?.qrType || "registration")
  const [title, setTitle] = useState(document?.title || "")
  const [url, setUrl] = useState(document?.url || "")
  const [description, setDescription] = useState(document?.description || "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError("")
    try {
      await onSave({
        type: qrOnly ? "qr-code" : type,
        qrType: qrOnly ? qrType : "other",
        title: title.trim(),
        url: url.trim(),
        description: description.trim(),
      })
    } catch (saveError) {
      setError(saveError.message || "Unable to save this document")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center overflow-y-auto bg-black/75 p-4 sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="document-form-title" className="my-auto max-h-[calc(100vh-2rem)] w-full max-w-xl overflow-y-auto border border-white/10 bg-[var(--vj-dark)] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--vj-blue)]">Event documents</p>
            <h2 id="document-form-title" className="mt-2 text-xl font-semibold">{document ? "Edit" : "Add"} {qrOnly ? "QR Code" : "Event Document"}</h2>
          </div>
          <button type="button" aria-label="Close dialog" onClick={onClose} className="rounded-lg p-2 text-[var(--vj-muted)] hover:bg-white/5 hover:text-white"><X size={18} /></button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {qrOnly ? (
            <label className="block text-sm font-medium">
              QR Type
              <select value={qrType} onChange={(event) => setQrType(event.target.value)} className={fieldClass}>
                {QR_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          ) : (
            <label className="block text-sm font-medium">
              Document Type
              <select value={type} onChange={(event) => setType(event.target.value)} className={fieldClass}>
                {DOCUMENT_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
          )}

          <label className="block text-sm font-medium">
            Title
            <input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} className={fieldClass} placeholder={qrOnly ? "e.g. Registration QR" : "e.g. Event planning document"} />
          </label>

          <label className="block text-sm font-medium">
            Google Drive Link
            <input type="url" value={url} onChange={(event) => setUrl(event.target.value)} required className={fieldClass} placeholder="https://drive.google.com/..." />
          </label>

          <label className="block text-sm font-medium">
            Description <span className="font-normal text-[var(--vj-muted)]">(optional)</span>
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} maxLength={1000} className={`${fieldClass} resize-y`} placeholder="Add a short note" />
          </label>

          {error && <p role="alert" className="border border-red-400/20 bg-red-400/5 px-3 py-2.5 text-sm text-red-200">{error}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button type="button" disabled={saving} onClick={onClose} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--vj-blue)] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50">
              {saving && <LoaderCircle size={16} className="animate-spin" />}
              {document ? "Save Changes" : qrOnly ? "Add QR Code" : "Add Document"}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function DocumentActions({ document, onEdit, onDelete }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <a href={document.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${document.title} in Drive`} title="Open Drive" className="rounded-lg p-2 text-[var(--vj-muted)] transition hover:bg-white/5 hover:text-white"><ArrowUpRight size={17} /></a>
      <button type="button" onClick={() => onEdit(document)} aria-label={`Edit ${document.title}`} title="Edit" className="rounded-lg p-2 text-[var(--vj-muted)] transition hover:bg-white/5 hover:text-white"><Pencil size={16} /></button>
      <button type="button" onClick={() => onDelete(document)} aria-label={`Delete ${document.title}`} title="Delete reference" className="rounded-lg p-2 text-[var(--vj-muted)] transition hover:bg-red-400/10 hover:text-red-300"><Trash2 size={16} /></button>
    </div>
  )
}

export default function AdminEventDocumentsPage() {
  const [events, setEvents] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([getEvents(), getAllEventDocuments()])
      .then(([eventData, documentData]) => {
        if (!active) return
        setError("")
        setEvents(eventData)
        setDocuments(documentData)
      })
      .catch((loadError) => {
        if (active) setError(loadError.message || "Unable to load event documents")
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [reload])

  const countsByEvent = useMemo(() => documents.reduce((counts, document) => {
    const key = document.eventId
    counts[key] ||= {}
    counts[key][document.type] = (counts[key][document.type] || 0) + 1
    return counts
  }, {}), [documents])

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return events.filter((event) => {
      const counts = countsByEvent[event._id] || {}
      const hasDocuments = Object.values(counts).some((count) => count > 0)
      return (!query || event.title.toLocaleLowerCase().includes(query))
        && (eventFilter === "all" || event._id === eventFilter)
        && (statusFilter === "all" || (statusFilter === "with-documents" ? hasDocuments : !hasDocuments))
    })
  }, [events, countsByEvent, search, eventFilter, statusFilter])

  return (
    <section>
      <header className="mb-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">VJ ARC / ADMIN</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Event Documents</h1>
        <p className="mt-2 text-sm text-[var(--vj-muted)]">A document folder for every event.</p>
      </header>

      <div className="mb-6 grid gap-3 md:grid-cols-[minmax(220px,1fr)_minmax(170px,240px)_minmax(170px,220px)]">
        <label className="relative block">
          <span className="sr-only">Search events</span>
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--vj-muted)]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search events..." className={`${fieldClass} mt-0 pl-10`} />
        </label>
        <label>
          <span className="sr-only">Filter by event</span>
          <select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className={`${fieldClass} mt-0`}>
            <option value="all">All Events</option>
            {events.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Filter by document status</span>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={`${fieldClass} mt-0`}>
            <option value="all">Any Status</option>
            <option value="with-documents">Has Documents</option>
            <option value="no-documents">No Documents Yet</option>
          </select>
        </label>
      </div>

      {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"><span>{error}</span><button type="button" onClick={() => setReload((value) => value + 1)} className="font-semibold underline">Retry</button></div>}

      {loading ? (
        <div className="border-y border-white/10 py-16 text-center text-sm text-[var(--vj-muted)]"><LoaderCircle size={20} className="mx-auto mb-3 animate-spin" />Loading events...</div>
      ) : error && events.length === 0 ? (
        <div className="border-y border-white/10 py-14 text-center text-sm text-[var(--vj-muted)]">Events could not be loaded. Retry to try again.</div>
      ) : events.length === 0 ? (
        <div className="border-y border-white/10 py-16 text-center">
          <FolderOpen size={28} className="mx-auto text-[var(--vj-blue)]" />
          <h2 className="mt-4 text-lg font-semibold">No events available.</h2>
          <p className="mt-2 text-sm text-[var(--vj-muted)]">Create an event first from Events → Create Event.</p>
          <Link to="/admin/events/create" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--vj-blue)] hover:underline"><Plus size={16} /> Create Event</Link>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="border-y border-white/10 py-14 text-center text-sm text-[var(--vj-muted)]">No events match these filters.</div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredEvents.map((event) => {
            const counts = countsByEvent[event._id] || {}
            const qrCount = counts["qr-code"] || 0
            return (
              <article key={event._id} className="border border-white/10 bg-[var(--vj-dark)] p-5 transition-colors hover:border-[var(--vj-blue)]/35 sm:p-6">
                <div className="flex items-start gap-3">
                  <FolderOpen size={20} className="mt-0.5 shrink-0 text-[var(--vj-blue)]" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold">{event.title}</h2>
                    <p className="mt-1 text-xs text-[var(--vj-muted)]">{formatDate(event.startDate)} <span className="px-1 text-white/30">·</span> {event.category}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-xs text-[var(--vj-muted)]">
                  {[
                    ["plan-of-action", "Plan of Action"],
                    ["event-report", "Event Report"],
                    ["logistics", "Logistics"],
                  ].map(([type, label]) => (
                    <span key={type} className="inline-flex items-center gap-1.5">
                      {counts[type] ? <Check size={14} className="text-emerald-300" /> : <span className="grid size-3.5 place-items-center rounded-full border border-white/25 text-[9px]">○</span>}
                      {label}
                    </span>
                  ))}
                  <span className="inline-flex items-center gap-1.5"><QrCode size={14} className={qrCount ? "text-emerald-300" : "text-[var(--vj-muted)]"} />QR Codes ({qrCount})</span>
                </div>

                <Link to={`/admin/event-documents/${event._id}`} className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2.5 text-sm font-medium transition hover:border-[var(--vj-blue)]/60 hover:bg-[var(--vj-blue)]/10">
                  Open Documents <ArrowUpRight size={15} />
                </Link>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function AdminEventDocumentsDetailPage() {
  const { eventId } = useParams()
  const [event, setEvent] = useState(null)
  const [documents, setDocuments] = useState([])
  const [error, setError] = useState("")
  const [loadedEventId, setLoadedEventId] = useState("")
  const [reload, setReload] = useState(0)
  const [formState, setFormState] = useState(null)
  const [documentToDelete, setDocumentToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    getEventDocuments(eventId)
      .then((result) => {
        if (!active) return
        setError("")
        setEvent(result.event)
        setDocuments(result.documents)
        setLoadedEventId(eventId)
      })
      .catch((loadError) => {
        if (!active) return
        setError(loadError.message || "Unable to load this event's documents")
        setLoadedEventId(eventId)
      })
    return () => { active = false }
  }, [eventId, reload])

  const saveDocument = async (values) => {
    if (formState.document) {
      await updateEventDocument(formState.document._id, values)
    } else {
      await createEventDocument({ ...values, eventId })
    }
    setFormState(null)
    setReload((value) => value + 1)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return
    setDeleting(true)
    setError("")
    try {
      await deleteEventDocument(documentToDelete._id)
      setDocuments((current) => current.filter((document) => document._id !== documentToDelete._id))
      setDocumentToDelete(null)
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete this document")
    } finally {
      setDeleting(false)
    }
  }

  const qrDocuments = documents.filter((document) => document.type === "qr-code")
  const regularDocuments = documents.filter((document) => document.type !== "qr-code")

  if (loadedEventId !== eventId) {
    return <div className="py-20 text-center text-sm text-[var(--vj-muted)]"><LoaderCircle size={20} className="mx-auto mb-3 animate-spin" />Loading event documents...</div>
  }

  if (error && !event) {
    return <div><Link to="/admin/event-documents" className="inline-flex items-center gap-2 text-sm text-[var(--vj-muted)] hover:text-white"><ArrowLeft size={16} /> Back to Event Documents</Link><p role="alert" className="mt-8 border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</p></div>
  }

  return (
    <section>
      <Link to="/admin/event-documents" className="inline-flex items-center gap-2 text-sm text-[var(--vj-muted)] transition hover:text-white"><ArrowLeft size={16} /> Back to Event Documents</Link>

      <header className="mb-8 mt-7 border-b border-white/10 pb-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">Event Documents</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{event?.title || "Event"}</h1>
        <p className="mt-2 text-sm text-[var(--vj-muted)]">{formatDate(event?.startDate)}{event?.category ? ` · ${event.category}` : ""}</p>
      </header>

      {error && <p role="alert" className="mb-5 border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">{error}</p>}

      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Documentation</h2>
          <p className="mt-1 text-sm text-[var(--vj-muted)]">{documents.length ? `${documents.length} saved reference${documents.length === 1 ? "" : "s"}` : "No documents added yet."}</p>
        </div>
        <button type="button" onClick={() => setFormState({ qrOnly: false })} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[var(--vj-blue)] px-3.5 py-2.5 text-sm font-semibold text-white hover:opacity-90"><Plus size={16} /> <span className="hidden sm:inline">Add Document</span><span className="sm:hidden">Add</span></button>
      </div>

      {documents.length === 0 && (
        <div className="mb-8 border-y border-white/10 py-7 text-center sm:py-9">
          <ClipboardList size={25} className="mx-auto text-[var(--vj-blue)]" />
          <h3 className="mt-3 font-semibold">No documents added yet.</h3>
          <p className="mt-1 text-sm text-[var(--vj-muted)]">Add your first event document to keep everything organized.</p>
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--vj-muted)]"><FileText size={15} /> Documents</h3>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {DOCUMENT_TYPES.map((type) => {
              const items = regularDocuments.filter((document) => document.type === type.value)
              return (
                <div key={type.value} className="py-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {type.value === "logistics" ? <Package size={17} className="shrink-0 text-[var(--vj-blue)]" /> : <FileText size={17} className="shrink-0 text-[var(--vj-blue)]" />}
                      <div className="min-w-0"><h4 className="text-sm font-semibold">{type.label}</h4><p className="truncate text-xs text-[var(--vj-muted)]">{type.description}</p></div>
                    </div>
                    {!items.length && <span className="shrink-0 text-xs text-[var(--vj-muted)]">Not added</span>}
                  </div>
                  {items.length ? (
                    <div className="space-y-2 pl-7">
                      {items.map((document) => (
                        <article key={document._id} className="flex items-center justify-between gap-2 border border-white/10 bg-[var(--vj-black)] px-3 py-2.5">
                          <div className="min-w-0"><p className="truncate text-sm font-medium">{document.title}</p>{document.description && <p className="mt-0.5 truncate text-xs text-[var(--vj-muted)]">{document.description}</p>}</div>
                          <DocumentActions document={document} onEdit={(item) => setFormState({ document: item, qrOnly: false })} onDelete={setDocumentToDelete} />
                        </article>
                      ))}
                    </div>
                  ) : (
                    <button type="button" onClick={() => setFormState({ qrOnly: false, initialType: type.value })} className="ml-7 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--vj-blue)] hover:underline"><Plus size={14} /> Add</button>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--vj-muted)]"><QrCode size={15} /> QR Codes</h3>
            <button type="button" onClick={() => setFormState({ qrOnly: true })} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--vj-blue)] hover:underline"><Plus size={14} /> Add QR Code</button>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {qrDocuments.length ? qrDocuments.map((document) => (
              <article key={document._id} className="flex items-center justify-between gap-2 py-3.5">
                <div className="min-w-0"><p className="text-[10px] uppercase tracking-[0.12em] text-[var(--vj-blue)]">{formatQrType(document.qrType)} QR</p><p className="mt-1 truncate text-sm font-medium">{document.title}</p>{document.description && <p className="mt-0.5 truncate text-xs text-[var(--vj-muted)]">{document.description}</p>}</div>
                <DocumentActions document={document} onEdit={(item) => setFormState({ document: item, qrOnly: true })} onDelete={setDocumentToDelete} />
              </article>
            )) : (
              <div className="py-6 text-center text-sm text-[var(--vj-muted)]"><QrCode size={21} className="mx-auto mb-2 opacity-60" />No QR codes added yet.</div>
            )}
          </div>
        </div>
      </div>

      {formState && (
        <EventDocumentForm
          key={formState.document?._id || `${formState.qrOnly}-${formState.initialType || "new"}`}
          document={formState.document}
          initialType={formState.initialType}
          qrOnly={formState.qrOnly}
          onClose={() => setFormState(null)}
          onSave={saveDocument}
        />
      )}

      {documentToDelete && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="delete-document-title" className="w-full max-w-md border border-white/10 bg-[var(--vj-dark)] p-6 shadow-2xl">
            <h2 id="delete-document-title" className="text-xl font-semibold">Delete this document?</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--vj-muted)]">This only removes the document reference from VJ ARC Admin. The Google Drive file will not be changed.</p>
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button type="button" disabled={deleting} onClick={() => setDocumentToDelete(null)} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}