import { useState } from "react"

const categories = [
  "hackathons",
  "workshops",
  "coding-events",
  "other-activities",
]

function formatCategory(category) {
  return category
    .split("-")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}

function AdminGalleryPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState("")

  const [eventName, setEventName] = useState("")
  const [category, setCategory] = useState("hackathons")
  const [caption, setCaption] = useState("")

  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))

    setMessage("")
    setError("")
  }

  const handleUpload = async () => {
    // Validation
    if (!selectedFile) {
      setError("Please select an image.")
      return
    }

    if (!eventName.trim()) {
      setError("Please enter the event name.")
      return
    }

    try {
      setUploading(true)
      setError("")
      setMessage("")

      // ==========================================
      // 1. Upload image to Cloudinary
      // ==========================================

      const formData = new FormData()

      formData.append("file", selectedFile)

      formData.append(
        "upload_preset",
        import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
      )

      const cloudName =
        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      )

      if (!cloudinaryResponse.ok) {
        throw new Error("Cloudinary upload failed")
      }

      const cloudinaryData =
        await cloudinaryResponse.json()

      // ==========================================
      // 2. Save image information in MongoDB
      // ==========================================

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/gallery`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            eventName: eventName.trim(),
            imageUrl: cloudinaryData.secure_url,
            category,
            caption: caption.trim(),
          }),
        }
      )

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error("Failed to save gallery image")
      }

      // ==========================================
      // 3. Success
      // ==========================================

      setMessage("Image uploaded successfully!")

      // Clear form
      setSelectedFile(null)
      setPreview("")
      setEventName("")
      setCaption("")

    } catch (error) {
      console.error("Gallery upload error:", error)

      setError(
        error.message || "Unable to upload image."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[var(--vj-black)] px-6 pb-24 pt-32 text-[var(--vj-white)] md:px-10 lg:px-16">

      <section className="mx-auto max-w-4xl">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-12">

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

        <div className="rounded-3xl border border-white/10 bg-[var(--vj-dark)] p-6 md:p-8">

          {/* ====================================
              IMAGE SELECT
          ==================================== */}

          <label className="flex min-h-[300px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/20 bg-[var(--vj-black)] p-6 transition hover:border-[var(--vj-blue)]">

            {preview ? (
              <img
                src={preview}
                alt="Selected preview"
                className="max-h-[350px] w-full rounded-xl object-contain"
              />
            ) : (
              <div className="text-center">

                <p className="text-lg font-medium">
                  Choose an image
                </p>

                <p className="mt-2 text-sm text-[var(--vj-muted)]">
                  JPG, PNG or WEBP
                </p>

              </div>
            )}

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

          </label>


          {/* ====================================
              EVENT NAME
          ==================================== */}

          <label className="mt-8 block text-sm text-[var(--vj-muted)]">
            Event Name
          </label>

          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Example: Rebuild AI"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"
          />


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

            {categories.map((item) => (
              <option key={item} value={item}>
                {formatCategory(item)}
              </option>
            ))}

          </select>


          {/* ====================================
              CAPTION
          ==================================== */}

          <label className="mt-6 block text-sm text-[var(--vj-muted)]">
            Caption
          </label>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Example: Participants during the event"
            className="mt-2 w-full rounded-xl border border-white/10 bg-[var(--vj-black)] px-4 py-3 text-sm text-[var(--vj-white)] outline-none placeholder:text-white/30 focus:border-[var(--vj-blue)]"
          />


          {/* ====================================
              UPLOAD BUTTON
          ==================================== */}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploading}
            className="mt-8 w-full rounded-xl bg-[var(--vj-blue)] px-6 py-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>


          {/* ====================================
              SUCCESS MESSAGE
          ==================================== */}

          {message && (
            <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 p-4">

              <p className="text-sm text-green-400">
                {message}
              </p>

            </div>
          )}


          {/* ====================================
              ERROR MESSAGE
          ==================================== */}

          {error && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">

              <p className="text-sm text-red-400">
                {error}
              </p>

            </div>
          )}

        </div>


        {/* ======================================
            HOW IT WORKS
        ====================================== */}

        <div className="mt-8 rounded-2xl border border-white/10 p-6">

          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--vj-blue)]">
            Upload Structure
          </p>

          <p className="mt-4 text-sm leading-relaxed text-[var(--vj-muted)]">
            Upload multiple photos using the same event name.
            For example, upload five photos with the event name
            <span className="mx-1 text-[var(--vj-white)]">
              Rebuild AI
            </span>
            and they will automatically appear together under
            the Rebuild AI section in the public gallery.
          </p>

        </div>

      </section>

    </main>
  )
}

export default AdminGalleryPage