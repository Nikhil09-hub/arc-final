import { adminRequest } from "./adminApi"

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

export async function createCashfreeOrder(payload, { adminOnly = false } = {}) {
  if (adminOnly) {
    return adminRequest("payments/cashfree/admin/create-order", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  }

  const response = await fetch(`${API_URL}/payments/cashfree/create-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(result?.message || "Unable to create a payment order.")
    error.status = response.status
    error.data = result
    throw error
  }

  return result
}

export async function verifyCashfreePayment(payload) {
  const response = await fetch(`${API_URL}/payments/cashfree/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const result = await response.json().catch(() => null)

  if (!response.ok) {
    const error = new Error(result?.message || "Unable to verify payment.")
    error.status = response.status
    error.data = result
    throw error
  }

  return result
}
