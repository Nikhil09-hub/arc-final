const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

export const ADMIN_TOKEN_KEY = "vj_arc_admin_token"

export function getAdminToken() {
  return localStorage.getItem(ADMIN_TOKEN_KEY)
}

export function storeAdminToken(token) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token)
}

export function getAuthHeaders(initialHeaders) {
  const headers = new Headers(initialHeaders || {})
  const token = getAdminToken()
  if (token) headers.set("Authorization", `Bearer ${token}`)
  return headers
}

export function handleExpiredSession() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
  window.location.replace("/admin/login?expired=1")
}

export function logoutAdmin() {
  localStorage.removeItem(ADMIN_TOKEN_KEY)
}

export async function loginAdmin({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  })
  const result = await response.json().catch(() => null)

  if (!response.ok || !result?.success || !result.token) {
    throw new Error(result?.message || "Login failed")
  }

  return result.token
}