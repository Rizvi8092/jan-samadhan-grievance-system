"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"

const SignUp: React.FC = () => {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [showOtpInput, setShowOtpInput] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [timer, setTimer] = useState(300)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [otpSent, timer])

  // 🔐 Send OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter email first")
      return
    }

    try {
      await axios.post("http://localhost:5000/api/send-otp", { email })

      setOtpSent(true)
      setShowOtpInput(true)
      setTimer(300)

      alert("OTP sent to your email")

    } catch (err) {
      alert("Error sending OTP")
    }
  }

  // ✅ Verify OTP + Login
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp) {
      alert("Enter OTP")
      return
    }

    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", {
        email,
        otp
      })

      if (res.data.success) {
        localStorage.setItem("token", res.data.token) // 🔥 LOGIN

        alert("Login successful")
        router.push("/track")
      }

    } catch (err) {
      alert("Invalid OTP")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md"
      >
        <h2 className="text-center text-3xl font-bold">Sign In</h2>

        <form className="space-y-6" onSubmit={handleSubmit}>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />

          {/* SEND OTP */}
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-indigo-600 text-white py-2 rounded-md"
          >
            <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
            Send OTP
          </button>

          {/* OTP INPUT */}
          {showOtpInput && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />

              <p className="text-sm text-gray-500">
                Time remaining: {Math.floor(timer / 60)}:
                {timer % 60 < 10 ? "0" : ""}
                {timer % 60}
              </p>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded-md"
              >
                Verify & Login
              </button>
            </>
          )}

        </form>
      </motion.div>
    </div>
  )
}

export default SignUp