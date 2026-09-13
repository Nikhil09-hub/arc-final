import { motion } from "motion/react"
import { useEffect, useState } from "react"

function CustomCursor() {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
  })

  const [hovering, setHovering] = useState(false)

  useEffect(() => {
    const move = (e) => {
      setPosition({
        x: e.clientX,
        y: e.clientY,
      })
    }

    const updateHover = (e) => {
      const target = e.target

      if (
        target.closest(
          "a, button, [data-cursor]"
        )
      ) {
        setHovering(true)
      } else {
        setHovering(false)
      }
    }

    window.addEventListener("mousemove", move)
    window.addEventListener("mouseover", updateHover)

    return () => {
      window.removeEventListener("mousemove", move)
      window.removeEventListener(
        "mouseover",
        updateHover
      )
    }
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block"
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 35,
        mass: 0.2,
      }}
    >
      {/* Outer glow */}
      <motion.div
        animate={{
          width: hovering ? 54 : 32,
          height: hovering ? 54 : 32,
          x: hovering ? -27 : -16,
          y: hovering ? -27 : -16,
          opacity: hovering ? 0.35 : 0.2,
        }}
        transition={{
          duration: 0.2,
        }}
        className="absolute rounded-full bg-blue-500 blur-xl"
      />

      {/* Main cursor */}
      <motion.div
        animate={{
          width: hovering ? 42 : 7,
          height: hovering ? 42 : 7,
          x: hovering ? -21 : -3.5,
          y: hovering ? -21 : -3.5,
          borderWidth: hovering ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 25,
        }}
        className="absolute rounded-full border border-blue-400 bg-blue-500/20"
      />

      {/* Center */}
      <motion.div
        animate={{
          scale: hovering ? 0 : 1,
        }}
        className="absolute left-[-2px] top-[-2px] h-1 w-1 rounded-full bg-white"
      />
    </motion.div>
  )
}

export default CustomCursor