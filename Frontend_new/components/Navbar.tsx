"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

const Navbar: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false)
  const navItems = [
    { name: "About Us", href: "/#about-us" },
    { name: "File a Complaint", href: "/file-complaint" },
    { name: "Track a Complaint", href: "/track-complaint" },
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

  return (
    <nav className="bg-gradient-to-r from-white to-gray-100 shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <motion.span
                  className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600"
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  initial={{ scale: 1 }}
                  animate={{
                    scale: isHovered ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  JanSamadhan
                </motion.span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium relative group"
                    onClick={(e) => handleClick(e, item.href)}
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="bg-gray-100 rounded-full py-1 px-3 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-600 absolute right-2 top-1/2 transform -translate-y-1/2" />
            </div>
            <Link
              href="/signup"
              className="ml-4 text-gray-800 hover:bg-gray-200 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign In / Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

