import { adminRequest } from "./adminApi"

export async function getAllEventDocuments() {
  const result = await adminRequest("event-documents")
  return result.data
}

export async function getEventDocuments(eventId) {
  const result = await adminRequest(`event-documents/${eventId}`)
  return { event: result.event, documents: result.data }
}

export async function createEventDocument(data) {
  return adminRequest("event-documents", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateEventDocument(id, data) {
  return adminRequest(`event-documents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteEventDocument(id) {
  return adminRequest(`event-documents/${id}`, { method: "DELETE" })
}