import "./App.css"

import {
  BrowserRouter,
  Routes,
  Route,
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
import GalleryPage from "./pages/GalleryPage"
import AdminGalleryPage from "./pages/AdminGalleryPage"
import AlumniPage from "./pages/AlumniPage"


function Home() {
  return (
    <main>
      <Hero />
      <About />
      <WhatWeDo />
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <CustomCursor />
      <ClickBurst />

      <div className="pt-[88px]">
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
          <Route
            path="/admin/gallery"
            element={<AdminGalleryPage />}
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
export default App