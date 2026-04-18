"use client"

import { useState } from "react"

import Navbar from "../components/Navbar"
import LandingSection from "../components/LandingSection"
import AboutUs from "../components/AboutUs"
import Carousel from "../components/Carousel"
import UserFeedback from "../components/UserFeedback"
import Footer from "../components/Footer"
import SignInPopup from "../components/SignInPopup" // 🔥 MISSING IMPORT

export default function Home() {

  // 🔥 MISSING STATE
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <Navbar onSignInClick={() => setShowPopup(true)} />

      <LandingSection />
      <AboutUs />

      <div className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Carousel />
        </div>
      </div>

      <UserFeedback />
      <Footer />

      {/* 🔐 SIGNIN POPUP */}
      {showPopup && (
        <SignInPopup onClose={() => setShowPopup(false)} />
      )}

    </div>
  )
}