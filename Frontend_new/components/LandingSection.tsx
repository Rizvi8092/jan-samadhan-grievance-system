"use client"

import type React from "react"
import Image from "next/image"
import { motion } from "framer-motion"

const LandingSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-800 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <motion.div
            className="md:w-1/2 mb-8 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Welcome to JanSamadhan
            </motion.h1>
            <motion.h2
              className="text-2xl md:text-3xl font-semibold mb-6 text-blue-200"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Public Grievance System
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-gray-300"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Your platform for efficient government grievance redressal
            </motion.p>
          </motion.div>
          <motion.div
            className="md:w-1/2 flex justify-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            whileHover={{ scale: 1.1 }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/grievance.jpg-poAh6tF3S7OnOXgS6IvUTAO6s5ArOZ.jpeg"
              alt="Samadhan Logo"
              width={300}
              height={300}
              className="object-contain"
            />
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default LandingSection

