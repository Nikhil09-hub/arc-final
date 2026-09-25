import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ImagePlus, X } from "lucide-react"

const categories = [
  ["workshop", "Workshop"],
  ["hackathon", "Hackathon"],
  ["ai-ml", "AI / ML"],
  ["coding", "Coding"],
  ["other", "Other"],
]

const fieldClass = "mt-2 w-full rounded-lg border border-white/10 bg-[var(--vj-black)] px-3.5 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)] disabled:opacity-50"

function toLocalDateTime(value) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

function createInitialValues(event) {
  return {
    title: event?.title || "",
    slug: event?.slug || "",
    category: event?.category || "workshop",
    shortDescription: event?.shortDescription || "",
    description: event?.description || "",
    startDate: toLocalDateTime(event?.startDate),
    endDate: toLocalDateTime(event?.endDate),
    venue: event?.venue || "",
    coverImage: event?.coverImage || "",
    registrationEnabled: Boolean(event?.registration?.enabled),
    registrationLink: event?.registration?.link || "",
    linkedin: event?.social?.linkedin || "",
    instagram: event?.social?.instagram || "",
    reportAvailable: Boolean(event?.report?.available),
    reportUrl: event?.report?.url || "",
  }
}

function makeSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function EventForm({ event, mode, saving, error, onSubmit }) {
  const [values, setValues] = useState(() => createInitialValues(event))
  const [slugTouched, setSlugTouched] = useState(false)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(event?.coverImage || "")
  const [imageError, setImageError] = useState("")
  const [formError, setFormError] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)

  useEffect(() => {
    return () => {
      if (coverPreview.startsWith("blob:")) URL.revokeObjectURL(coverPreview)
    }
  }, [coverPreview])

  const update = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }))
  }

  const handleCoverChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setImageError("Choose a JPG, PNG, or WEBP image.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError("Cover images must be 10 MB or smaller.")
      return
    }

    setImageError("")
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (submitEvent) => {
    submitEvent.preventDefault()
    setFormError("")

    if (!values.coverImage && !coverFile) {
      setFormError("A cover image is required.")
      return
    }

    if (new Date(values.endDate) < new Date(values.startDate)) {
      setFormError("End date must be on or after the start date.")
      return
    }

    let coverImage = values.coverImage

    if (coverFile) {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      if (!cloudName || !uploadPreset) {
        setFormError("Cloudinary is not configured for image uploads.")
        return
      }

      setUploadingImage(true)
      try {
        const formData = new FormData()
        formData.append("file", coverFile)
        formData.append("upload_preset", uploadPreset)
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        })
        const result = await response.json().catch(() => null)
        if (!response.ok || !result?.secure_url) {
          throw new Error(result?.error?.message || "Cover image upload failed")
        }
        coverImage = result.secure_url
      } catch (uploadError) {
        setFormError(uploadError.message || "Cover image upload failed")
        setUploadingImage(false)
        return
      }
      setUploadingImage(false)
    }

    await onSubmit({
      title: values.title.trim(),
      slug: makeSlug(values.slug),
      category: values.category,
      shortDescription: values.shortDescription.trim(),
      description: values.description.trim(),
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
      venue: values.venue.trim(),
      coverImage,
      registration: {
        enabled: values.registrationEnabled,
        link: values.registrationLink.trim(),
      },
      social: {
        linkedin: values.linkedin.trim(),
        instagram: values.instagram.trim(),
      },
      report: {
        available: values.reportAvailable,
        url: values.reportUrl.trim(),
      },
    })
  }

  const input = (label, field, type = "text", required = false, props = {}) => (
    <label className="block text-sm text-[var(--vj-muted)]">
      {label}
      <input
        type={type}
        value={values[field]}
        onChange={(event) => {
          const value = event.target.value
          update(field, field === "slug" ? makeSlug(value) : value)
          if (field === "slug") setSlugTouched(true)
          if (field === "title" && mode === "create" && !slugTouched) update("slug", makeSlug(value))
        }}
        required={required}
        className={fieldClass}
        {...props}
      />
    </label>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <section className="space-y-4">
        <h2 className="border-b border-white/10 pb-3 text-base font-semibold">Event details</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {input("Title", "title", "text", true, { maxLength: 120 })}
          {input("Slug", "slug", "text", true, { maxLength: 140, pattern: "[a-z0-9]+(-[a-z0-9]+)*" })}
          <label className="block text-sm text-[var(--vj-muted)]">
            Category
            <select value={values.category} onChange={(event) => update("category", event.target.value)} className={fieldClass}>
              {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          {input("Venue", "venue", "text", true)}
          {input("Start date and time", "startDate", "datetime-local", true)}
          {input("End date and time", "endDate", "datetime-local", true)}
        </div>
        <label className="block text-sm text-[var(--vj-muted)]">
          Short description
          <textarea value={values.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} required rows={2} maxLength={240} className={fieldClass} />
        </label>
        <label className="block text-sm text-[var(--vj-muted)]">
          Description
          <textarea value={values.description} onChange={(event) => update("description", event.target.value)} required rows={6} className={fieldClass} />
        </label>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="border-b border-white/10 pb-3 text-base font-semibold">Cover image</h2>
          <p className="mt-2 text-xs text-[var(--vj-muted)]">JPG, PNG, or WEBP, up to 10 MB.</p>
        </div>
        {coverPreview ? (
          <div className="relative max-w-xl overflow-hidden border border-white/10 bg-[var(--vj-black)]">
            <img src={coverPreview} alt="Event cover preview" className="aspect-[16/8] w-full object-cover" />
            <button type="button" onClick={() => { setCoverFile(null); setCoverPreview(""); setImageError("") }} aria-label="Remove cover image" className="absolute right-3 top-3 grid size-9 place-items-center bg-black/75 text-white hover:bg-red-500"><X size={17} /></button>
          </div>
        ) : (
          <label className="flex min-h-32 max-w-xl cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-[var(--vj-black)] px-5 py-8 text-sm text-[var(--vj-muted)] hover:border-[var(--vj-blue)]">
            <ImagePlus size={22} className="text-[var(--vj-blue)]" />
            Select cover image
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverChange} className="sr-only" />
          </label>
        )}
        {imageError && <p role="alert" className="text-sm text-red-300">{imageError}</p>}
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-white/10 pb-3 text-base font-semibold">Registration and links</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={values.registrationEnabled} onChange={(event) => update("registrationEnabled", event.target.checked)} className="size-4 accent-[var(--vj-blue)]" />
          Registration enabled
        </label>
        {input("Registration link", "registrationLink", "url", values.registrationEnabled, { disabled: !values.registrationEnabled, placeholder: "https://" })}
        <div className="grid gap-4 md:grid-cols-2">
          {input("LinkedIn", "linkedin", "url", false, { placeholder: "https://" })}
          {input("Instagram", "instagram", "url", false, { placeholder: "https://" })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="border-b border-white/10 pb-3 text-base font-semibold">Event report</h2>
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={values.reportAvailable} onChange={(event) => update("reportAvailable", event.target.checked)} className="size-4 accent-[var(--vj-blue)]" />
          Report available
        </label>
        {input("Report URL", "reportUrl", "url", values.reportAvailable, { disabled: !values.reportAvailable, placeholder: "https://" })}
      </section>

      {(formError || error) && <p role="alert" className="border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">{formError || error}</p>}

      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
        <Link to="/admin/events" className="rounded-lg border border-white/15 px-5 py-3 text-center text-sm font-medium hover:bg-white/5">Cancel</Link>
        <button type="submit" disabled={saving || uploadingImage} className="rounded-lg bg-[var(--vj-blue)] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:cursor-wait disabled:opacity-50">
          {uploadingImage ? "Uploading cover..." : saving ? "Saving..." : mode === "edit" ? "Save Changes" : "Create Event"}
        </button>
      </div>
    </form>
  )
}

export default EventForm