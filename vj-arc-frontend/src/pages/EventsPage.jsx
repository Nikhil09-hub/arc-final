import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "motion/react"
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react"


/* =========================================================
   HELPERS
========================================================= */

const getStatus = (event) => {
  const now = new Date()

  const start = new Date(event.startDate)

  const end = event.endDate
    ? new Date(event.endDate)
    : start

  if (Number.isNaN(start.getTime())) {
    return "past"
  }

  if (now < start) {
    return "upcoming"
  }

  if (now >= start && now <= end) {
    return "ongoing"
  }

  return "past"
}


const formatDate = (date) => {
  if (!date) return "Date TBA"

  const value = new Date(date)

  if (Number.isNaN(value.getTime())) {
    return "Date TBA"
  }

  return value.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}


const formatDateRange = (event) => {
  if (!event.startDate) {
    return "Date TBA"
  }

  const start = formatDate(event.startDate)

  if (!event.endDate) {
    return start
  }

  const end = formatDate(event.endDate)

  if (start === end) {
    return start
  }

  return `${start} — ${end}`
}


const getTimeDifference = (targetDate) => {
  if (!targetDate) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const target = new Date(targetDate).getTime()
  const now = Date.now()

  let difference = Math.max(0, target - now)

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  )

  difference -= days * 1000 * 60 * 60 * 24

  const hours = Math.floor(
    difference / (1000 * 60 * 60)
  )

  difference -= hours * 1000 * 60 * 60

  const minutes = Math.floor(
    difference / (1000 * 60)
  )

  difference -= minutes * 1000 * 60

  const seconds = Math.floor(
    difference / 1000
  )

  return {
    days,
    hours,
    minutes,
    seconds,
  }
}


const pad = (value) =>
  String(value).padStart(2, "0")


/* =========================================================
   STATUS
========================================================= */

const statusText = {
  upcoming: "UPCOMING",
  ongoing: "ONGOING",
  past: "COMPLETED",
}


const statusClasses = {
  upcoming:
    "border-white/15 bg-black/60 text-white",

  ongoing:
    "border-green-400/30 bg-green-400/10 text-green-300",

  past:
    "border-white/10 bg-black/60 text-white/50",
}


/* =========================================================
   EVENT IMAGE
========================================================= */

const EventImage = ({
  event,
  className = "",
}) => {
  if (!event.coverImage) {
    return (
      <div
        className={`
          flex
          items-center
          justify-center
          bg-gradient-to-br
          from-blue-950/50
          via-black
          to-black
          ${className}
        `}
      >
        <div className="text-center">
          <p className="font-mono text-xs tracking-[0.3em] text-blue-400/50">
            VJ ARC
          </p>

          <p className="mt-1 font-mono text-[9px] tracking-[0.2em] text-white/20">
            EVENT
          </p>
        </div>
      </div>
    )
  }

  return (
    <img
      src={event.coverImage}
      alt={event.title || "VJ ARC Event"}
      className={className}
    />
  )
}


/* =========================================================
   COUNTDOWN
========================================================= */

const Countdown = ({
  event,
  large = false,
}) => {
  const status = getStatus(event)

  const target =
    status === "upcoming"
      ? event.startDate
      : status === "ongoing"
        ? event.endDate
        : null

  const [time, setTime] = useState(
    getTimeDifference(target)
  )

  useEffect(() => {
    if (!target) {
      setTime({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      })

      return
    }

    const update = () => {
      setTime(getTimeDifference(target))
    }

    update()

    const interval = setInterval(
      update,
      1000
    )

    return () => clearInterval(interval)
  }, [target])

  const label =
    status === "upcoming"
      ? "EVENT STARTS IN"
      : status === "ongoing"
        ? "EVENT ENDS IN"
        : "EVENT COMPLETED"

  return (
    <div className={large ? "mt-5" : "mt-4"}>

      <div className="mb-2 flex items-center gap-2">

        <Clock3
          className={
            large
              ? "h-3.5 w-3.5 text-blue-400"
              : "h-3 w-3 text-blue-400"
          }
        />

        <span className="font-mono text-[9px] tracking-[0.25em] text-white/45">
          {label}
        </span>

      </div>


      <div
        className={
          large
            ? "grid grid-cols-4 gap-2"
            : "grid grid-cols-4 gap-1.5"
        }
      >

        <TimeBox
          value={time.days}
          label="DAYS"
          large={large}
        />

        <TimeBox
          value={time.hours}
          label="HOURS"
          large={large}
        />

        <TimeBox
          value={time.minutes}
          label="MIN"
          large={large}
        />

        <TimeBox
          value={time.seconds}
          label="SEC"
          large={large}
        />

      </div>

    </div>
  )
}


