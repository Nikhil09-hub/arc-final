import { adminRequest } from "./adminApi"

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

// Public: Submit event registration
export async function submitRegistration(payload, { adminOnly = false } = {}) {
  if (adminOnly) {
    return adminRequest("registrations/admin", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  const response = await fetch(`${API_URL}/registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(result?.message || `Registration failed (${response.status})`)
    error.status = response.status
    error.data = result
    throw error
  }

  return result
}

// Admin: Get summary of internal events with registration counts
export async function getRegistrationsSummary() {
  const result = await adminRequest("registrations/summary")
  return result.data || []
}

// Admin: Get registrations for a specific event
export async function getRegistrationsByEvent(eventId) {
  const result = await adminRequest(`registrations/event/${eventId}`)
  return result
}

// Admin: Delete a registration
export async function deleteRegistration(registrationId) {
  return await adminRequest(`registrations/${registrationId}`, {
    method: "DELETE",
  })
}
