import { getAuthHeaders, handleExpiredSession } from "./authService"

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

export async function adminRequest(path, options = {}) {
  const headers = getAuthHeaders(options.headers)

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const endpoint = path.replace(/^\/+/, "")
  const response = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    handleExpiredSession()
    throw new Error("Your session has expired. Please log in again.")
  }

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.message || `Request failed (${response.status})`)
  }

  return result
}
