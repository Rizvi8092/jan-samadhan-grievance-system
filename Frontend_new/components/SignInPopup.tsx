"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import axios from "axios"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons"

interface SignInPopupProps {
  onClose: () => void
}

const SignInPopup: React.FC<SignInPopupProps> = ({ onClose }) => {
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

  // 🔐 SEND OTP
  const handleSendOtp = async () => {
    if (!email) {
      alert("Please enter email")
      return
    }

    try {
      await axios.post("http://localhost:5000/api/send-otp", { email })

      setOtpSent(true)
      setShowOtpInput(true)
      setTimer(300)

      alert("OTP sent to your email")
    } catch (err) {
      console.error(err)
      alert("Error sending OTP")
    }
  }

  // ✅ VERIFY OTP (NO ROLE LOGIC NOW)
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
        alert("Login successful")

        setOtp("")
        onClose()

        // 👉 simple redirect
        router.push("/dashboard")
      }

    } catch (err: any) {
      console.error(err)
      alert(err.response?.data?.message || "Invalid OTP")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Sign In / Sign Up
        </h2>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded mb-4"
            required
          />

          {/* SEND OTP */}
          <button
            type="button"
            onClick={handleSendOtp}
            className="w-full bg-indigo-600 text-white py-2 rounded mb-4"
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
                className="w-full px-3 py-2 border rounded mb-2"
              />

              <p className="text-sm text-gray-500 mb-3">
                Time remaining: {Math.floor(timer / 60)}:
                {timer % 60 < 10 ? "0" : ""}
                {timer % 60}
              </p>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded"
              >
                Verify & Login
              </button>
            </>
          )}

          {/* CLOSE */}
          <button
            type="button"
            onClick={onClose}
            className="mt-4 w-full text-gray-600"
          >
            Close
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default SignInPopup