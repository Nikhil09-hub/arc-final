import { useEffect, useMemo, useState } from "react"
import {
  Check,
  Edit3,
  Image as ImageIcon,
  Search,
  Trash2,
  X,
} from "lucide-react"
import {
  deleteGalleryImages,
  GALLERY_CATEGORIES,
  getGalleryPhotos,
  OTHER_GALLERY_EVENT_NAME,
  OTHER_GALLERY_OPTION,
  updateGalleryImage,
} from "../services/galleryService"

const fieldClass = "w-full rounded-lg border border-white/10 bg-[var(--vj-black)] px-3 py-2.5 text-sm text-[var(--vj-white)] outline-none focus:border-[var(--vj-blue)]"

function formatCategory(category = "") {
  return category.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
}

function formatDate(value) {
  if (!value) return "Date unavailable"
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function AdminGalleryManagement({ events, refreshKey }) {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [attempt, setAttempt] = useState(0)
  const [search, setSearch] = useState("")
  const [eventFilter, setEventFilter] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedIds, setSelectedIds] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [editing, setEditing] = useState(false)
  const [editEventName, setEditEventName] = useState("")
  const [editSectionTitle, setEditSectionTitle] = useState("")
  const [editCategory, setEditCategory] = useState(GALLERY_CATEGORIES[0])
  const [editCaption, setEditCaption] = useState("")
  const [savingEdit, setSavingEdit] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState([])
  const [deleting, setDeleting] = useState(false)
  const [notice, setNotice] = useState("")
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    let active = true

    const loadImages = async () => {
      setLoading(true)
      setLoadError("")
      try {
        const result = await getGalleryPhotos()
        if (active) {
          setImages(result)
          setSelectedIds((current) => current.filter((id) => result.some((image) => image._id === id)))
        }
      } catch (error) {
        if (active) setLoadError(error.message || "Unable to load gallery.")
      } finally {
        if (active) setLoading(false)
      }
    }

    loadImages()
    return () => {
      active = false
    }
  }, [refreshKey, attempt])

  const eventOptions = useMemo(() => [...new Set([
    OTHER_GALLERY_EVENT_NAME,
    ...events.map((event) => event.title),
    ...images.map((image) => image.eventName),
  ].filter(Boolean))].sort((a, b) => a.localeCompare(b)), [events, images])

  const visibleImages = useMemo(() => {
    const query = search.trim().toLowerCase()
    return [...images]
      .filter((image) => !eventFilter || image.eventName === eventFilter)
      .filter((image) => !categoryFilter || image.category === categoryFilter)
      .filter((image) => !query || [image.eventName, image.category, image.caption].some((value) => value?.toLowerCase().includes(query)))
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return sortOrder === "newest" ? dateB - dateA : dateA - dateB
      })
  }, [images, search, eventFilter, categoryFilter, sortOrder])

  const openImage = (image) => {
    setSelectedImage(image)
    setEditing(false)
    const isKnownEvent = events.some((event) => event.title === image.eventName)
    setEditEventName(isKnownEvent ? image.eventName : OTHER_GALLERY_OPTION)
    setEditSectionTitle(isKnownEvent ? "" : image.eventName || "")
    setEditCategory(image.category || GALLERY_CATEGORIES[0])
    setEditCaption(image.caption || "")
    setActionError("")
  }

  const toggleSelected = (id) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((selectedId) => selectedId !== id)
      : [...current, id])
  }

  const toggleVisibleSelection = () => {
    const visibleIds = visibleImages.map((image) => image._id)
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id))
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !visibleIds.includes(id))
      : [...new Set([...current, ...visibleIds])])
  }

  const saveImage = async (event) => {
    event.preventDefault()
    const eventName = editEventName === OTHER_GALLERY_OPTION
      ? editSectionTitle.trim()
      : editEventName
    if (!selectedImage || !eventName) {
      setActionError("Enter a title for this gallery section.")
      return
    }
    setSavingEdit(true)
    setActionError("")
    try {
      const result = await updateGalleryImage(selectedImage._id, {
        eventName,
        category: editCategory,
        caption: editCaption.trim(),
      })
      setImages((current) => current.map((image) => image._id === result.data._id ? result.data : image))
      setSelectedImage(null)
      setEditing(false)
      setNotice("Gallery image updated.")
    } catch (error) {
      setActionError(error.message || "Failed to save changes")
    } finally {
      setSavingEdit(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    setActionError("")
    try {
      const result = await deleteGalleryImages(pendingDeleteIds)
      if (result.deletedIds.length) {
        const deleted = new Set(result.deletedIds)
        setImages((current) => current.filter((image) => !deleted.has(image._id)))
        setSelectedIds((current) => current.filter((id) => !deleted.has(id)))
        if (selectedImage && deleted.has(selectedImage._id)) setSelectedImage(null)
        setNotice(result.deletedIds.length === 1 ? "Gallery image deleted." : `${result.deletedIds.length} gallery images deleted.`)
      }
      setPendingDeleteIds([])
      if (result.failedIds.length) {
        setActionError(`${result.failedIds.length} image${result.failedIds.length === 1 ? "" : "s"} could not be deleted. Retry the remaining selection.`)
      }
    } catch (error) {
      setActionError(error.message || "Failed to delete image")
    } finally {
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!selectedImage && !pendingDeleteIds.length) return undefined
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        if (pendingDeleteIds.length) setPendingDeleteIds([])
        else setSelectedImage(null)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [selectedImage, pendingDeleteIds])

  const allVisibleSelected = visibleImages.length > 0 && visibleImages.every((image) => selectedIds.includes(image._id))

  return (
    <section className="mt-14" aria-labelledby="gallery-management-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--vj-blue)]">Library</p>
          <h2 id="gallery-management-title" className="mt-1 text-2xl font-semibold">Manage photos</h2>
        </div>
        <p className="text-sm text-[var(--vj-muted)]">{images.length} total photo{images.length === 1 ? "" : "s"}</p>
      </div>

      {notice && <div role="status" className="mb-4 flex items-center justify-between border border-green-400/20 bg-green-400/5 px-4 py-3 text-sm text-green-200"><span>{notice}</span><button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={16} /></button></div>}
      {actionError && <div role="alert" className="mb-4 flex items-center justify-between border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200"><span>{actionError}</span><button type="button" aria-label="Dismiss error" onClick={() => setActionError("")}><X size={16} /></button></div>}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <label className="relative sm:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--vj-muted)]" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search photos..." className={`${fieldClass} pl-9`} />
        </label>
        <select aria-label="Filter by event" value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className={fieldClass}>
          <option value="">All Events</option>
          {eventOptions.map((name) => <option key={name} value={name}>{name}</option>)}
        </select>
        <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={fieldClass}>
          <option value="">All Categories</option>
          {GALLERY_CATEGORIES.map((category) => <option key={category} value={category}>{formatCategory(category)}</option>)}
        </select>
        <select aria-label="Sort photos" value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} className={fieldClass}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-y border-white/10 py-3">
          <div className="flex items-center gap-4 text-sm">
            <span>{selectedIds.length} selected</span>
            <button type="button" onClick={toggleVisibleSelection} className="text-[var(--vj-blue)] hover:underline">{allVisibleSelected ? "Deselect visible" : "Select visible"}</button>
          </div>
          <button type="button" onClick={() => setPendingDeleteIds(selectedIds)} className="inline-flex items-center gap-2 rounded-lg bg-red-500/15 px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/25"><Trash2 size={16} /> Delete Selected</button>
        </div>
      )}

      {loading ? (
        <p className="py-14 text-center text-sm text-[var(--vj-muted)]">Loading gallery...</p>
      ) : loadError ? (
        <div role="alert" className="my-8 border border-red-400/20 bg-red-400/5 p-5 text-center">
          <p className="text-sm text-red-200">Unable to load gallery. {loadError}</p>
          <button type="button" onClick={() => setAttempt((value) => value + 1)} className="mt-3 text-sm font-semibold text-[var(--vj-blue)] hover:underline">Retry</button>
        </div>
      ) : images.length === 0 ? (
        <div className="my-8 border-y border-white/10 py-16 text-center">
          <ImageIcon size={28} className="mx-auto text-[var(--vj-blue)]" />
          <h3 className="mt-4 text-lg font-semibold">No gallery photos yet.</h3>
          <p className="mt-1 text-sm text-[var(--vj-muted)]">Uploaded images will appear here.</p>
        </div>
      ) : visibleImages.length === 0 ? (
        <p className="py-14 text-center text-sm text-[var(--vj-muted)]">No photos match these filters.</p>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleImages.map((image) => (
            <article key={image._id} className="group relative min-w-0 border border-white/10 bg-[var(--vj-dark)]">
              <label className="absolute left-2 top-2 z-10 grid size-8 cursor-pointer place-items-center bg-black/70" onClick={(event) => event.stopPropagation()}>
                <input type="checkbox" aria-label={`Select ${image.caption || image.eventName} photo`} checked={selectedIds.includes(image._id)} onChange={() => toggleSelected(image._id)} className="size-4 accent-[var(--vj-blue)]" />
              </label>
              <button type="button" onClick={() => openImage(image)} className="block w-full text-left focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--vj-blue)]">
                <img src={image.imageUrl} alt={image.caption || `${image.eventName} photo`} loading="lazy" className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-85" />
                <div className="p-3.5">
                  <p className="truncate text-sm font-semibold">{image.eventName}</p>
                  <p className="mt-1 truncate text-xs text-[var(--vj-blue)]">{formatCategory(image.category)}</p>
                  <p className="mt-2 min-h-8 line-clamp-2 text-xs text-[var(--vj-muted)]">{image.caption || "No caption"}</p>
                  <p className="mt-2 text-[10px] text-[var(--vj-muted)]">{formatDate(image.createdAt)}</p>
                </div>
              </button>
            </article>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/85 p-4 sm:p-8" role="presentation">
          <button type="button" aria-label="Close image preview" onClick={() => setSelectedImage(null)} className="absolute inset-0 cursor-default" />
          <section role="dialog" aria-modal="true" aria-label="Gallery image details" className="relative z-10 my-auto grid max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-white/10 bg-[var(--vj-dark)] lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <div className="relative flex min-h-56 items-center justify-center bg-black p-3 sm:p-5">
              <img src={selectedImage.imageUrl} alt={selectedImage.caption || `${selectedImage.eventName} photo`} className="max-h-[70vh] max-w-full object-contain" />
              <button type="button" aria-label="Close image preview" onClick={() => setSelectedImage(null)} className="absolute right-3 top-3 grid size-9 place-items-center bg-black/80 text-white hover:bg-white/15"><X size={18} /></button>
            </div>
            <div className="p-5 sm:p-6">
              {editing ? (
                <form onSubmit={saveImage} className="space-y-4">
                  <h3 className="text-lg font-semibold">Edit image details</h3>
                  <label className="block text-xs text-[var(--vj-muted)]">Event
                    <select value={editEventName} onChange={(event) => setEditEventName(event.target.value)} required className={`${fieldClass} mt-2`}>
                      <option value={OTHER_GALLERY_OPTION}>Other / not linked to an event</option>
                      {events.map((event) => <option key={event._id} value={event.title}>{event.title}</option>)}
                    </select>
                  </label>
                  {editEventName === OTHER_GALLERY_OPTION && (
                    <label className="block text-xs text-[var(--vj-muted)]">Gallery section title
                      <input value={editSectionTitle} onChange={(event) => setEditSectionTitle(event.target.value)} maxLength={100} required placeholder="Example: Club Activities" className={`${fieldClass} mt-2`} />
                    </label>
                  )}
                  <label className="block text-xs text-[var(--vj-muted)]">Category
                    <select value={editCategory} onChange={(event) => setEditCategory(event.target.value)} required className={`${fieldClass} mt-2`}>
                      {GALLERY_CATEGORIES.map((category) => <option key={category} value={category}>{formatCategory(category)}</option>)}
                    </select>
                  </label>
                  <label className="block text-xs text-[var(--vj-muted)]">Caption (optional)
                    <textarea value={editCaption} onChange={(event) => setEditCaption(event.target.value)} rows={4} maxLength={500} className={`${fieldClass} mt-2 resize-y`} />
                  </label>
                  {actionError && <p role="alert" className="text-sm text-red-200">{actionError}</p>}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setEditing(false)} className="flex-1 rounded-lg border border-white/15 px-3 py-2.5 text-sm hover:bg-white/5">Cancel</button>
                    <button type="submit" disabled={savingEdit} className="flex-1 rounded-lg bg-[var(--vj-blue)] px-3 py-2.5 text-sm font-semibold disabled:opacity-50">{savingEdit ? "Saving..." : "Save Changes"}</button>
                  </div>
                </form>
              ) : (
                <>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--vj-blue)]">Gallery image</p>
                  <h3 className="mt-3 break-words text-xl font-semibold">{selectedImage.eventName}</h3>
                  <p className="mt-2 text-sm text-[var(--vj-blue)]">{formatCategory(selectedImage.category)}</p>
                  <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--vj-muted)]">{selectedImage.caption || "No caption"}</p>
                  {actionError && <p role="alert" className="mt-4 text-sm text-red-200">{actionError}</p>}
                  <p className="mt-5 border-t border-white/10 pt-4 text-xs text-[var(--vj-muted)]">Uploaded {formatDate(selectedImage.createdAt)}</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => { setEditing(true); setActionError("") }} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2.5 text-sm hover:bg-white/5"><Edit3 size={15} /> Edit</button>
                    <button type="button" onClick={() => setPendingDeleteIds([selectedImage._id])} className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-400/20 px-3 py-2.5 text-sm text-red-200 hover:bg-red-400/10"><Trash2 size={15} /> Delete</button>
                    <button type="button" onClick={() => setSelectedImage(null)} className="col-span-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm hover:bg-white/15"><Check className="mr-2 inline" size={15} /> Close</button>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      )}

      {pendingDeleteIds.length > 0 && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-5" role="presentation">
          <section role="dialog" aria-modal="true" aria-labelledby="gallery-delete-title" className="w-full max-w-md border border-white/10 bg-[var(--vj-dark)] p-6 shadow-2xl">
            <h3 id="gallery-delete-title" className="text-lg font-semibold">Delete {pendingDeleteIds.length} gallery image{pendingDeleteIds.length === 1 ? "" : "s"}?</h3>
            <p className="mt-2 text-sm text-[var(--vj-muted)]">This removes the selected records from the gallery. Cloudinary files are retained.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" disabled={deleting} onClick={() => setPendingDeleteIds([])} className="rounded-lg border border-white/15 px-4 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="button" disabled={deleting} onClick={confirmDelete} className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50">{deleting ? "Deleting..." : "Delete"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  )
}

export default AdminGalleryManagement