import { motion, useInView, animate } from "motion/react"
import { useRef, useEffect, useState } from "react"
import {
  Brain,
  BarChart3,
  ShieldCheck,
  Code2,
  Cpu,
  FlaskConical,
  Globe,
  Rocket,
  Compass,
  Target,
  Trophy,
  Users,
  Sparkles,
} from "lucide-react"

/* -------------------------------------------------------
   Animated counter — counts up when in view
------------------------------------------------------- */
function AnimatedStat({ value, suffix = "", label, icon: Icon, delay = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return

    const controls = animate(0, value, {
      duration: 2,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    })

    return () => controls.stop()
  }, [inView, value, delay])

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.7, delay }}
      className="group relative flex flex-col items-center gap-3 rounded-2xl border border-[var(--vj-white)]/[0.06] bg-[var(--vj-white)]/[0.02] px-6 py-7 text-center backdrop-blur-sm transition-all duration-300 hover:border-[var(--vj-blue)]/30 hover:bg-[var(--vj-white)]/[0.04]"
    >
      {/* hover glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at 50% 50%, rgba(37,99,255,0.08), transparent 70%)",
        }}
      />

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--vj-blue)]/10 text-[var(--vj-blue)]">
        <Icon size={20} />
      </div>

      <p className="font-mono font-bold text-3xl md:text-4xl text-[var(--vj-white)] tracking-tight">
        {display}
        {suffix}
      </p>

      <p className="font-mono text-xs uppercase tracking-wider text-[var(--vj-muted)] font-medium">
        {label}
      </p>
    </motion.div>
  )
}

/* -------------------------------------------------------
   Focus Area Card (8 Pillars)
------------------------------------------------------- */
function FocusCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[var(--vj-white)]/[0.06] bg-[var(--vj-white)]/[0.02] p-6 backdrop-blur-sm transition-all duration-500 hover:border-[var(--vj-blue)]/30 hover:bg-[var(--vj-white)]/[0.04]"
    >
      {/* subtle corner glow */}
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[var(--vj-blue)]/[0.05] blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--vj-blue)]/10 text-[var(--vj-blue)] transition-colors duration-300 group-hover:bg-[var(--vj-blue)]/20 group-hover:text-[var(--vj-blue)]">
          <Icon size={22} />
        </div>

        <h4 className="font-mono font-bold text-lg text-[var(--vj-white)] group-hover:text-[var(--vj-blue)] transition-colors duration-300 mb-2">
          {title}
        </h4>

        <p className="font-sans text-[var(--vj-muted)] text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

/* -------------------------------------------------------
   Background dot grid
------------------------------------------------------- */
function DotGrid() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03]">
      <svg width="100%" height="100%">
        <defs>
          <pattern
            id="about-dots"
            x="0"
            y="0"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <circle
              cx="1"
              cy="1"
              r="1"
              fill="var(--vj-white)"
            />
          </pattern>
        </defs>

        <rect
          width="100%"
          height="100%"
          fill="url(#about-dots)"
        />
      </svg>
    </div>
  )
}

/* -------------------------------------------------------
   CLUB STATS
------------------------------------------------------- */
const STATS = [
  { value: 15, suffix: "+", label: "Flagship Events", icon: Trophy },
  { value: 1500, suffix: "+", label: "Participants", icon: Users },
  { value: 15, suffix: "", label: "Student Leaders", icon: Target },
  { value: 100, suffix: "%", label: "Innovation Driven", icon: Sparkles },
]

/* -------------------------------------------------------
   8 CORE AREAS OF FOCUS
------------------------------------------------------- */
const FOCUS_AREAS = [
  {
    icon: Brain,
    title: "AI & Machine Learning",
    description:
      "Deep neural networks, LLMs, computer vision, and cognitive systems powering intelligent software.",
  },
  {
    icon: BarChart3,
    title: "Data Science & Analytics",
    description:
      "Data mining, big data pipelines, statistical modeling, and actionable business visualization.",
  },
  {
    icon: ShieldCheck,
    title: "Cyber Security",
    description:
      "Defensive engineering, vulnerability assessments, penetration testing, and cryptography.",
  },
  {
    icon: Code2,
    title: "Software Development",
    description:
      "Fullstack web architectures, APIs, modern frameworks, scalable microservices, and cloud systems.",
  },
  {
    icon: Cpu,
    title: "Competitive Programming",
    description:
      "Algorithmic mastery, advanced data structures, speed coding, and high-intensity problem solving.",
  },
  {
    icon: FlaskConical,
    title: "Research & Innovation",
    description:
      "Technical publications, research papers, and exploring cutting-edge computing paradigms.",
  },
  {
    icon: Globe,
    title: "Open-Source Development",
    description:
      "Collaborative engineering, Git workflows, and building impactful community-driven tools.",
  },
  {
    icon: Rocket,
    title: "Emerging Technologies",
    description:
      "Edge AI, autonomous agents, Web3 protocols, and next-generation developer tooling.",
  },
]

