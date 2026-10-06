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
    visibility: event?.visibility || "public",
    registrationType:
      event?.registration?.type ||
      (event?.registration?.link
        ? "external"
        : event?.registration?.enabled
          ? "internal"
          : "none"),
    registrationLink: event?.registration?.link || "",
    registrationFormat: event?.registration?.format || "individual",
    registrationPaymentEnabled: Boolean(event?.registration?.payment?.enabled),
    registrationPaymentAmount: event?.registration?.payment?.amount ?? 0,
    registrationPaymentCurrency: event?.registration?.payment?.currency || "INR",
    registrationPaymentFeeType:
      event?.registration?.payment?.feeType || "per_participant",
    registrationStartDate: toLocalDateTime(event?.registration?.startDate),
    registrationEndDate: toLocalDateTime(event?.registration?.endDate),
    minimumMembers: event?.registration?.team?.minimumMembers ?? 2,
    maximumMembers: event?.registration?.team?.maximumMembers ?? 4,
    teamNameEnabled: event?.registration?.team?.teamNameEnabled ?? true,
    teamNameRequired: event?.registration?.team?.teamNameRequired ?? true,
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

    if (values.registrationType === "internal") {
      const registrationStart = new Date(values.registrationStartDate)
      const registrationEnd = new Date(values.registrationEndDate)
      if (
        !values.registrationStartDate ||
        !values.registrationEndDate ||
        Number.isNaN(registrationStart.getTime()) ||
        Number.isNaN(registrationEnd.getTime()) ||
        registrationEnd <= registrationStart
      ) {
        setFormError("Registration end date and time must be after the start date and time.")
        return
      }
      if (
        values.registrationPaymentEnabled &&
        (!Number.isFinite(Number(values.registrationPaymentAmount)) || Number(values.registrationPaymentAmount) <= 0)
      ) {
        setFormError("Paid registration amount must be greater than zero.")
        return
      }
      if (
        values.registrationFormat === "team" &&
        (!Number.isInteger(Number(values.minimumMembers)) ||
          !Number.isInteger(Number(values.maximumMembers)) ||
          Number(values.minimumMembers) < 2 ||
          Number(values.maximumMembers) < Number(values.minimumMembers))
      ) {
        setFormError("Maximum team size must be at least the minimum team size, and teams must allow at least two members.")
        return
      }
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
      visibility: values.visibility,
      registration: {
        enabled: values.registrationType !== "none",
        type: values.registrationType,
        format:
          values.registrationType === "internal"
            ? values.registrationFormat
            : "individual",
        link: values.registrationType === "external" ? values.registrationLink.trim() : "",
        startDate:
          values.registrationType === "internal"
            ? new Date(values.registrationStartDate).toISOString()
            : null,
        endDate:
          values.registrationType === "internal"
            ? new Date(values.registrationEndDate).toISOString()
            : null,
        payment:
          values.registrationType === "internal"
            ? {
                enabled: Boolean(values.registrationPaymentEnabled),
                amount: Number(values.registrationPaymentEnabled) ? Number(values.registrationPaymentAmount) : 0,
                currency: "INR",
                feeType:
                  values.registrationFormat === "team"
                    ? values.registrationPaymentFeeType === "per_team"
                      ? "per_team"
                      : "per_participant"
                    : "per_participant",
              }
            : {
                enabled: false,
                amount: 0,
                currency: "INR",
                feeType: "per_participant",
              },
        team: {
          minimumMembers: Number(values.minimumMembers),
          maximumMembers: Number(values.maximumMembers),
          teamNameEnabled: values.teamNameEnabled,
          teamNameRequired: values.teamNameRequired,
        },
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
        <h2 className="border-b border-white/10 pb-3 text-base font-semibold">EVENT VISIBILITY</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["public", "Public Event"],
            ["admin", "Admin Only"],
          ].map(([value, label]) => (
            <label key={value} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm">
              <input
                type="radio"
                name="visibility"
                value={value}
                checked={values.visibility === value}
                onChange={() => update("visibility", value)}
                className="size-4 accent-[var(--vj-blue)]"
              />
              {label}
            </label>
          ))}
        </div>
        {values.visibility === "admin" && (
          <p className="text-xs leading-relaxed text-[var(--vj-muted)]">
            Admin-only events are hidden from the public website and are intended for internal testing or administration.
          </p>
        )}
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
        <label className="block text-sm text-[var(--vj-muted)]">
          Registration method
          <select
            value={values.registrationType}
            onChange={(event) => update("registrationType", event.target.value)}
            className={fieldClass}
          >
            <option value="none">No Registration</option>
            <option value="external">External Registration</option>
            <option value="internal">VJ ARC Website</option>
          </select>
        </label>
        {values.registrationType === "external" &&
          input("External registration URL", "registrationLink", "url", true, { placeholder: "https://" })}
        {values.registrationType === "internal" && (
          <>
            <label className="block text-sm text-[var(--vj-muted)]">
              Registration format
              <select
                value={values.registrationFormat}
                onChange={(event) => update("registrationFormat", event.target.value)}
                className={fieldClass}
              >
                <option value="individual">Individual</option>
                <option value="team">Team</option>
              </select>
            </label>
            <div className="grid gap-4 md:grid-cols-2">
              {input("Registration opens", "registrationStartDate", "datetime-local", true)}
              {input("Registration closes", "registrationEndDate", "datetime-local", true)}
            </div>

            <div className="space-y-4 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4 sm:p-5">
              <h3 className="text-sm font-semibold">PAYMENT</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  [false, "Free"],
                  [true, "Paid"],
                ].map(([isPaid, label]) => (
                  <label key={label} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm">
                    <input
                      type="radio"
                      name="registrationPaymentEnabled"
                      checked={values.registrationPaymentEnabled === isPaid}
                      onChange={() => update("registrationPaymentEnabled", isPaid)}
                      className="size-4 accent-[var(--vj-blue)]"
                    />
                    {label}
                  </label>
                ))}
              </div>

              {values.registrationPaymentEnabled ? (
                <div className="space-y-4 pt-2">
                  <label className="block text-sm text-[var(--vj-muted)]">
                    Registration Fee
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-base font-semibold text-[var(--vj-white)]">₹</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={values.registrationPaymentAmount}
                        onChange={(event) => update("registrationPaymentAmount", Number(event.target.value) || 0)}
                        className={fieldClass}
                        placeholder="50"
                      />
                    </div>
                  </label>

                  <fieldset className="space-y-2">
                    <legend className="text-sm text-[var(--vj-muted)]">Fee Applies To</legend>
                    {values.registrationFormat === "individual" ? (
                      <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm">
                        <input
                          type="radio"
                          name="registrationPaymentFeeType"
                          checked={values.registrationPaymentFeeType === "per_participant"}
                          onChange={() => update("registrationPaymentFeeType", "per_participant")}
                          className="size-4 accent-[var(--vj-blue)]"
                        />
                        Per Participant
                      </label>
                    ) : (
                      [
                        ["per_participant", "Per Participant"],
                        ["per_team", "Per Team"],
                      ].map(([feeType, label]) => (
                        <label key={feeType} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm">
                          <input
                            type="radio"
                            name="registrationPaymentFeeType"
                            checked={values.registrationPaymentFeeType === feeType}
                            onChange={() => update("registrationPaymentFeeType", feeType)}
                            className="size-4 accent-[var(--vj-blue)]"
                          />
                          {label}
                        </label>
                      ))
                    )}
                  </fieldset>
                </div>
              ) : null}
            </div>

            {values.registrationFormat === "team" && (
              <div className="space-y-4 rounded-xl border border-white/10 bg-[var(--vj-black)] p-4 sm:p-5">
                <h3 className="text-sm font-semibold">Team registration</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {input("Minimum members (including leader)", "minimumMembers", "number", true, { min: 2, step: 1 })}
                  {input("Maximum members (including leader)", "maximumMembers", "number", true, { min: 2, step: 1 })}
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={values.teamNameEnabled}
                    onChange={(event) => update("teamNameEnabled", event.target.checked)}
                    className="size-4 accent-[var(--vj-blue)]"
                  />
                  Enable team name
                </label>
                {values.teamNameEnabled && (
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={values.teamNameRequired}
                      onChange={(event) => update("teamNameRequired", event.target.checked)}
                      className="size-4 accent-[var(--vj-blue)]"
                    />
                    Require a team name
                  </label>
                )}
                <p className="text-xs leading-relaxed text-[var(--vj-muted)]">
                  Team leaders provide their name, roll number, email, and phone. Each other member provides their name, roll number, and email.
                </p>
              </div>
            )}
          </>
        )}
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