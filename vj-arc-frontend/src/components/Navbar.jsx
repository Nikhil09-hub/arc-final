import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUpRight, Menu, X } from "lucide-react"
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom"


const navItems = [
  { name: "About", id: "about" },
  { name: "What We Do", id: "what-we-do" },
  { name: "Events", route: "/events" },
  { name: "Gallery", route: "/gallery" },
  { name: "Team", route: "/team" },
  { name: "Alumni", route: "/alumni" },
]


function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mouseX, setMouseX] = useState(50)

  const location = useLocation()
  const navigate = useNavigate()


  /*
   * Hide navbar on admin pages.
   */
  const isAdminPage =
    location.pathname.startsWith("/admin")


  /*
   * Detect page scrolling.
   */
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40)
    }

    window.addEventListener("scroll", handleScroll)

    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])


  /*
   * Detect active sections on homepage.
   */
  useEffect(() => {
    if (location.pathname !== "/") {
      setActive("")
      return
    }

    const handleScroll = () => {
      const activationPoint =
        window.scrollY + 260

      let closestSection = ""
      let closestDistance = Infinity

      navItems.forEach((item) => {
        if (!item.id) return

        const section =
          document.getElementById(item.id)

        if (!section) return

        const sectionTop =
          section.getBoundingClientRect().top +
          window.scrollY

        const distance = Math.abs(
          activationPoint - sectionTop
        )

        if (
          activationPoint >= sectionTop &&
          distance < closestDistance
        ) {
          closestDistance = distance
          closestSection = item.id
        }
      })

      setActive(closestSection)
    }

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    )

    handleScroll()

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      )
    }
  }, [location.pathname])


  /*
   * Close mobile menu when page changes.
   */
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])


  /*
   * Scroll to a homepage section.
   *
   * If already on homepage:
   *   scroll directly.
   *
   * If on another page:
   *   navigate home first, then scroll.
   */
  const scrollToSection = (id) => {
    setMobileOpen(false)

    if (location.pathname === "/") {
      const element =
        document.getElementById(id)

      if (!element) return

      const navbarOffset = 110

      const targetPosition =
        element.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      return
    }

    navigate(`/#${id}`)

    /*
     * React Router changes the URL first.
     * Wait briefly for Home to render,
     * then scroll to the section.
     */
    setTimeout(() => {
      const element =
        document.getElementById(id)

      if (!element) return

      const navbarOffset = 110

      const targetPosition =
        element.getBoundingClientRect().top +
        window.scrollY -
        navbarOffset

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })
    }, 100)
  }


  /*
   * Logo click.
   *
   * Always returns to the Hero/top of homepage.
   */
  const handleLogoClick = () => {
    setMobileOpen(false)

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    } else {
      navigate("/")

      setTimeout(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }, 100)
    }
  }


  /*
   * Mouse-following glow.
   */
  const handleMouseMove = (event) => {
    const rect =
      event.currentTarget.getBoundingClientRect()

    const x =
      ((event.clientX - rect.left) /
        rect.width) *
      100

    setMouseX(x)
  }


  /*
   * Admin pages don't need public navbar.
   */
  if (isAdminPage) {
    return null
  }


  return (
    <>
      {/* ================================
          DESKTOP / MAIN NAVBAR
      ================================= */}

      <motion.header
        onMouseMove={handleMouseMove}
        animate={{
          top: scrolled ? 18 : 0,
          left: scrolled ? "50%" : "0%",
          x: scrolled ? "-50%" : "0%",
          width: scrolled
            ? "min(1100px, calc(100% - 32px))"
            : "100%",
        }}
        transition={{
          type: "spring",
          stiffness: 180,
          damping: 24,
          mass: 0.7,
        }}
        className={`fixed z-50 ${
          scrolled
            ? "rounded-full border border-white/10 bg-black/60 shadow-2xl backdrop-blur-2xl"
            : "border-b border-white/[0.06] bg-black/10 backdrop-blur-sm"
        }`}
      >

        {/* Mouse Following Glow */}
        <motion.div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
          animate={{
            background: `radial-gradient(
              300px circle at ${mouseX}% 50%,
              rgba(37,99,255,0.10),
              transparent 70%
            )`,
          }}
        />

        <div
          className={`relative mx-auto flex items-center ${
            scrolled
              ? "h-[68px] px-5 md:px-6"
              : "h-[88px] px-6 md:px-10"
          }`}
        >

          {/* ================================
              LOGO
          ================================= */}

          <button
            type="button"
            onClick={handleLogoClick}
            className="relative z-10 flex shrink-0 items-center gap-3 text-left"
            aria-label="Go to VJ ARC home"
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              className="relative"
            >
              <motion.img
                src="/images/logo.png"
                alt="VJ ARC — AI Research and Coding"
                className="h-11 w-11 object-contain"
                animate={{
                  rotate: scrolled
                    ? 0
                    : [0, 2, 0, -2, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: scrolled
                    ? 0
                    : Infinity,
                  ease: "easeInOut",
                }}
              />

              <motion.div
                className="pointer-events-none absolute inset-0 rounded-full bg-[var(--vj-blue)]/20 blur-xl"
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [0.9, 1.1, 0.9],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>

            <div className="hidden text-left sm:block">
              <p className="text-sm font-bold tracking-wide">
                VJ ARC
              </p>

              <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--vj-muted)]">
                AI Research & Coding
              </p>
            </div>
          </button>


          {/* ================================
              DESKTOP NAVIGATION
          ================================= */}

          <nav className="mx-auto hidden items-center gap-1 md:flex">

            {navItems.map((item) => {
              const isActive =
                item.route === location.pathname ||
                active === item.id

              /* Route-based page */
              if (item.route) {
                return (
                  <Link
                    key={item.name}
                    to={item.route}
                    className={`group relative px-4 py-2 text-[14px] font-medium tracking-wide transition-colors duration-300 ${
                      isActive
                        ? "text-[var(--vj-white)]"
                        : "text-[var(--vj-muted)] hover:text-[var(--vj-white)]"
                    }`}
                  >
                    <span className="relative z-10">
                      {item.name}
                    </span>

                    {/* Active background */}
                    {isActive && (
                      <motion.span
                        layoutId="active-nav"
                        className="absolute inset-0 -z-0 rounded-full bg-[var(--vj-blue)]/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}

                    {/* Hover line */}
                    <motion.span
                      className="absolute bottom-0 left-1/2 h-px bg-[var(--vj-blue)]"
                      initial={{
                        width: 0,
                        x: "-50%",
                      }}
                      whileHover={{
                        width: "50%",
                      }}
                    />
                  </Link>
                )
              }

              /* Homepage section */
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    scrollToSection(item.id)
                  }
                  whileHover={{ y: -1 }}
                  className={`group relative px-4 py-2 text-[14px] font-medium tracking-wide transition-colors duration-300 ${
                    isActive
                      ? "text-[var(--vj-white)]"
                      : "text-[var(--vj-muted)] hover:text-[var(--vj-white)]"
                  }`}
                >
                  <span className="relative z-10">
                    {item.name}
                  </span>

                  {/* Active pill */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.span
                        layoutId="active-nav"
                        className="absolute inset-0 -z-0 rounded-full bg-[var(--vj-blue)]/10"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hover line */}
                  <motion.span
                    className="absolute bottom-0 left-1/2 h-px bg-[var(--vj-blue)]"
                    initial={{
                      width: 0,
                      x: "-50%",
                    }}
                    whileHover={{
                      width: "50%",
                    }}
                  />
                </motion.button>
              )
            })}

          </nav>


          {/* ================================
              LINKEDIN
          ================================= */}

          <motion.a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{
              scale: 1.04,
              boxShadow:
                "0 0 30px rgba(37,99,255,0.22)",
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="ml-auto hidden items-center gap-2 rounded-full border border-[var(--vj-blue)]/30 bg-[var(--vj-blue)]/10 px-4 py-2.5 text-xs font-medium text-[var(--vj-blue)] transition-colors hover:bg-[var(--vj-blue)]/20 md:flex"
          >
            LinkedIn

            <motion.span
              whileHover={{
                rotate: 45,
              }}
            >
              <ArrowUpRight size={14} />
            </motion.span>
          </motion.a>


          {/* ================================
              MOBILE MENU BUTTON
          ================================= */}

          <motion.button
            type="button"
            onClick={() =>
              setMobileOpen(!mobileOpen)
            }
            whileTap={{ scale: 0.9 }}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
          >
            <AnimatePresence mode="wait">

              {mobileOpen ? (
                <motion.div
                  key="close"
                  initial={{
                    rotate: -90,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 0,
                    opacity: 1,
                  }}
                  exit={{
                    rotate: 90,
                    opacity: 0,
                  }}
                >
                  <X size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{
                    rotate: 90,
                    opacity: 0,
                  }}
                  animate={{
                    rotate: 0,
                    opacity: 1,
                  }}
                  exit={{
                    rotate: -90,
                    opacity: 0,
                  }}
                >
                  <Menu size={18} />
                </motion.div>
              )}

            </AnimatePresence>
          </motion.button>

        </div>
      </motion.header>


      {/* ================================
          MOBILE MENU
      ================================= */}

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
              y: -20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y: -20,
            }}
            transition={{
              duration: 0.35,
            }}
            className="fixed inset-x-4 top-24 z-40 overflow-hidden rounded-3xl border border-white/10 bg-black/90 p-3 shadow-2xl backdrop-blur-2xl md:hidden"
          >
            <div className="space-y-1">

              {navItems.map((item, index) => {

                /* Route */
                if (item.route) {
                  return (
                    <Link
                      key={item.name}
                      to={item.route}
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm transition ${
                        location.pathname ===
                        item.route
                          ? "bg-[var(--vj-blue)]/10 text-[var(--vj-blue)]"
                          : "text-[var(--vj-muted)] hover:bg-[var(--vj-blue)]/10 hover:text-[var(--vj-white)]"
                      }`}
                    >
                      <span>
                        {item.name}
                      </span>

                      <ArrowUpRight size={15} />
                    </Link>
                  )
                }

                /* Homepage section */
                return (
                  <motion.button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      scrollToSection(item.id)
                    }
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.05,
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left text-sm ${
                      active === item.id &&
                      location.pathname === "/"
                        ? "bg-[var(--vj-blue)]/10 text-[var(--vj-blue)]"
                        : "text-[var(--vj-muted)] hover:bg-[var(--vj-blue)]/10 hover:text-[var(--vj-white)]"
                    }`}
                  >
                    <span>
                      {item.name}
                    </span>

                    <ArrowUpRight size={15} />
                  </motion.button>
                )
              })}


              {/* LinkedIn */}
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-between rounded-2xl bg-[var(--vj-blue)] px-5 py-4 text-sm font-medium text-white"
              >
                <span>
                  Connect on LinkedIn
                </span>

                <ArrowUpRight size={16} />
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default Navbar