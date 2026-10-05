import { adminRequest } from "./adminApi"

const API_URL = import.meta.env.VITE_API_URL;

export const getEvents = async (status = "") => {
  try {
    const url = status
      ? `${API_URL}/events?status=${status}`
      : `${API_URL}/events`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch events (${response.status})`);
    }

    const result = await response.json();

    return result.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const getEventById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/events/${id}`);

    if (!response.ok) {
      throw new Error("Event not found");
    }

    const result = await response.json();

    return result.data;
  } catch (error) {
    console.error("Error fetching event:", error);
    throw error;
  }
};

export const getAdminEvents = async () => {
  const result = await adminRequest("events/admin")
  return result.data
}

export const getAdminEventBySlug = async (slug) => {
  const result = await adminRequest(`events/admin/slug/${encodeURIComponent(slug)}`)
  return result.data
}

export const getEventBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/events/slug/${slug}`);

    if (!response.ok) {
      throw new Error("Event not found");
    }

    const result = await response.json();

    return result.data;
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    throw error;
  }
};