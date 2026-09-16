import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { LockKeyhole, Mail, ArrowRight } from "lucide-react"

const API_URL = import.meta.env.VITE_API_URL

function AdminLoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

 const handleLogin = async (e) => {
  e.preventDefault()

  try {
    setLoading(true)
    setError("")

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.trim(),
        password,
      }),
    })

    const text = await response.text()

    console.log("Login status:", response.status)
    console.log("Login response:", text)

    let result

    try {
      result = JSON.parse(text)
    } catch {
      throw new Error(
        `Server returned an invalid response (${response.status})`
      )
    }

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Login failed")
    }

    localStorage.setItem("vj_arc_admin_token", result.token)

    navigate("/admin/gallery")
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
            Sign in to manage the VJ ARC gallery.
          </p>
        </div>

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