const TimeBox = ({
  value,
  label,
  large,
}) => {
  return (
    <div
      className={`
        flex
        flex-col
        items-center
        justify-center
        rounded-lg
        border
        border-white/10
        bg-black/30
        ${
          large
            ? "h-[62px] sm:h-[68px]"
            : "h-[54px]"
        }
      `}
    >

      <span
        className={`
          font-mono
          font-medium
          text-white
          ${
            large
              ? "text-lg sm:text-xl"
              : "text-base"
          }
        `}
      >
        {pad(value)}
      </span>

      <span className="mt-0.5 font-mono text-[7px] tracking-[0.15em] text-white/40">
        {label}
      </span>

    </div>
  )
}


/* =========================================================
   FEATURED CARD
   ANIMATED
========================================================= */

const FeaturedCard = ({
  event,
  onClick,
}) => {
  const status = getStatus(event)

  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -3,
      }}
      className="
        group
        relative
        w-full
        shrink-0
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-black/60
      "
    >

      {/* TOP RIGHT CORNER */}

      <motion.div
        className="pointer-events-none absolute right-3 top-3 z-20 h-8 w-8 border-r border-t border-blue-500/80"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      <div className="grid min-h-[350px] md:grid-cols-[38%_62%] lg:min-h-[390px]">


        {/* =================================================
            POSTER
        ================================================= */}

        <div className="relative min-h-[250px] overflow-hidden bg-black">

          <EventImage
            event={event}
            className="
              h-full
              w-full
              object-cover
              transition-transform
              duration-700
              group-hover:scale-[1.03]
            "
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />


          {/* STATUS */}

          <motion.div
            initial={{
              opacity: 0,
              x: -10,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.15,
            }}
            className="absolute left-3 top-3 z-10"
          >

            <span
              className={`
                rounded-full
                border
                px-3
                py-1.5
                font-mono
                text-[9px]
                tracking-[0.18em]
                backdrop-blur-md
                ${statusClasses[status]}
              `}
            >
              {statusText[status]}
            </span>

          </motion.div>

        </div>


        {/* =================================================
            DETAILS
        ================================================= */}

        <div className="flex flex-col justify-center p-5 sm:p-7 md:p-8 lg:p-10">


          {/* TITLE + DESCRIPTION */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
          >

            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-3xl">
              {event.title || "VJ ARC Event"}
            </h2>

            <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45 sm:text-sm">
              {event.shortDescription ||
                event.description ||
                "Discover this VJ ARC event."}
            </p>

          </motion.div>


          {/* DATE + VENUE */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.18,
            }}
            className="mt-6 grid gap-4 sm:grid-cols-2"
          >

            {/* DATE */}

            <div className="flex gap-3">

              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

              <div>

                <p className="font-mono text-[8px] tracking-[0.25em] text-white/35">
                  DATE
                </p>

                <p className="mt-1 text-xs text-white/75">
                  {formatDateRange(event)}
                </p>

              </div>

            </div>


            {/* VENUE */}

            <div className="flex gap-3">

              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

              <div>

                <p className="font-mono text-[8px] tracking-[0.25em] text-white/35">
                  VENUE
                </p>

                <p className="mt-1 text-xs text-white/75">
                  {event.venue || "Venue TBA"}
                </p>

              </div>

            </div>

          </motion.div>


          {/* COUNTDOWN */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.25,
            }}
          >

            <Countdown
              event={event}
              large
            />

          </motion.div>


          {/* VIEW DETAILS BUTTON */}

          <motion.button
            type="button"
            onClick={() => onClick(event)}
            whileHover={{
              scale: 1.015,
              y: -2,
            }}
            whileTap={{
              scale: 0.97,
            }}
            transition={{
              duration: 0.2,
            }}
            className="
              mt-4
              flex
              h-10
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-blue-600
              font-mono
              text-[10px]
              tracking-[0.15em]
              text-white
              transition-all
              hover:bg-blue-500
              hover:shadow-[0_0_25px_rgba(37,99,235,0.25)]
            "
          >

            VIEW DETAILS

            <motion.span
              whileHover={{
                x: 3,
                y: -3,
              }}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
            </motion.span>

          </motion.button>

        </div>

      </div>

    </motion.div>
  )
}


