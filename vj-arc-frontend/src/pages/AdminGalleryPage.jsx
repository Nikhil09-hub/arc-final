import { useEffect, useRef, useState } from "react"
import { Check, ImagePlus, X } from "lucide-react"
import AdminGalleryManagement from "../components/AdminGalleryManagement"
import { getEvents } from "../services/eventService"
import {
  createGalleryImage,
  GALLERY_CATEGORIES,
  uploadGalleryImage,
} from "../services/galleryService"

const MAX_IMAGE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"]

function fingerprint(file) {
  return `${file.name.toLowerCase()}-${file.size}-${file.lastModified}-${file.type}`
}

function formatCategory(category) {
  return category
    .split("-")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}

function AdminGalleryPage() {
  const [selectedFiles, setSelectedFiles] = useState([])
  const queueRef = useRef(selectedFiles)
  const [events, setEvents] = useState([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [eventLoadError, setEventLoadError] = useState("")
  const [eventsAttempt, setEventsAttempt] = useState(0)
  const [selectedEventId, setSelectedEventId] = useState("")
  const [category, setCategory] = useState("hackathons")
  const [caption, setCaption] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    const loadEvents = async () => {
      setEventsLoading(true)
      setEventLoadError("")
      try {
        const result = await getEvents()
        if (active) setEvents(result)
      } catch (loadError) {
        if (active) setEventLoadError(loadError.message || "Unable to load events")
      } finally {
        if (active) setEventsLoading(false)
      }
    }

    loadEvents()
    return () => {
      active = false
    }
  }, [eventsAttempt])

  useEffect(() => {
    queueRef.current = selectedFiles
  }, [selectedFiles])

  useEffect(() => () => {
    queueRef.current.forEach((item) => URL.revokeObjectURL(item.preview))
  }, [])

  const addFiles = (files) => {
    const existing = new Set(selectedFiles.map((item) => item.fingerprint))
    const additions = []
    const rejected = []

    files.forEach((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        rejected.push(`${file.name}: unsupported file type`)
      } else if (file.size > MAX_IMAGE_SIZE) {
        rejected.push(`${file.name}: exceeds 10 MB`)
      } else {
        const key = fingerprint(file)
        if (existing.has(key)) {
          rejected.push(`${file.name}: duplicate skipped`)
        } else {
          existing.add(key)
          additions.push({
            id: key,
            fingerprint: key,
            file,
            preview: URL.createObjectURL(file),
            progress: 0,
            status: "ready",
            uploadedUrl: "",
            uploadData: null,
            error: "",
          })
        }
      }
    })

    if (additions.length) setSelectedFiles((current) => [...current, ...additions])
    setMessage("")
    setError(rejected.join(" · "))
  }

  const handleFileChange = (event) => {
    addFiles(Array.from(event.target.files || []))
    event.target.value = ""
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragOver(false)
    addFiles(Array.from(event.dataTransfer.files || []))
  }

  const removeFile = (id) => {
    const item = selectedFiles.find((selected) => selected.id === id)
    if (item) URL.revokeObjectURL(item.preview)
    setSelectedFiles((current) => current.filter((selected) => selected.id !== id))
  }

  const updateFile = (id, changes) => {
    setSelectedFiles((current) => current.map((item) => item.id === id ? { ...item, ...changes } : item))
  }

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      setError("Please select at least one image.")
      return
    }

    const selectedEvent = events.find((event) => event._id === selectedEventId)
    if (!selectedEvent) {
      setError("Select an event before uploading photos.")
      return
    }

    const pendingFiles = selectedFiles.filter((item) => item.status === "ready" || item.status === "failed")
    if (!pendingFiles.length) {
      setError("There are no photos waiting to upload.")
      return
    }

    setUploading(true)
    setError("")
    setMessage("")
    let uploadedCount = 0
    let failedCount = 0

    try {
      for (const item of pendingFiles) {
        const uploadData = item.uploadData || {
          eventName: selectedEvent.title,
          category,
          caption: caption.trim(),
        }
        updateFile(item.id, { status: "uploading", progress: item.uploadedUrl ? 95 : 0, error: "", uploadData })
        try {
          let imageUrl = item.uploadedUrl
          if (!imageUrl) {
            imageUrl = await uploadGalleryImage(item.file, (progress) => {
              updateFile(item.id, { progress })
            })
            updateFile(item.id, { uploadedUrl: imageUrl, progress: 95 })
          }

          const result = await createGalleryImage({
            ...uploadData,
            imageUrl,
          })

          if (!result?.success) {
            throw new Error("Failed to save image")
          }

          uploadedCount += 1
          updateFile(item.id, { status: "uploaded", progress: 100, error: "" })
        } catch (uploadError) {
          if (uploadError.message.includes("session has expired")) throw uploadError
          failedCount += 1
          updateFile(item.id, { status: "failed", error: uploadError.message || "Failed to upload image" })
        }
      }

      if (uploadedCount > 0) {
        setMessage(`${uploadedCount} photo${uploadedCount === 1 ? "" : "s"} uploaded successfully.`)
        setGalleryRefreshKey((value) => value + 1)
      }

      if (failedCount > 0) {
        setError(`${failedCount} photo${failedCount === 1 ? "" : "s"} failed. Retry failed uploads below.`)
      }
    } catch (error) {
      setError(error.message || "Failed to upload image")
    } finally {
      setUploading(false)
    }
  }

  const uploadedCount = selectedFiles.filter((item) => item.status === "uploaded").length
  const failedCount = selectedFiles.filter((item) => item.status === "failed").length

  return (
    <div className="min-h-screen bg-[var(--vj-black)] px-4 pb-24 pt-8 text-[var(--vj-white)] sm:px-6 md:px-10 lg:px-12">

      <section className="mx-auto max-w-7xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-9 max-w-4xl">

          <p className="font-mono text-sm uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / ADMIN
          </p>

          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Gallery Management
          </h1>

          <p className="mt-4 text-[var(--vj-muted)]">
            Upload photos and organize them by event.
          </p>

        </div>


        {/* ======================================
            UPLOAD CARD
        ====================================== */}

        <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-5 md:p-7">

          {/* ====================================
              IMAGE SELECT
          ==================================== */}

          <label
            onDragEnter={(event) => { event.preventDefault(); setDragOver(true) }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragOver(false) }}
            onDrop={handleDrop}
            className={`flex min-h-36 cursor-pointer items-center justify-center rounded-xl border border-dashed p-6 transition ${dragOver ? "border-[var(--vj-blue)] bg-[var(--vj-blue)]/10" : "border-white/20 bg-[var(--vj-black)] hover:border-[var(--vj-blue)]"}`}
          >

            <div className="text-center">
              <ImagePlus size={24} className="mx-auto text-[var(--vj-blue)]" />
              <p className="mt-3 text-base font-medium">
                {dragOver ? "Drop photos to add them" : "Choose or drop photos"}
              </p>
              <p className="mt-2 text-sm text-[var(--vj-muted)]">
                JPG, PNG or WEBP · up to 10 MB each · duplicates are skipped
              </p>
              {selectedFiles.length > 0 && <p className="mt-2 text-xs text-[var(--vj-blue)]">{selectedFiles.length} photo{selectedFiles.length === 1 ? "" : "s"} in upload queue</p>}
            </div>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={uploading}
              onChange={handleFileChange}
              className="sr-only"
            />

          </label>

          {selectedFiles.length > 0 && (
            <div className="mt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-sm">
                <p className="font-medium">{uploadedCount} / {selectedFiles.length} uploaded <span className="ml-2 text-[var(--vj-muted)]">· {failedCount} failed</span></p>
                {failedCount > 0 && <button type="button" onClick={handleUpload} disabled={uploading} className="text-[var(--vj-blue)] hover:underline disabled:opacity-50">Retry failed uploads</button>}
              </div>
              <ul className="max-h-[26rem] space-y-2 overflow-y-auto">
                {selectedFiles.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 border border-white/10 bg-[var(--vj-black)] p-2.5">
                    <img src={item.preview} alt={`Preview of ${item.file.name}`} className="size-14 shrink-0 object-cover" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="truncate text-xs font-medium">{item.file.name}</p>
                        <span className={`shrink-0 text-[10px] ${item.status === "failed" ? "text-red-300" : item.status === "uploaded" ? "text-green-300" : "text-[var(--vj-muted)]"}`}>
                          {item.status === "uploading" ? `${item.progress}%` : item.status === "uploaded" ? "Uploaded" : item.status === "failed" ? "Failed" : "Ready"}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden bg-white/10">
                        <div className={`h-full transition-[width] duration-150 ${item.status === "failed" ? "bg-red-400" : item.status === "uploaded" ? "bg-green-400" : "bg-[var(--vj-blue)]"}`} style={{ width: `${item.progress}%` }} />
                      </div>
                      {item.error && <p className="mt-1 truncate text-[10px] text-red-300">{item.error}</p>}
                    </div>
                    <button type="button" disabled={uploading} onClick={() => removeFile(item.id)} aria-label={`Remove ${item.file.name} from upload queue`} className="grid size-8 shrink-0 place-items-center text-[var(--vj-muted)] hover:bg-white/5 hover:text-white disabled:opacity-40"><X size={15} /></button>
                  </li>
                ))}
              </ul>
            </div>
          )}


          {/* ====================================
              EVENT NAME
          ==================================== */}

          <label className="mt-8 block text-sm text-[var(--vj-muted)]">
            Event
          </label>

          <select
            value={selectedEventId}
            onChange={(event) => setSelectedEventId(event.target.value)}
            disabled={eventsLoading || uploading || Boolean(eventLoadError)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"
          >
            <option value="">{eventsLoading ? "Loading events..." : "Select an event"}</option>
            {events.map((event) => <option key={event._id} value={event._id}>{event.title}</option>)}
          </select>
          {eventLoadError && <div role="alert" className="mt-2 flex justify-between gap-2 text-xs text-red-300"><span>Unable to load events. {eventLoadError}</span><button type="button" onClick={() => setEventsAttempt((value) => value + 1)} className="shrink-0 underline">Retry</button></div>}


          {/* ====================================
              CATEGORY
          ==================================== */}

          <label className="mt-6 block text-sm text-[var(--vj-muted)]">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none focus:border-[var(--vj-blue)]"
          >

            {GALLERY_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {formatCategory(item)}
              </option>
            ))}

          </select>


          {/* ====================================
              CAPTION
          ==================================== */}

          <label className="mt-6 block text-sm text-[var(--vj-muted)]">
            Caption (optional)
          </label>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Example: Participants during the event"
            disabled={uploading}
            className="mt-2 w-full rounded-xl border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"
          />


          {/* ====================================
              UPLOAD BUTTON
          ==================================== */}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading || eventsLoading || !events.length}
            className="mt-8 w-full rounded-xl bg-[var(--vj-blue)] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "Uploading photos..." : `Upload ${selectedFiles.length || "Photos"}`}
          </button>


          {/* ====================================
              SUCCESS MESSAGE
          ==================================== */}

          {message && <div role="status" className="mt-4 flex items-center gap-2 border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-300"><Check size={16} />{message}</div>}

          {error && <div role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div>}

        </div>


        {/* ======================================
            HOW IT WORKS
        ====================================== */}

        <div className="mx-auto mt-8 max-w-4xl rounded-2xl border border-white/10 p-6">

          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--vj-blue)]">
            Upload Structure
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[var(--vj-muted)]">
            Select an event once, then upload one or more photos to group them in the public gallery.
          </p>

        </div>

        <AdminGalleryManagement events={events} refreshKey={galleryRefreshKey} />

      </section>

    </div>
  )
}

export default AdminGalleryPage