import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
  FileText,
} from "lucide-react"

import { getEventBySlug } from "../services/eventService"


/* =========================================
   DATE FORMAT
========================================= */

function formatDate(date) {
  if (!date) return "Date TBA"

  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}


/* =========================================
   COUNTDOWN CALCULATOR
========================================= */

function getCountdown(milliseconds) {
  if (milliseconds <= 0) {
    return {
      days: "00",
      hours: "00",
      minutes: "00",
      seconds: "00",
    }
  }

  const totalSeconds = Math.floor(milliseconds / 1000)

  const days = Math.floor(totalSeconds / 86400)

  const hours = Math.floor(
    (totalSeconds % 86400) / 3600
  )

  const minutes = Math.floor(
    (totalSeconds % 3600) / 60
  )

  const seconds = totalSeconds % 60

  return {
    days: String(days).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
  }
}


/* =========================================
   COMPACT EVENT COUNTDOWN
========================================= */

function EventCountdown({ startDate }) {
  const calculateTime = () =>
    new Date(startDate).getTime() - Date.now()

  const [timeLeft, setTimeLeft] =
    useState(calculateTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTime())
    }, 1000)

    return () => clearInterval(timer)
  }, [startDate])

  const countdown = getCountdown(timeLeft)

  if (timeLeft <= 0) {
    return (
      <div className="mt-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[var(--vj-blue)] shadow-[0_0_12px_var(--vj-blue)]" />

        <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
          Event Started
        </span>
      </div>
    )
  }

  const items = [
    {
      key: "days",
      label: "Days",
    },
    {
      key: "hours",
      label: "Hours",
    },
    {
      key: "minutes",
      label: "Min",
    },
    {
      key: "seconds",
      label: "Sec",
    },
  ]

  return (
    <div className="mt-5">

      {/* Countdown heading */}

      <div className="mb-2.5 flex items-center gap-2">
        <Clock3
          size={13}
          className="text-[var(--vj-blue)]"
        />

        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
          Event Starts In
        </p>
      </div>


      {/* Countdown boxes */}

      <div className="grid max-w-xl grid-cols-4 gap-1.5 sm:gap-2">
        {items.map((item) => (
          <div
            key={item.key}
            className="rounded-lg border border-white/10 bg-[var(--vj-dark)] px-2 py-2.5 text-center sm:px-3 sm:py-3"
          >
            <p className="font-mono text-xl font-medium leading-none tracking-[-0.05em] text-[var(--vj-white)] sm:text-2xl md:text-3xl">
              {countdown[item.key]}
            </p>

            <p className="mt-1 font-mono text-[7px] uppercase tracking-[0.15em] text-[var(--vj-muted)]">
              {item.label}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}


/* =========================================
   EVENT DETAILS PAGE
========================================= */

function EventDetails() {
  const { slug } = useParams()

  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedImage, setSelectedImage] =
    useState(null)


  /* =======================================
     ALWAYS START EVENT PAGE AT TOP
  ======================================= */

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])


  /* =======================================
     FETCH EVENT
  ======================================= */

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        setError("")

        const data = await getEventBySlug(slug)

        setEvent(data)
      } catch (err) {
        console.error(
          "Error fetching event:",
          err
        )

        setError(
          "Unable to load this event."
        )
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])


  /* =======================================
     ESCAPE KEY FOR IMAGE LIGHTBOX
  ======================================= */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedImage(null)
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    )

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      )
    }
  }, [])


  /* =======================================
     LOADING
  ======================================= */

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-10 text-[var(--vj-white)] sm:px-6">
        <div className="section-container py-16 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / EVENT
          </p>

          <p className="mt-3 text-sm text-[var(--vj-muted)]">
            Loading event...
          </p>
        </div>
      </main>
    )
  }


  /* =======================================
     ERROR / EVENT NOT FOUND
  ======================================= */

  if (error || !event) {
    return (
      <main className="min-h-screen bg-[var(--vj-black)] px-5 py-10 text-[var(--vj-white)] sm:px-6">
        <div className="section-container py-16 text-center">

          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
            VJ ARC / EVENT
          </p>

          <h1 className="mt-4 text-3xl font-bold">
            Event Not Found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm text-[var(--vj-muted)]">
            We couldn't find the event you're looking for.
          </p>

          <Link
            to="/events"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 px-5 py-2.5 text-sm transition hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)]"
          >
            <ArrowLeft size={15} />
            Back to Events
          </Link>

        </div>
      </main>
    )
  }


  /* =======================================
     GALLERY
  ======================================= */

  const gallery = Array.isArray(event.gallery)
    ? [...event.gallery].sort(
        (a, b) =>
          (a.order ?? 0) -
          (b.order ?? 0)
      )
    : []

  const status = event.status || ""


  /* =======================================
     PAGE
  ======================================= */

  return (
    <main className="min-h-screen bg-[var(--vj-black)] text-[var(--vj-white)]">


      {/* =====================================================
          COMPACT HERO
      ===================================================== */}

      <section className="relative overflow-hidden border-b border-white/10">

        {/* Background grid */}

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />


        {/* Ambient glow */}

        <div className="pointer-events-none absolute -left-48 top-1/4 h-[450px] w-[450px] rounded-full bg-[var(--vj-blue)]/10 blur-[140px]" />

        <div className="pointer-events-none absolute -right-40 -top-20 h-[500px] w-[500px] rounded-full bg-[var(--vj-blue)]/[0.06] blur-[150px]" />


        {/* =================================================
            HERO CONTAINER
        ================================================= */}

        <div className="section-container relative z-10 px-5 pb-7 pt-5 sm:px-6 md:px-0 md:pb-8 md:pt-6">


          {/* =======================================
              TOP NAV
          ======================================= */}

          <div className="flex items-center justify-between border-b border-white/10 pb-3">

            <Link
              to="/events"
              className="group inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)] transition hover:text-[var(--vj-white)]"
            >
              <ArrowLeft
                size={14}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />

              Back to Events
            </Link>


            <span className="hidden font-mono text-[8px] uppercase tracking-[0.3em] text-[var(--vj-muted)] sm:block">
              VJ ARC / EVENT
            </span>

          </div>


          {/* =======================================
              MAIN HERO
          ======================================= */}

<div className="grid items-start gap-6 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:pt-7">

            {/* =====================================
                LEFT — EVENT CONTENT
            ===================================== */}

            <div className="min-w-0">

              {/* Category + status */}

              <div className="flex flex-wrap items-center gap-2">

                {event.category && (
                  <span className="rounded-full border border-[var(--vj-blue)]/40 bg-[var(--vj-blue)]/10 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--vj-blue)]">
                    {event.category}
                  </span>
                )}

                {status && (
                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-[var(--vj-muted)]">
                    {status}
                  </span>
                )}

              </div>


              {/* =================================
                  TITLE
              ================================= */}

              <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-[0.98] tracking-[-0.035em] sm:text-4xl md:text-5xl lg:text-[4rem] xl:text-[4.25rem]">
  {event.title}
</h1>


              {/* =================================
                  SHORT DESCRIPTION
              ================================= */}

              {event.shortDescription && (
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--vj-muted)] sm:text-base sm:leading-7">
                  {event.shortDescription}
                </p>
              )}


              {/* =================================
                  DATE + VENUE
              ================================= */}

              <div className="mt-4 grid max-w-2xl grid-cols-1 gap-2.5 sm:grid-cols-2">

                {/* DATE */}

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--vj-dark)] px-3.5 py-3">

                  <CalendarDays
                    size={16}
                    className="shrink-0 text-[var(--vj-blue)]"
                  />

                  <div className="min-w-0">

                    <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
                      Date
                    </p>

                    <p className="mt-0.5 truncate text-xs font-medium sm:text-sm">
                      {formatDate(event.startDate)}
                    </p>

                  </div>

                </div>


                {/* VENUE */}

                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[var(--vj-dark)] px-3.5 py-3">

                  <MapPin
                    size={16}
                    className="shrink-0 text-[var(--vj-blue)]"
                  />

                  <div className="min-w-0">

                    <p className="font-mono text-[7px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
                      Venue
                    </p>

                    <p className="mt-0.5 truncate text-xs font-medium sm:text-sm">
                      {event.venue || "Venue TBA"}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================
                  COUNTDOWN
              ================================= */}

              {event.startDate && (
                <EventCountdown
                  startDate={event.startDate}
                />
              )}


              {/* =================================
                  REGISTER BUTTON
              ================================= */}

              {event.registration?.enabled &&
                event.registration?.link && (
                  <div className="mt-4">

                    <a
                      href={event.registration.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2.5 rounded-full bg-[var(--vj-blue)] px-6 py-3 text-sm font-semibold text-white shadow-[0_0_28px_rgba(37,99,255,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_40px_rgba(37,99,255,0.4)]"
                    >
                      Register Now

                      <ArrowUpRight size={16} />
                    </a>

                  </div>
                )}


            </div>


            {/* =====================================
                RIGHT — COVER IMAGE
            ===================================== */}

            <div className="relative lg:pt-0">

              {event.coverImage ? (

                <div className="group relative mx-auto max-w-[520px] overflow-hidden rounded-2xl border border-white/10 bg-[var(--vj-dark)] shadow-2xl lg:ml-auto">

                  {/* Image glow */}

                  <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-[var(--vj-blue)]/10 blur-3xl transition duration-700 group-hover:bg-[var(--vj-blue)]/20" />


                  {/* Image */}

                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                  />


                  {/* Overlay */}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/[0.04]" />


                  {/* VJ ARC label */}

                  <div className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                    VJ ARC
                  </div>


                  {/* Corner decoration */}

                  <div className="absolute right-4 top-4 h-8 w-8 rounded-tr-lg border-r border-t border-[var(--vj-blue)]/60" />

                  <div className="absolute bottom-4 right-4 h-8 w-8 rounded-br-lg border-b border-r border-[var(--vj-blue)]/60" />

                </div>

              ) : (

                <div className="mx-auto flex aspect-[4/3] max-w-[520px] items-center justify-center rounded-2xl border border-white/10 bg-[var(--vj-dark)]">

                  <div className="text-center">

                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
                      VJ ARC
                    </p>

                    <p className="mt-1 font-mono text-[8px] uppercase tracking-[0.25em] text-[var(--vj-muted)]">
                      Event
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </section>



      {/* =====================================================
          EVENT INFORMATION
      ===================================================== */}

      <section
        id="event-content"
        className="section-container px-5 py-10 sm:px-6 md:px-0"
      >

        <div className="grid gap-3 md:grid-cols-3">


          {/* DATE */}

          <div className="group rounded-xl border border-white/10 bg-[var(--vj-dark)] p-4 transition duration-300 hover:border-[var(--vj-blue)]/40">

            <CalendarDays
              size={19}
              className="text-[var(--vj-blue)]"
            />

            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
              Date
            </p>

            <p className="mt-1 text-sm font-medium">
              {formatDate(event.startDate)}
            </p>

            {event.endDate &&
              new Date(event.endDate).getTime() !==
                new Date(event.startDate).getTime() && (
                <p className="mt-0.5 text-xs text-[var(--vj-muted)]">
                  to {formatDate(event.endDate)}
                </p>
              )}

          </div>


          {/* VENUE */}

          <div className="group rounded-xl border border-white/10 bg-[var(--vj-dark)] p-4 transition duration-300 hover:border-[var(--vj-blue)]/40">

            <MapPin
              size={19}
              className="text-[var(--vj-blue)]"
            />

            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
              Venue
            </p>

            <p className="mt-1 text-sm font-medium">
              {event.venue || "Venue TBA"}
            </p>

          </div>


          {/* REGISTRATION */}

          <div className="group rounded-xl border border-white/10 bg-[var(--vj-dark)] p-4 transition duration-300 hover:border-[var(--vj-blue)]/40">

            <ArrowUpRight
              size={19}
              className="text-[var(--vj-blue)]"
            />

            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
              Registration
            </p>

            {event.registration?.enabled &&
            event.registration?.link ? (

              <a
                href={event.registration.link}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--vj-blue)] transition hover:opacity-80"
              >
                Register Now

                <ArrowUpRight size={14} />
              </a>

            ) : (

              <p className="mt-1 text-sm text-[var(--vj-muted)]">
                Registration unavailable
              </p>

            )}

          </div>

        </div>

      </section>



      {/* =====================================================
          DESCRIPTION
      ===================================================== */}

      {event.description && (
        <section className="section-container px-5 pb-12 sm:px-6 md:px-0">

          <div className="max-w-4xl">

            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
              About the Event
            </p>

            <div className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--vj-muted)] md:text-base md:leading-8">
              {event.description}
            </div>

          </div>

        </section>
      )}



      {/* =====================================================
          GALLERY
      ===================================================== */}

      {gallery.length > 0 && (
        <section className="border-t border-white/10 py-12">

          <div className="section-container px-5 sm:px-6 md:px-0">

            {/* Gallery heading */}

            <div className="flex items-end justify-between gap-4">

              <div>

                <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[var(--vj-blue)]">
                  VJ ARC / EVENT GALLERY
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                  Event Moments
                </h2>

              </div>


              <p className="hidden text-xs text-[var(--vj-muted)] sm:block">
                {gallery.length}{" "}
                {gallery.length === 1
                  ? "photo"
                  : "photos"}
              </p>

            </div>


            {/* Gallery grid */}

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">

              {gallery.map((image, index) => (

                <button
                  key={
                    image._id ||
                    image.url ||
                    index
                  }
                  type="button"
                  onClick={() =>
                    setSelectedImage(image)
                  }
                  className="group overflow-hidden rounded-xl border border-white/10 bg-[var(--vj-dark)] text-left transition duration-300 hover:-translate-y-1 hover:border-[var(--vj-blue)]/40"
                >

                  <div className="aspect-[4/3] overflow-hidden">

                    <img
                      src={image.url}
                      alt={
                        image.caption ||
                        `${event.title} photo ${index + 1}`
                      }
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                  </div>


                  {image.caption && (
                    <div className="p-3">

                      <p className="text-xs leading-relaxed text-[var(--vj-white)]">
                        {image.caption}
                      </p>

                    </div>
                  )}

                </button>

              ))}

            </div>

          </div>

        </section>
      )}



      {/* =====================================================
          SOCIAL / REPORT / REGISTER
      ===================================================== */}

      <section className="border-t border-white/10 py-10">

        <div className="section-container px-5 sm:px-6 md:px-0">

          <div className="flex flex-wrap gap-2.5">


            {/* LINKEDIN */}

            {event.social?.linkedin && (
              <a
                href={event.social.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs transition duration-300 hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)]"
              >
                LinkedIn
              </a>
            )}


            {/* INSTAGRAM */}

            {event.social?.instagram && (
              <a
                href={event.social.instagram}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs transition duration-300 hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)]"
              >
                Instagram
              </a>
            )}


            {/* EVENT REPORT */}

            {event.report?.available &&
              event.report?.url && (
                <a
                  href={event.report.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-xs transition duration-300 hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)]"
                >

                  <FileText size={14} />

                  Event Report

                  <ArrowUpRight size={14} />

                </a>
              )}


            {/* REGISTER */}

            {event.registration?.enabled &&
              event.registration?.link && (
                <a
                  href={event.registration.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--vj-blue)] px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(37,99,255,0.2)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(37,99,255,0.35)]"
                >

                  Register Now

                  <ArrowUpRight size={14} />

                </a>
              )}

          </div>

        </div>

      </section>



      {/* =====================================================
          IMAGE LIGHTBOX
      ===================================================== */}

      {selectedImage && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6"
          onClick={() =>
            setSelectedImage(null)
          }
        >

          {/* Close button */}

          <button
            type="button"
            onClick={() =>
              setSelectedImage(null)
            }
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[var(--vj-dark)] text-xl text-white transition hover:border-[var(--vj-blue)] hover:text-[var(--vj-blue)] sm:right-6 sm:top-6"
            aria-label="Close image"
          >
            ×
          </button>


          {/* Image */}

          <img
            src={selectedImage.url}
            alt={
              selectedImage.caption ||
              event.title
            }
            className="max-h-[90vh] max-w-full rounded-xl object-contain"
            onClick={(e) =>
              e.stopPropagation()
            }
          />


          {/* Caption */}

          {selectedImage.caption && (
            <div className="absolute bottom-4 left-1/2 max-w-xl -translate-x-1/2 rounded-lg border border-white/10 bg-[var(--vj-dark)] px-4 py-2.5 text-center sm:bottom-6">

              <p className="text-xs text-[var(--vj-white)]">
                {selectedImage.caption}
              </p>

            </div>
          )}

        </div>

      )}

    </main>
  )
}


export default EventDetails