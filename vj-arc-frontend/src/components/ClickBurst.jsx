import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

function ClickBurst() {
  const [bursts, setBursts] = useState([])

  useEffect(() => {
    const handleClick = (event) => {
      const id = Date.now() + Math.random()

      setBursts((prev) => [
        ...prev,
        {
          id,
          x: event.clientX,
          y: event.clientY,
        },
      ])

      setTimeout(() => {
        setBursts((prev) =>
          prev.filter((burst) => burst.id !== id)
        )
      }, 650)
    }

    window.addEventListener("click", handleClick)

    return () => {
      window.removeEventListener("click", handleClick)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      <AnimatePresence>
        {bursts.map((burst) => (
          <Burst
            key={burst.id}
            x={burst.x}
            y={burst.y}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

function Burst({ x, y }) {
  const particles = [
    { x: -28, y: -28 },
    { x: 28, y: -28 },
    { x: -28, y: 28 },
    { x: 28, y: 28 },
  ]

  return (
    <div
      className="absolute"
      style={{
        left: x,
        top: y,
      }}
    >
      {/* Four particles */}

      {particles.map((particle, index) => (
        <motion.span
          key={index}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
            opacity: 1,
          }}
          animate={{
            x: particle.x,
            y: particle.y,
            scale: [0, 1, 1, 0],
            opacity: [1, 1, 0.7, 0],
          }}
          transition={{
            duration: 0.55,
            delay: index * 0.02,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="absolute h-2.5 w-2.5 rounded-full bg-blue-400 shadow-[0_0_14px_rgba(59,130,246,0.9)]"
        />
      ))}

      {/* Center flash */}

      <motion.span
        initial={{
          scale: 0,
          opacity: 1,
        }}
        animate={{
          scale: [0, 1.8, 0],
          opacity: [1, 0.6, 0],
        }}
        transition={{
          duration: 0.45,
          ease: "easeOut",
        }}
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.9)]"
      />

      {/* Outer ring */}

      <motion.span
        initial={{
          scale: 0,
          opacity: 0.8,
        }}
        animate={{
          scale: 2.5,
          opacity: 0,
        }}
        transition={{
          duration: 0.9,
          ease: "easeOut",
        }}
        className="absolute -left-3 -top-3 h-6 w-6 rounded-full border border-blue-400/70"
      />
    </div>
  )
}

export default ClickBurst