import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import {
  CalendarDays,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { logoutAdmin } from "../services/authService"

const navigation = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true },
  { label: "Events", to: "/admin/events", icon: CalendarDays },
  { label: "Gallery", to: "/admin/gallery", icon: Images },
]

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  const logout = () => {
    logoutAdmin()
    navigate("/admin/login", { replace: true })
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <div className="min-h-screen bg-[var(--vj-black)] text-[var(--vj-white)]">
      <header className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/10 bg-[var(--vj-black)] px-5 lg:hidden">
        <span className="font-display text-sm font-bold tracking-[0.12em]">VJ ARC <span className="text-[var(--vj-blue)]">/ ADMIN</span></span>
        <button
          type="button"
          aria-label={drawerOpen ? "Close admin menu" : "Open admin menu"}
          aria-expanded={drawerOpen}
          onClick={() => setDrawerOpen((open) => !open)}
          className="grid size-10 place-items-center rounded-lg border border-white/10 text-[var(--vj-white)]"
        >
          {drawerOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      {drawerOpen && (
        <button
          type="button"
          aria-label="Close admin menu"
          onClick={closeDrawer}
          className="fixed inset-0 z-40 bg-black/70 lg:hidden"
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-[60] flex w-64 flex-col border-r border-white/10 bg-[var(--vj-dark)] px-5 py-6 transition-transform duration-200 lg:translate-x-0 ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="mb-10 px-2">
          <p className="font-display text-lg font-bold tracking-[0.12em]">VJ ARC</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--vj-blue)]">Admin Console</p>
        </div>

        <nav aria-label="Admin navigation" className="space-y-1">
          {navigation.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={closeDrawer}
              className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-colors ${isActive ? "bg-[var(--vj-blue)]/15 text-[var(--vj-white)]" : "text-[var(--vj-muted)] hover:bg-white/5 hover:text-[var(--vj-white)]"}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={logout}
          className="mt-auto flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-[var(--vj-muted)] transition-colors hover:bg-white/5 hover:text-[var(--vj-white)]"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      <main className="min-h-screen pt-16 lg:pl-64 lg:pt-0">
        <div className="mx-auto min-h-screen max-w-[1600px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}