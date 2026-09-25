import { adminRequest } from "./adminApi"

const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "")

export const GALLERY_CATEGORIES = [
  "hackathons",
  "workshops",
  "coding-events",
  "other-activities",
]

export const OTHER_GALLERY_OPTION = "__other_gallery__"
export const OTHER_GALLERY_EVENT_NAME = "Other"

export async function getGalleryPhotos() {
  const response = await fetch(`${API_URL}/gallery`)
  const result = await response.json().catch(() => null)

  if (!response.ok || !result?.success) {
    throw new Error(result?.message || "Unable to load gallery")
  }

  return result.data
}

export async function createGalleryImage(payload) {
  return adminRequest("gallery", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function updateGalleryImage(id, payload) {
  return adminRequest(`gallery/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export async function deleteGalleryImage(id) {
  return adminRequest(`gallery/${id}`, { method: "DELETE" })
}

export async function deleteGalleryImages(ids) {
  const results = await Promise.allSettled(ids.map(deleteGalleryImage))
  return results.reduce(
    (summary, result, index) => {
      if (result.status === "fulfilled") summary.deletedIds.push(ids[index])
      else summary.failedIds.push(ids[index])
      return summary
    },
    { deletedIds: [], failedIds: [] }
  )
}

export function uploadGalleryImage(file, onProgress) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    return Promise.reject(new Error("Cloudinary upload is not configured"))
  }

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest()
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    request.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`)
    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100))
    })
    request.addEventListener("error", () => reject(new Error("Cloudinary upload failed. Check your connection.")))
    request.addEventListener("abort", () => reject(new Error("Cloudinary upload was cancelled")))
    request.addEventListener("load", () => {
      let result
      try {
        result = JSON.parse(request.responseText)
      } catch {
        reject(new Error("Cloudinary returned an invalid response"))
        return
      }

      if (request.status < 200 || request.status >= 300 || !result.secure_url) {
        reject(new Error(result.error?.message || "Cloudinary upload failed"))
        return
      }

      resolve(result.secure_url)
    })
    request.send(formData)
  })
}