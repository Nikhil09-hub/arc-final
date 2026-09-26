import "./App.css"
import { useEffect } from "react"

import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom"

import CustomCursor from "./components/CustomCursor"
import ClickBurst from "./components/ClickBurst"
import Navbar from "./components/Navbar"

import Hero from "./components/Hero"
import About from "./components/About"
import WhatWeDo from "./components/WhatWeDo"

import EventsPage from "./pages/EventsPage"
import EventDetails from "./pages/EventDetails"
import TeamPage from "./pages/TeamPage"
import AdminLoginPage from "./pages/AdminLoginPage"
import AdminDashboardPage from "./pages/AdminDashboardPage"
import AdminEventsPage from "./pages/AdminEventsPage"
import AdminEventFormPage from "./pages/AdminEventFormPage"
import GalleryPage from "./pages/GalleryPage"
import AdminGalleryPage from "./pages/AdminGalleryPage"
import AdminEventDocumentsPage, { AdminEventDocumentsDetailPage } from "./pages/AdminEventDocumentsPage"
import AlumniPage from "./pages/AlumniPage"
import AdminLayout from "./components/AdminLayout"
import ProtectedAdminRoute from "./components/ProtectedAdminRoute"


function Home() {
  return (
    <main>
      <Hero />
      <About />
      <WhatWeDo />
    </main>
  )
}

function AppRoutes() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith("/admin")

  useEffect(() => {
    const path = location.pathname
    let title = "VJ ARC | AI Research & Coding"

    if (path === "/" && location.hash === "#about") {
      title = "About | VJ ARC"
    } else if (path === "/" && location.hash === "#what-we-do") {
      title = "What We Do | VJ ARC"
    } else if (path === "/events") {
      title = "Events | VJ ARC"
    } else if (path.match(/^\/events\/[^/]+\/?$/)) {
      const slug = path.split("/").filter(Boolean).at(-1)
      title = `${decodeURIComponent(slug).replaceAll("-", " ")} | VJ ARC`
    } else if (path === "/team") {
      title = "Team | VJ ARC"
    } else if (path === "/gallery") {
      title = "Gallery | VJ ARC"
    } else if (path === "/alumni") {
      title = "Alumni | VJ ARC"
    } else if (path === "/admin/login") {
      title = "Admin Login | VJ ARC"
    } else if (path === "/admin") {
      title = "Admin Dashboard | VJ ARC"
    } else if (path === "/admin/events/create") {
      title = "Create Event | VJ ARC"
    } else if (path.startsWith("/admin/events/edit/")) {
      title = "Edit Event | VJ ARC"
    } else if (path.startsWith("/admin/events")) {
      title = "Manage Events | VJ ARC"
    } else if (path.startsWith("/admin/gallery")) {
      title = "Manage Gallery | VJ ARC"
    } else if (path.startsWith("/admin/event-documents")) {
      title = "Event Documents | VJ ARC"
    }

    document.title = title
  }, [location.pathname, location.hash])

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <CustomCursor />
      <ClickBurst />

      <div className={isAdminRoute ? "" : "pt-[88px]"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/events/:slug"
            element={<EventDetails />}
          />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/alumni" element={<AlumniPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="events" element={<AdminEventsPage />} />
              <Route path="events/create" element={<AdminEventFormPage />} />
              <Route path="events/edit/:id" element={<AdminEventFormPage />} />
              <Route path="gallery" element={<AdminGalleryPage />} />
              <Route path="event-documents" element={<AdminEventDocumentsPage />} />
              <Route path="event-documents/:eventId" element={<AdminEventDocumentsDetailPage />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App