"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faPaperclip } from "@fortawesome/free-solid-svg-icons"
import axios from "axios"

// ✅ Proper Type
type FormDataType = {
  name: string
  email: string
  phoneNo: string
  aadharNumber: string
  city: string
  date: string
  description: string
  file: File | null
}

const FileComplaint: React.FC = () => {
  const [showSuccessPopup, setShowSuccessPopup] = useState(false)

  // ✅ Typed state
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    email: "",
    phoneNo: "",
    aadharNumber: "",
    city: "",
    category: "",
    date: "",
    description: "",
    file: null,
  })

  // ✅ Fixed file handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    setFormData((prevData) => ({
      ...prevData,
      file,
    }))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const data = {
        name: formData.name,
        email: formData.email,
        phoneNo: formData.phoneNo,
        aadharNumber: formData.aadharNumber,
        city: formData.city,
        category: formData.category,
        date: formData.date,
        description: formData.description,
      }

      console.log("Submitting complaint:", data)

      const response = await axios.post(
        "http://localhost:5000/complaints",
        data
      )

      console.log("RESPONSE:", response.data)

      if (response.status === 200 || response.status === 201) {
        setShowSuccessPopup(true)

        setTimeout(() => {
          setShowSuccessPopup(false)
        }, 3000)
      }
    } catch (error) {
      console.error("Error submitting complaint:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <Image
              className="h-48 w-full object-cover md:w-48"
              src="/placeholder.svg?height=300&width=300"
              alt="Complaint Image"
              width={300}
              height={300}
            />
          </div>

          <div className="p-8 w-full">
            <motion.h2 className="text-3xl font-bold text-gray-900 mb-6">
              File a Complaint
            </motion.h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {["name", "email", "phoneNo", "aadharNumber", "city", "date"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-700">
                    {field}
                  </label>
                  <input
                    type={field === "date" ? "date" : "text"}
                    name={field}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300"
                    value={formData[field as keyof FormDataType] as string}
                    onChange={handleChange}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="CM Office">CM Office</option>
                  <option value="Municipal">Municipal</option>
                  <option value="Police">Police</option>
                  <option value="Development Authority">Development Authority</option>
                  <option value="Public Works Department">Public Works Department</option>
                </select>
              </div>
              <textarea
                name="description"
                placeholder="Description"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full border p-2"
              />

              <input type="file" onChange={handleFileChange} />

              <button
                type="submit"
                className="w-full bg-green-600 text-white p-3 rounded"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      </motion.div>

      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded">
            Complaint Submitted Successfully!
          </div>
        </div>
      )}
    </div>
  )
}

export default FileComplaint