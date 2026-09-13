import { useEffect, useRef, useState } from "react"

const categories = [
  "all",
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


/* =========================================================
   AUTO SCROLLING EVENT CAROUSEL
========================================================= */

function EventCarousel({ eventImages, eventName, onImageClick }) {
  const scrollRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const container = scrollRef.current

    if (!container || eventImages.length <= 1) {
      return
    }

    let animationFrame
    let lastTime = 0

    const speed = 35 // pixels per second

    const scroll = (time) => {
      if (!lastTime) {
        lastTime = time
      }

      const delta = time - lastTime
      lastTime = time

      if (!isHovered) {
        container.scrollLeft += (speed * delta) / 1000

        /*
          Since the images are duplicated, once we reach
          the first copy's end, jump back to the beginning.
        */
        const halfWidth = container.scrollWidth / 2

        if (container.scrollLeft >= halfWidth) {
          container.scrollLeft = 0
        }
      }

      animationFrame = requestAnimationFrame(scroll)
    }

    animationFrame = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [isHovered, eventImages.length])


  /*
    Duplicate the images so the carousel can loop continuously.
  */
  const carouselImages =
    eventImages.length > 1
      ? [...eventImages, ...eventImages]
      : eventImages


  return (
    <div
      ref={scrollRef}
      className="overflow-x-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >

      <div className="flex w-max gap-4">

        {carouselImages.map((image, index) => (
          <button
            key={`${image._id}-${index}`}
            type="button"
            onClick={() => onImageClick(image)}
            className="group relative w-[280px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[var(--vj-dark)] text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--vj-blue)]/50 md:w-[340px] lg:w-[380px]"
          >

            {/* Image */}
            <div className="aspect-[4/3] overflow-hidden bg-[var(--vj-dark)]">

              <img
                src={image.imageUrl}
                alt={
                  image.caption ||
                  `${eventName} photo`
                }
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />

            </div>


            {/* Hover overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />


            {/* Caption */}
            {image.caption && (
              <div className="p-4">
                <p className="text-sm leading-relaxed text-[var(--vj-white)]">
                  {image.caption}
                </p>
              </div>
            )}

          </button>
        ))}

      </div>

    </div>
  )
}


/* =========================================================
   GALLERY PAGE
========================================================= */

function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)


  /* =======================================================
     FETCH GALLERY
  ======================================================= */

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true)

        const url =
          selectedCategory === "all"
            ? `${import.meta.env.VITE_API_URL}/api/gallery`
            : `${import.meta.env.VITE_API_URL}/api/gallery?category=${selectedCategory}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error("Failed to fetch gallery")
        }

        const result = await response.json()

        if (result.success) {
          setImages(result.data)
        } else {
          setImages([])
        }

      } catch (error) {
        console.error("Error fetching gallery:", error)
        setImages([])

      } finally {
        setLoading(false)
      }
    }

    fetchGallery()
  }, [selectedCategory])


  /* =======================================================
     GROUP IMAGES BY EVENT
  ======================================================= */

  const groupedImages = images.reduce((groups, image) => {
    const eventName = image.eventName?.trim()

    if (!eventName) {
      return groups
    }

    if (!groups[eventName]) {
      groups[eventName] = []
    }

    groups[eventName].push(image)

    return groups
  }, {})

  const eventGroups = Object.entries(groupedImages)


  /* =======================================================
     ESC TO CLOSE FULLSCREEN
  ======================================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])


  return (
    <main className="min-h-screen bg-[var(--vj-black)] px-4 pb-10 pt-5 text-[var(--vj-white)] sm:px-6 md:px-8 lg:px-10">

      <section className="mx-auto max-w-7xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-6 max-w-3xl">

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / GALLERY
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
            Gallery
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--vj-muted)]">
            Explore moments from VJ ARC events, workshops,
            hackathons and other activities.
          </p>

        </div>


        {/* =================================================
            CATEGORY FILTERS
        ================================================= */}

        <div className="mb-8 flex flex-wrap gap-2">

          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setSelectedCategory(item)}
              className={`rounded-full border px-4 py-2 text-xs transition ${
                selectedCategory === item
                  ? "border-[var(--vj-blue)] bg-[var(--vj-blue)] text-white"
                  : "border-white/10 text-[var(--vj-muted)] hover:border-[var(--vj-blue)] hover:text-[var(--vj-white)]"
              }`}
            >
              {formatCategory(item)}
            </button>
          ))}

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="py-20 text-center">

            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--vj-blue)]">
              Loading
            </p>

            <p className="mt-2 text-sm text-[var(--vj-muted)]">
              Loading gallery moments...
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!loading && eventGroups.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-[var(--vj-dark)] px-6 py-20 text-center">

            <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--vj-blue)]">
              Gallery
            </p>

            <h2 className="mt-3 text-2xl font-semibold">
              No images yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--vj-muted)]">
              Photos from VJ ARC events will appear here.
            </p>

          </div>
        )}


        {/* =================================================
            EVENT GALLERIES
        ================================================= */}

        {!loading && eventGroups.length > 0 && (

          <div className="space-y-12">

            {eventGroups.map(([eventName, eventImages]) => (

              <section key={eventName}>

                {/* Event Heading */}
                <div className="mb-4 flex items-end justify-between gap-6">

                  <div>

                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
                      VJ ARC / EVENT GALLERY
                    </p>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
                      {eventName}
                    </h2>

                  </div>

                  <p className="hidden text-xs text-[var(--vj-muted)] sm:block">
                    {eventImages.length}{" "}
                    {eventImages.length === 1
                      ? "photo"
                      : "photos"}
                  </p>

                </div>


                {/* =================================================
                    AUTO-SCROLLING PHOTOS
                ================================================= */}

                <EventCarousel
                  eventImages={eventImages}
                  eventName={eventName}
                  onImageClick={setSelectedImage}
                />

              </section>

            ))}

          </div>

        )}

      </section>


      {/* =====================================================
          FULLSCREEN IMAGE VIEWER
      ===================================================== */}

      {selectedImage && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-8"
          onClick={() => setSelectedImage(null)}
        >

          {/* Close Button */}
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[var(--vj-dark)] text-2xl text-white transition hover:border-[var(--vj-blue)]"
            aria-label="Close image"
          >
            ×
          </button>


          {/* Fullscreen Image */}
          <img
            src={selectedImage.imageUrl}
            alt={
              selectedImage.caption ||
              "VJ ARC gallery image"
            }
            className="max-h-[90vh] max-w-[95vw] rounded-xl object-contain"
            onClick={(event) => event.stopPropagation()}
          />


          {/* Caption */}
          {selectedImage.caption && (
            <div
              className="absolute bottom-5 left-1/2 max-w-xl -translate-x-1/2 rounded-xl border border-white/10 bg-[var(--vj-dark)] px-5 py-3 text-center"
              onClick={(event) => event.stopPropagation()}
            >
              <p className="text-sm text-[var(--vj-white)]">
                {selectedImage.caption}
              </p>
            </div>
          )}

        </div>

      )}

    </main>
  )
}

export default GalleryPage