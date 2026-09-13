import Network from "./Network"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"

function Hero() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    })
  }

  return (
    <section className="relative min-h-[calc(100vh-89px)] overflow-hidden">

      {/* Network — DON'T TOUCH */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2">
        <Network />
      </div>

      {/* Content */}
      <div className="section-container flex min-h-[calc(100vh-89px)] items-center">

        <motion.div
          className="max-w-3xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
        >

          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7 }}
            className="mb-6 text-sm font-medium uppercase tracking-[0.3em] text-blue-400"
          >
            Technology • Innovation • Community
          </motion.p>

          {/* Heading */}
            <h1
              className="text-6xl font-bold leading-[0.92] tracking-[-0.035em] md:text-8xl"
              style={{ fontFamily: "var(--font-hero)" }}
            >
            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7 }}
            >
              BUILD.
            </motion.span>

            <motion.span
              className="block text-blue-500"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              INNOVATE.
            </motion.span>

            <motion.span
              className="block"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              CONNECT.
            </motion.span>

          </h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-8 max-w-xl text-lg leading-relaxed text-gray-400"
          >
            VJ ARC is a student-driven technical community focused on
            technology, innovation, collaboration and learning.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mt-10 flex gap-4"
          >

            {/* Explore Programs */}
            <motion.button
              onClick={() => scrollTo("programs")}
              whileHover={{
                scale: 1.04,
                boxShadow: "0 0 30px rgba(37,99,235,0.35)",
              }}
              whileTap={{
                scale: 0.94,
              }}
              className="group flex items-center gap-2 rounded-full bg-blue-600 px-7 py-3 font-medium"
            >
              Explore Programs

              <motion.span
                initial={{ x: 0, y: 0 }}
                whileHover={{ x: 3, y: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <ArrowUpRight size={17} />
              </motion.span>
            </motion.button>

            {/* Discover VJ ARC */}
            <motion.button
              onClick={() => scrollTo("about")}
              whileHover={{
                scale: 1.04,
                borderColor: "rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
              whileTap={{
                scale: 0.94,
              }}
              className="group flex items-center gap-2 rounded-full border border-white/20 px-7 py-3 font-medium transition"
            >
              Discover VJ ARC

              <motion.span
                initial={{ x: 0, y: 0 }}
                whileHover={{ x: 3, y: -3 }}
              >
                <ArrowUpRight size={17} />
              </motion.span>
            </motion.button>

          </motion.div>

        </motion.div>

      </div>

      {/* Small technical label */}
      <div className="absolute bottom-8 right-10 hidden font-mono text-[10px] uppercase tracking-[0.25em] text-gray-600 lg:block">
        VJ ARC / AI RESEARCH & CODING
      </div>

    </section>
  )
}

export default Hero