/* -------------------------------------------------------
   VISION & MISSION ITEMS
------------------------------------------------------- */
const VISION_ITEMS = [
  "Become a leading technical club that inspires students to excel in software development and artificial intelligence.",
  "Serve as a catalyst for technological advancement within the college by providing opportunities through events, workshops, and competitions.",
  "Produce future leaders and innovators who will drive the next generation of technological solutions and breakthroughs.",
]

const MISSION_ITEMS = [
  "Foster a community of forward-thinking students passionate about coding, artificial intelligence, and technology innovation.",
  "Provide access to resources, mentorship, and hands-on experiences that equip members with essential technical and professional skills.",
  "Serve as a platform for collaboration on real-world projects, promoting an environment where learning, creativity, and innovation thrive.",
]

/* -------------------------------------------------------
   MAIN ABOUT COMPONENT
------------------------------------------------------- */
function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-[var(--vj-white)]/[0.06] pt-8 pb-20 md:pt-12 md:pb-28"
    >
      <DotGrid />

      {/* Decorative ambient gradients */}
      <div className="pointer-events-none absolute -left-48 top-16 h-[500px] w-[500px] rounded-full bg-[var(--vj-blue)]/[0.04] blur-[130px]" />

      <div className="pointer-events-none absolute -right-40 top-1/2 h-[450px] w-[450px] rounded-full bg-[var(--vj-blue)]/[0.03] blur-[120px]" />

      <div className="section-container relative space-y-24 md:space-y-32">

        {/* =======================================================
            1. SECTION HEADER & GENESIS
           ======================================================= */}
        <div>
          <div className="mb-14 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--vj-blue)]/20 bg-[var(--vj-blue)]/10 px-4 py-1.5 font-mono text-[var(--vj-blue)] text-xs sm:text-sm uppercase tracking-[0.3em] font-medium"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--vj-blue)] animate-pulse" />
              About The Club
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-mono font-bold text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--vj-white)] tracking-tight whitespace-nowrap"
            >
              The Story Behind <span className="text-[var(--vj-blue)]">VJ ARC</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mt-6 font-sans text-[var(--vj-muted)] text-base sm:text-lg leading-relaxed max-w-2xl"
            >
              A united platform combining the best of software development,
              algorithmic excellence, and artificial intelligence research to build
              the next generation of tech leaders.
            </motion.p>
          </div>

          {/* ── The Genesis & Philosophy Cards ── */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Card 1: The Fusion */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-[var(--vj-white)]/[0.08] bg-[var(--vj-white)]/[0.02] p-8 backdrop-blur-md transition-all duration-300 hover:border-[var(--vj-blue)]/30"
            >
              <div>
                <div className="mb-4 inline-block rounded-full bg-[var(--vj-blue)]/10 px-3 py-1 font-mono text-xs uppercase tracking-wider font-medium text-[var(--vj-blue)]">
                  Club Origins
                </div>

                <h3 className="font-mono font-bold text-xl md:text-2xl text-[var(--vj-white)] mb-3">
                  The Power of Fusion
                </h3>

                <p className="font-sans text-[var(--vj-muted)] text-base leading-relaxed">
                  VJ ARC (AI Research and Coding Club) was established through the
                  strategic merger of two renowned departmental bodies:{" "}
                  <strong className="text-[var(--vj-white)] font-medium">
                    VJ Hackslash
                  </strong>{" "}
                  (software development & competitive programming) and{" "}
                  <strong className="text-[var(--vj-white)] font-medium">
                    VJ CreatinAI
                  </strong>{" "}
                  (artificial intelligence & innovation).
                </p>
              </div>

              {/* Merger Flow Pill Diagram */}
              <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--vj-white)]/[0.06] bg-[var(--vj-black)]/40 p-3.5">
                <span className="rounded-xl border border-[var(--vj-white)]/10 bg-[var(--vj-white)]/5 px-3 py-2 font-mono text-xs uppercase tracking-wider font-medium text-[var(--vj-muted)]">
                  VJ Hackslash
                </span>

                <span className="text-[var(--vj-blue)] font-bold font-mono">
                  +
                </span>

                <span className="rounded-xl border border-[var(--vj-white)]/10 bg-[var(--vj-white)]/5 px-3 py-2 font-mono text-xs uppercase tracking-wider font-medium text-[var(--vj-muted)]">
                  VJ CreatinAI
                </span>

                <span className="text-[var(--vj-blue)] font-bold font-mono">
                  =
                </span>

                <span className="rounded-xl border border-[var(--vj-blue)]/40 bg-[var(--vj-blue)]/20 px-3.5 py-2 font-mono text-xs uppercase tracking-wider font-semibold text-[var(--vj-blue)] shadow-[0_0_15px_var(--vj-blue-glow)]">
                  VJ ARC
                </span>
              </div>
            </motion.div>

            {/* Card 2: The Philosophy */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="group relative flex flex-col justify-between rounded-3xl border border-[var(--vj-white)]/[0.08] bg-[var(--vj-white)]/[0.02] p-8 backdrop-blur-md transition-all duration-300 hover:border-[var(--vj-blue)]/30"
            >
              <div>
                <div className="mb-4 inline-block rounded-full bg-[var(--vj-blue)]/10 px-3 py-1 font-mono text-xs uppercase tracking-wider font-medium text-[var(--vj-blue)]">
                  The Motto Philosophy
                </div>

                <h3 className="font-mono font-bold text-xl md:text-2xl text-[var(--vj-white)] mb-3">
                  “A Tech Renaissance”
                </h3>

                <p className="font-sans text-[var(--vj-muted)] text-base leading-relaxed">
                  Just as the historical Renaissance marked an era of groundbreaking
                  discoveries and cultural transformation, VJ ARC inspires students
                  to explore emerging technologies, embrace uninhibited creativity,
                  and contribute to advancements that shape tomorrow.
                </p>
              </div>

              {/* Motto Quote Box */}
              <div className="mt-8 rounded-2xl border-l-2 border-[var(--vj-blue)] bg-[var(--vj-blue)]/[0.04] p-4 font-sans text-[var(--vj-muted)] text-sm md:text-base italic leading-relaxed">
                “Unifying Creativity and Technology to build solutions that matter.”
              </div>
            </motion.div>
          </div>
        </div>

        {/* =======================================================
            2. LIVE METRICS & STATS
           ======================================================= */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((stat, i) => (
            <AnimatedStat key={stat.label} {...stat} delay={i * 0.08} />
          ))}
        </div>

        {/* =======================================================
            3. VISION & MISSION SPLIT
           ======================================================= */}
        <div>
          <div className="mb-10 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--vj-blue)]/20 bg-[var(--vj-blue)]/10 px-3.5 py-1 font-mono text-[var(--vj-blue)] text-xs sm:text-sm uppercase tracking-[0.3em] font-medium"
            >
              Guiding Principles
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-mono font-bold text-2xl md:text-3xl text-[var(--vj-white)]"
            >
              Vision & Mission
            </motion.h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">

            {/* Vision Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="rounded-3xl border border-[var(--vj-white)]/[0.08] bg-[var(--vj-white)]/[0.02] p-8 backdrop-blur-md hover:border-[var(--vj-blue)]/30 transition-all duration-300"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vj-blue)]/10 text-[var(--vj-blue)]">
                  <Compass size={24} />
                </div>

                <h4 className="font-mono font-bold text-xl md:text-2xl text-[var(--vj-white)]">
                  Our Vision
                </h4>
              </div>

              <ul className="space-y-4">
                {VISION_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-sans text-[var(--vj-muted)] text-sm leading-relaxed"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--vj-blue)] shadow-[0_0_8px_var(--vj-blue-glow)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Mission Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="rounded-3xl border border-[var(--vj-white)]/[0.08] bg-[var(--vj-white)]/[0.02] p-8 backdrop-blur-md hover:border-[var(--vj-blue)]/30 transition-all duration-300"
            >
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--vj-blue)]/10 text-[var(--vj-blue)]">
                  <Target size={24} />
                </div>

                <h4 className="font-mono font-bold text-xl md:text-2xl text-[var(--vj-white)]">
                  Our Mission
                </h4>
              </div>

              <ul className="space-y-4">
                {MISSION_ITEMS.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 font-sans text-[var(--vj-muted)] text-sm leading-relaxed"
                  >
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--vj-blue)] shadow-[0_0_8px_var(--vj-blue-glow)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* =======================================================
            4. 8 PILLARS OF EXCELLENCE / CORE AREAS OF FOCUS
           ======================================================= */}
        <div>
          <div className="mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-3 inline-flex items-center gap-2 rounded-full border border-[var(--vj-blue)]/20 bg-[var(--vj-blue)]/10 px-3.5 py-1 font-mono text-[var(--vj-blue)] text-xs sm:text-sm uppercase tracking-[0.3em] font-medium"
            >
              8 Pillars of Excellence
            </motion.div>

            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-mono font-bold text-2xl md:text-3xl text-[var(--vj-white)]"
            >
              Core Areas of Focus
            </motion.h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FOCUS_AREAS.map((focus, i) => (
              <FocusCard key={focus.title} {...focus} index={i} />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}

export default About