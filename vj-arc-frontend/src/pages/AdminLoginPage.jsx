import { useState } from "react"
import { useLocation, useNavigate, useSearchParams } from "react-router-dom"
import { LockKeyhole, Mail, ArrowRight } from "lucide-react"
import { loginAdmin, storeAdminToken } from "../services/authService"

function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

 const handleLogin = async (e) => {
  e.preventDefault()

  try {
    setLoading(true)
    setError("")

    const token = await loginAdmin({ email, password })
    storeAdminToken(token)

    const destination = location.state?.from
    navigate(destination?.startsWith("/admin/") ? destination : "/admin", {
      replace: true,
    })
  } catch (err) {
    console.error("Login error:", err)
    setError(err.message || "Unable to login")
  } finally {
    setLoading(false)
  }
}
  return (
    <main className="min-h-screen bg-[var(--vj-black)] text-[var(--vj-white)] flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="mb-8 text-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--vj-blue)]">
            VJ ARC / ADMIN
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-[var(--vj-muted)]">
            Sign in to manage VJ ARC events and gallery.
          </p>
        </div>

        {searchParams.get("expired") === "1" && (
          <p role="status" className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-sm text-amber-200">
            Your session has expired. Please log in again.
          </p>
        )}

        {/* Login Card */}
        <div className="rounded-2xl border border-white/10 bg-[var(--vj-dark)] p-6 md:p-8">

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vj-muted)]"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Admin email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[var(--vj-black)] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--vj-blue)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--vj-muted)]">
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--vj-muted)]"
                />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[var(--vj-black)] py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[var(--vj-blue)]"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
                <p className="text-sm text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--vj-blue)] px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}

              {!loading && (
                <ArrowRight
                  size={17}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </button>

          </form>
        </div>

        <p className="mt-6 text-center font-mono text-[8px] uppercase tracking-[0.25em] text-[var(--vj-muted)]">
          VJ ARC • AI RESEARCH & CODING
        </p>

      </div>
    </main>
  )
}

export default AdminLoginPage