import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowLeft, ArrowRight, Quote } from "lucide-react"

const alumni = [
  {
    quote:
      "VJ ARC gave me the confidence to turn curiosity into real projects and explore technology beyond the classroom.",
    name: "Alumni Name",
    role: "VJ ARC ALUMNI",
    year: "2024",
  },
  {
    quote:
      "The community pushed me to experiment, collaborate and build things I never thought I could build as a student.",
    name: "Alumni Name",
    role: "VJ ARC ALUMNI",
    year: "2025",
  },
  {
    quote:
      "What started as a technical club became a community of people who genuinely wanted to learn and create together.",
    name: "Alumni Name",
    role: "VJ ARC ALUMNI",
    year: "2025",
  },
]

function AlumniPage() {
  const [active, setActive] = useState(0)
  const [direction, setDirection] = useState(1)

  const current = alumni[active]

  const next = () => {
    setDirection(1)
    setActive((prev) => (prev + 1) % alumni.length)
  }

  const previous = () => {
    setDirection(-1)
    setActive((prev) => (prev - 1 + alumni.length) % alumni.length)
  }

  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [])

  return (
    <main className="min-h-screen bg-[var(--vj-black)] text-[var(--vj-white)]">

      <section
        id="alumni"
        className="relative overflow-hidden border-t border-white/10 px-4 pb-10 pt-5 sm:px-6 md:px-8 lg:px-10"
      >

        {/* ================= BACKGROUND GRID ================= */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* ================= BLUE ORB ================= */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--vj-blue)]/10 blur-[120px]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.25, 0.45, 0.25],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <div className="section-container relative z-10">

          {/* ================= HEADER ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7 }}
          >

            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--vj-blue)]">
              From Our Alumni
            </p>

            <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">

              <h1 className="font-display text-4xl font-bold leading-[1.05] md:text-6xl">
                FEW WORDS
                <br />
                <span className="text-[var(--vj-muted)]">
                  FROM THEM.
                </span>
              </h1>

              <p className="max-w-sm text-sm leading-relaxed text-[var(--vj-muted)]">
                The people who were once part of VJ ARC continue to carry its
                spirit beyond campus.
              </p>

            </div>
          </motion.div>


          {/* ================= TESTIMONIAL ================= */}
          <div className="relative mx-auto mt-10 max-w-6xl">

            {/* Giant Quote */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{
                duration: 0.8,
                type: "spring",
                stiffness: 70,
              }}
              className="absolute -left-2 -top-10 text-[var(--vj-blue)]/20 md:-left-10 md:-top-14"
            >
              <Quote size={90} strokeWidth={1} />
            </motion.div>


            {/* Quote Content */}
            <div className="relative min-h-[280px] overflow-hidden border-y border-white/10 px-2 py-10 md:px-10">

              <AnimatePresence mode="wait" custom={direction}>

                <motion.div
                  key={active}
                  custom={direction}
                  initial={{
                    opacity: 0,
                    x: direction * 80,
                    filter: "blur(6px)",
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    filter: "blur(0px)",
                  }}
                  exit={{
                    opacity: 0,
                    x: direction * -80,
                    filter: "blur(6px)",
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeInOut",
                  }}
                  className="relative"
                >

                  <p className="max-w-5xl text-2xl font-medium leading-relaxed tracking-tight md:text-4xl">
                    “{current.quote}”
                  </p>

                  <div className="mt-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">

                    <div>
                      <p className="text-base font-semibold">
                        {current.name}
                      </p>

                      <p className="mt-1 font-mono text-[10px] tracking-[0.25em] text-[var(--vj-blue)]">
                        {current.role} · {current.year}
                      </p>
                    </div>

                    <div className="font-mono text-xs text-[var(--vj-muted)]">
                      {String(active + 1).padStart(2, "0")} /{" "}
                      {String(alumni.length).padStart(2, "0")}
                    </div>

                  </div>

                </motion.div>

              </AnimatePresence>

            </div>


            {/* ================= CONTROLS ================= */}
            <div className="mt-5 flex items-center justify-between">

              {/* Progress */}
              <div className="flex gap-1">

                {alumni.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Show testimonial ${index + 1}`}
                    onClick={() => {
                      setDirection(index > active ? 1 : -1)
                      setActive(index)
                    }}
                    className="group h-6"
                  >
                    <span
                      className={`block h-[2px] transition-all duration-500 ${
                        index === active
                          ? "w-12 bg-[var(--vj-blue)]"
                          : "w-6 bg-white/20 group-hover:bg-white/50"
                      }`}
                    />
                  </button>
                ))}

              </div>


              {/* Arrows */}
              <div className="flex gap-2">

                <motion.button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={previous}
                  whileHover={{
                    scale: 1.08,
                    borderColor: "rgba(37,99,255,0.8)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
                >
                  <ArrowLeft size={16} />
                </motion.button>

                <motion.button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={next}
                  whileHover={{
                    scale: 1.08,
                    borderColor: "rgba(37,99,255,0.8)",
                  }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10"
                >
                  <ArrowRight size={16} />
                </motion.button>

              </div>

            </div>

          </div>


          {/* ================= BOTTOM STATEMENT ================= */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 md:flex-row"
          >

            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vj-muted)]">
              VJ ARC
            </span>

            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--vj-muted)]">
              AI RESEARCH · CODING · COMMUNITY
            </span>

          </motion.div>

        </div>

      </section>

    </main>
  )
}

export default AlumniPage