/* =========================================================
   FEATURED CAROUSEL
   HORIZONTAL AUTO SCROLL
   PAUSES ON HOVER
========================================================= */

const FeaturedCarousel = ({
  events,
  onEventClick,
}) => {

  const [activeIndex, setActiveIndex] =
    useState(0)

  const [paused, setPaused] =
    useState(false)

  const timerRef = useRef(null)


  /* =======================================================
     NEXT SLIDE
  ======================================================= */

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === events.length - 1
        ? 0
        : current + 1
    )
  }


  /* =======================================================
     PREVIOUS SLIDE
  ======================================================= */

  const previousSlide = () => {
    setActiveIndex((current) =>
      current === 0
        ? events.length - 1
        : current - 1
    )
  }


  /* =======================================================
     AUTO HORIZONTAL SCROLL
  ======================================================= */

  useEffect(() => {

    if (
      events.length <= 1 ||
      paused
    ) {
      return
    }

    timerRef.current = setInterval(
      nextSlide,
      5000
    )

    return () => {
      clearInterval(timerRef.current)
    }

  }, [
    events.length,
    paused,
  ])


  if (!events.length) {
    return null
  }


  return (
    <section className="px-4 pb-8 sm:px-6 md:px-8 lg:px-12">

      <div className="mx-auto max-w-[1600px]">

        <div
          onMouseEnter={() =>
            setPaused(true)
          }
          onMouseLeave={() =>
            setPaused(false)
          }
          className="relative"
        >


          {/* =================================================
              HORIZONTAL SLIDING AREA
          ================================================= */}

          <div className="overflow-hidden rounded-xl">

            <motion.div
              animate={{
                x: `-${activeIndex * 100}%`,
              }}
              transition={{
                duration: 0.8,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="flex"
            >

              {events.map((event) => (

                <div
                  key={event._id}
                  className="w-full shrink-0 px-0.5"
                >

                  <FeaturedCard
                    event={event}
                    onClick={onEventClick}
                  />

                </div>

              ))}

            </motion.div>

          </div>


          {/* =================================================
              PREVIOUS BUTTON
          ================================================= */}

          {events.length > 1 && (

            <motion.button
              type="button"
              onClick={previousSlide}
              aria-label="Previous event"

              whileHover={{
                scale: 1.08,
                x: -2,
              }}

              whileTap={{
                scale: 0.92,
              }}

              transition={{
                duration: 0.2,
              }}

              className="
                absolute
                left-[-14px]
                top-1/2
                z-30
                hidden
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/80
                text-white/60
                backdrop-blur-md
                transition-all
                hover:border-blue-500/40
                hover:text-blue-400
                md:flex
              "
            >

              <ArrowLeft className="h-4 w-4" />

            </motion.button>

          )}


          {/* =================================================
              NEXT BUTTON
          ================================================= */}

          {events.length > 1 && (

            <motion.button
              type="button"
              onClick={nextSlide}
              aria-label="Next event"

              whileHover={{
                scale: 1.08,
                x: 2,
              }}

              whileTap={{
                scale: 0.92,
              }}

              transition={{
                duration: 0.2,
              }}

              className="
                absolute
                right-[-14px]
                top-1/2
                z-30
                hidden
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/10
                bg-black/80
                text-white/60
                backdrop-blur-md
                transition-all
                hover:border-blue-500/40
                hover:text-blue-400
                md:flex
              "
            >

              <ArrowRight className="h-4 w-4" />

            </motion.button>

          )}


          {/* =================================================
              CAROUSEL DOTS
          ================================================= */}

          {events.length > 1 && (

            <div className="mt-4 flex items-center justify-center gap-2">

              {events.map((event, index) => (

                <motion.button
                  key={event._id}
                  type="button"

                  onClick={() =>
                    setActiveIndex(index)
                  }

                  whileHover={{
                    scale: 1.2,
                  }}

                  whileTap={{
                    scale: 0.85,
                  }}

                  aria-label={`Go to event ${index + 1}`}

                  className={`
                    h-1
                    rounded-full
                    transition-all
                    duration-300
                    ${
                      index === activeIndex
                        ? "w-7 bg-blue-500"
                        : "w-4 bg-white/15 hover:bg-white/30"
                    }
                  `}
                />

              ))}

            </div>

          )}

        </div>

      </div>

    </section>
  )
}


/* =========================================================
   NORMAL VERTICAL EVENT CARD
   ANIMATED
========================================================= */

const EventCard = ({
  event,
  onClick,
}) => {

  const status = getStatus(event)

  return (

    <motion.article

      initial={{
        opacity: 0,
        y: 18,
      }}

      whileInView={{
        opacity: 1,
        y: 0,
      }}

      viewport={{
        once: true,
        amount: 0.15,
      }}

      whileHover={{
        y: -4,
      }}

      transition={{
        duration: 0.45,
        ease: [0.22, 1, 0.36, 1],
      }}

      className="
        group
        relative
        overflow-hidden
        rounded-xl
        border
        border-white/10
        bg-black/50
        transition-colors
        hover:border-blue-500/30
      "
    >


      {/* =================================================
          BLUE CORNER
      ================================================= */}

      <motion.div
        className="pointer-events-none absolute right-3 top-3 z-20 h-7 w-7 border-r border-t border-blue-500/70"
        animate={{
          opacity: [0.5, 0.9, 0.5],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />


      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative aspect-[16/10] overflow-hidden bg-black">

        <EventImage
          event={event}
          className="
            h-full
            w-full
            object-cover
            transition-transform
            duration-500
            group-hover:scale-105
          "
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />


        {/* STATUS */}

        <motion.div
          initial={{
            opacity: 0,
            x: -8,
          }}
          whileInView={{
            opacity: 1,
            x: 0,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.35,
          }}
          className="absolute left-3 top-3"
        >

          <span
            className={`
              rounded-full
              border
              px-2.5
              py-1
              font-mono
              text-[8px]
              tracking-[0.18em]
              backdrop-blur-md
              ${statusClasses[status]}
            `}
          >
            {statusText[status]}
          </span>

        </motion.div>

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-4 sm:p-5">


        {/* TITLE */}

        <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-white">
          {event.title || "VJ ARC Event"}
        </h3>


        {/* DESCRIPTION */}

        <p className="mt-2 line-clamp-2 min-h-[40px] text-xs leading-5 text-white/40">
          {event.shortDescription ||
            event.description ||
            "Discover this VJ ARC event."}
        </p>


        {/* DATE */}

        <div className="mt-4 flex items-start gap-2.5">

          <CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />

          <div>

            <p className="font-mono text-[8px] tracking-[0.22em] text-white/30">
              DATE
            </p>

            <p className="mt-1 text-[11px] leading-4 text-white/65">
              {formatDateRange(event)}
            </p>

          </div>

        </div>


        {/* VENUE */}

        <div className="mt-3 flex items-start gap-2.5">

          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />

          <div>

            <p className="font-mono text-[8px] tracking-[0.22em] text-white/30">
              VENUE
            </p>

            <p className="mt-1 line-clamp-1 text-[11px] leading-4 text-white/65">
              {event.venue || "Venue TBA"}
            </p>

          </div>

        </div>


        {/* COUNTDOWN */}

        <Countdown event={event} />


        {/* VIEW DETAILS BUTTON */}

        <motion.button
          type="button"
          onClick={() => onClick(event)}

          whileHover={{
            scale: 1.02,
            y: -1,
          }}

          whileTap={{
            scale: 0.96,
          }}

          transition={{
            duration: 0.18,
          }}

          className="
            mt-4
            flex
            h-9
            w-full
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-blue-600
            font-mono
            text-[9px]
            tracking-[0.15em]
            text-white
            transition-all
            hover:bg-blue-500
            hover:shadow-[0_0_20px_rgba(37,99,235,0.22)]
          "
        >

          VIEW DETAILS

          <motion.span
            whileHover={{
              x: 3,
              y: -3,
            }}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
          </motion.span>

        </motion.button>

      </div>

    </motion.article>
  )
}


/* =========================================================
   EVENT SECTION
========================================================= */

const EventSection = ({
  label,
  title,
  description,
  events,
  onEventClick,
}) => {

  return (

    <section className="border-t border-white/10 px-4 py-8 sm:px-6 md:px-8 lg:px-12">

      <div className="mx-auto max-w-[1600px]">


        {/* =================================================
            HEADING
        ================================================= */}

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="font-mono text-[9px] tracking-[0.3em] text-blue-400">
              {label}
            </p>

            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {title}
            </h2>

            <p className="mt-1 text-xs text-white/35">
              {description}
            </p>

          </div>


          <span className="hidden font-mono text-[9px] tracking-[0.15em] text-white/25 sm:block">

            {events.length
              .toString()
              .padStart(2, "0")}{" "}

            EVENTS

          </span>

        </div>


        {/* =================================================
            VERTICAL CARD GRID
        ================================================= */}

        {events.length > 0 ? (

          <div
            className="
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
              lg:grid-cols-3
              xl:grid-cols-4
            "
          >

            {events.map((event) => (

              <EventCard
                key={event._id}
                event={event}
                onClick={onEventClick}
              />

            ))}

          </div>

        ) : (

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="rounded-xl border border-white/10 bg-white/[0.015] px-5 py-8 text-center"
          >

            <p className="font-mono text-[9px] tracking-[0.2em] text-white/25">
              NO EVENTS
            </p>

          </motion.div>

        )}

      </div>

    </section>
  )
}


/* =========================================================
   MAIN EVENTS PAGE
========================================================= */

export default function EventsPage() {

  const [events, setEvents] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState("")

  const [activeTab, setActiveTab] =
    useState("upcoming")


  /* =======================================================
     FETCH
  ======================================================= */

  useEffect(() => {

    const controller =
      new AbortController()

    const fetchEvents = async () => {

      try {

        setLoading(true)
        setError("")

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events`,
          {
            signal: controller.signal,
          }
        )

        if (!response.ok) {
          throw new Error(
            `Failed to fetch events (${response.status})`
          )
        }

        const result =
          await response.json()

        if (!result.success) {
          throw new Error(
            "Backend returned an unsuccessful response"
          )
        }

        if (!Array.isArray(result.data)) {
          throw new Error(
            "Invalid events response"
          )
        }

        setEvents(result.data)

      } catch (err) {

        if (err.name === "AbortError") {
          return
        }

        console.error(
          "Error fetching events:",
          err
        )

        setError(
          err.message ||
            "Unable to load events"
        )

        setEvents([])

      } finally {

        if (!controller.signal.aborted) {
          setLoading(false)
        }

      }
    }

    fetchEvents()

    return () => {
      controller.abort()
    }

  }, [])


  /* =======================================================
     CATEGORIZE
  ======================================================= */

  const categorizedEvents = useMemo(() => {

    const upcoming = []
    const ongoing = []
    const past = []

    events.forEach((event) => {

      const status =
        getStatus(event)

      if (status === "upcoming") {
        upcoming.push(event)
      }

      if (status === "ongoing") {
        ongoing.push(event)
      }

      if (status === "past") {
        past.push(event)
      }

    })


    upcoming.sort(
      (a, b) =>
        new Date(a.startDate) -
        new Date(b.startDate)
    )


    ongoing.sort(
      (a, b) =>
        new Date(a.startDate) -
        new Date(b.startDate)
    )


    past.sort(
      (a, b) =>
        new Date(b.startDate) -
        new Date(a.startDate)
    )


    return {
      upcoming,
      ongoing,
      past,
    }

  }, [events])


  /* =======================================================
     FEATURED
  ======================================================= */

  const featuredEvents =
    categorizedEvents.upcoming.length > 0
      ? categorizedEvents.upcoming
      : categorizedEvents.ongoing.length > 0
        ? categorizedEvents.ongoing
        : categorizedEvents.past.slice(0, 5)


  /* =======================================================
     CLICK
  ======================================================= */

  const handleEventClick = (event) => {

    if (!event.slug) {

      console.error(
        "Event does not contain a slug:",
        event
      )

      return
    }

    window.location.href =
      `/events/${event.slug}`
  }


  /* =======================================================
     CURRENT TAB
  ======================================================= */

  const currentEvents =
    activeTab === "upcoming"
      ? categorizedEvents.upcoming
      : activeTab === "ongoing"
        ? categorizedEvents.ongoing
        : categorizedEvents.past


  /* =======================================================
     TABS
  ======================================================= */

  const tabs = [
    {
      id: "upcoming",
      label: "UPCOMING",
      count:
        categorizedEvents.upcoming.length,
    },

    {
      id: "ongoing",
      label: "ONGOING",
      count:
        categorizedEvents.ongoing.length,
    },

    {
      id: "past",
      label: "PAST",
      count:
        categorizedEvents.past.length,
    },
  ]


  /* =======================================================
     RETURN
  ======================================================= */

  return (

    <main className="min-h-screen bg-[var(--vj-black)] text-white">


      {/* =================================================
          HEADER — UNCHANGED
      ================================================= */}

      <section className="px-4 pb-6 pt-5 sm:px-6 md:px-8 lg:px-12">

        <div className="mx-auto max-w-[1600px]">

          <p className="font-mono text-[10px] tracking-[0.3em] text-blue-400">
            VJ ARC / EVENTS
          </p>

          <div className="mt-1 flex items-end justify-between gap-5">

            <div>

              <h1 className="text-4xl font-semibold tracking-[-0.05em] sm:text-5xl md:text-6xl">
                EVENTS
              </h1>

              <p className="mt-1 max-w-2xl text-xs text-white/40 sm:text-sm">
                Discover upcoming experiences,
                workshops, competitions and
                activities by VJ ARC.
              </p>

            </div>


            <div className="hidden border-l border-white/10 pl-6 sm:block">

              <p className="font-mono text-3xl font-semibold text-white">

                {events.length
                  .toString()
                  .padStart(2, "0")}

              </p>

              <p className="font-mono text-[8px] tracking-[0.25em] text-white/40">
                TOTAL EVENTS
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="flex min-h-[350px] items-center justify-center"
        >

          <p className="font-mono text-[10px] tracking-[0.3em] text-white/30">
            LOADING EVENTS...
          </p>

        </motion.div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <motion.div
          initial={{
            opacity: 0,
            y: 10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mx-4 rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-center sm:mx-6 md:mx-8 lg:mx-12"
        >

          <p className="font-mono text-[10px] tracking-[0.2em] text-red-300">
            ERROR LOADING EVENTS
          </p>

          <p className="mt-2 text-xs text-white/40">
            {error}
          </p>

        </motion.div>

      )}


      {/* =================================================
          FEATURED
      ================================================= */}

      {!loading &&
        !error &&
        featuredEvents.length > 0 && (

          <>

            <div className="px-4 pb-3 sm:px-6 md:px-8 lg:px-12">

              <div className="mx-auto max-w-[1600px]">

                <motion.p
                  initial={{
                    opacity: 0,
                    x: -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.4,
                  }}
                  className="font-mono text-[9px] tracking-[0.3em] text-white/30"
                >
                  FEATURED EVENTS
                </motion.p>

              </div>

            </div>


            <FeaturedCarousel
              events={featuredEvents}
              onEventClick={handleEventClick}
            />

          </>

        )}


      {/* =================================================
          TABS
      ================================================= */}

      {!loading &&
        !error &&
        events.length > 0 && (

          <section className="px-4 pb-5 sm:px-6 md:px-8 lg:px-12">

            <div className="mx-auto max-w-[1600px]">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 8,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                }}
                className="inline-flex rounded-lg border border-white/10 bg-black/40 p-1"
              >

                {tabs.map((tab) => (

                  <motion.button
                    key={tab.id}
                    type="button"

                    onClick={() =>
                      setActiveTab(tab.id)
                    }

                    whileHover={{
                      y: -1,
                    }}

                    whileTap={{
                      scale: 0.96,
                    }}

                    transition={{
                      duration: 0.15,
                    }}

                    className={`
                      rounded-md
                      px-4
                      py-2.5
                      font-mono
                      text-[9px]
                      tracking-[0.15em]
                      transition-all
                      ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]"
                          : "text-white/40 hover:text-white/70"
                      }
                    `}
                  >

                    {tab.label}

                    <span className="ml-1.5 opacity-60">
                      {tab.count}
                    </span>

                  </motion.button>

                ))}

              </motion.div>

            </div>

          </section>

        )}


      {/* =================================================
          UPCOMING
      ================================================= */}

      {!loading &&
        !error &&
        activeTab === "upcoming" && (

          <EventSection
            label="NEXT UP"
            title="Upcoming Events"
            description="Exciting events coming your way."
            events={currentEvents}
            onEventClick={handleEventClick}
          />

        )}


      {/* =================================================
          ONGOING
      ================================================= */}

      {!loading &&
        !error &&
        activeTab === "ongoing" && (

          <EventSection
            label="HAPPENING NOW"
            title="Ongoing Events"
            description="Events that are happening right now."
            events={currentEvents}
            onEventClick={handleEventClick}
          />

        )}


      {/* =================================================
          PAST
      ================================================= */}

      {!loading &&
        !error &&
        activeTab === "past" && (

          <EventSection
            label="EVENT ARCHIVE"
            title="Past Events"
            description="A look back at what we've done."
            events={currentEvents}
            onEventClick={handleEventClick}
          />

        )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        events.length === 0 && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.5,
            }}
            className="flex min-h-[350px] items-center justify-center"
          >

            <div className="text-center">

              <p className="font-mono text-[10px] tracking-[0.3em] text-blue-400">
                VJ ARC / EVENTS
              </p>

              <h2 className="mt-3 text-2xl font-semibold">
                No events available
              </h2>

              <p className="mt-2 text-xs text-white/30">
                Check back soon for upcoming
                events.
              </p>

            </div>

          </motion.div>

        )}

    </main>
  )
}