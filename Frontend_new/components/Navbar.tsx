"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface NavbarProps {
  onSignInClick: () => void
}

const Navbar: React.FC<NavbarProps> = ({ onSignInClick }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const router = useRouter()

  // ✅ check login on load + when storage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token")
      setIsLoggedIn(!!token)
    }

    checkAuth()

    window.addEventListener("storage", checkAuth)
    return () => window.removeEventListener("storage", checkAuth)
  }, [])

  const navItems = [
    { name: "About Us", href: "/#about-us" },
    { name: "File a Complaint", href: "/file-complaint", protected: true },
    { name: "Track a Complaint", href: "/track-complaint", protected: true },
    { name: "Contact Us", href: "/#footer" },
  ]

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      e.preventDefault()
      const element = document.querySelector(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  // 🔐 Protected routes
  const handleProtectedRoute = (e: React.MouseEvent, href: string) => {
    const token = localStorage.getItem("token")

    if (!token) {
      e.preventDefault()
      alert("Please login first")
      onSignInClick()
    } else {
      router.push(href)
    }
  }

  // 🔓 Logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    setIsLoggedIn(false)
    router.push("/") // go back to home
  }

  return (
    <nav className="bg-gradient-to-r from-white to-gray-100 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link href="/">
            <motion.span
              className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              animate={{ scale: isHovered ? 1.05 : 1 }}
            >
              JanSamadhan
            </motion.span>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden md:flex items-center space-x-4">

            {navItems.map((item) => {
              if (item.protected) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleProtectedRoute(e, item.href)}
                    className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {item.name}
                  </a>
                )
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={(e) => handleClick(e, item.href)}
                  className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4">

            {/* SEARCH */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 absolute right-2 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* AUTH SECTION */}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-red-600 font-medium hover:underline ml-4"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={onSignInClick}
                className="text-gray-800 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In / Sign Up
              </button>
            )}

          </div>

        </div>
      </div>
    </nav>
  )
}

export default Navbar