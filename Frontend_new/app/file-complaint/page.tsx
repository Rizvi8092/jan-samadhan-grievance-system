"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import axios from "axios"

type FormDataType = {
  name: string
  phoneNo: string
  aadharNumber: string
  city: string
  category: string
  date: string
  description: string
  file: File | null
}

const FileComplaint: React.FC = () => {

  // ✅ NEW success message state
  const [successMessage, setSuccessMessage] = useState("")
  const [filterStatus, setFilterStatus] = useState("All");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    phoneNo: "",
    aadharNumber: "",
    city: "",
    category: "",
    date: "",
    description: "",
    file: null,
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;

  if (!file) return;

  // validate image
  if (!file.type.startsWith("image/")) {
    alert("Only image allowed");
    return;
  }

  setFormData((prev) => ({
    ...prev,
    file,
  }));

  // 🔥 SET PREVIEW
  setPreviewUrl(URL.createObjectURL(file));
};

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  try {
    const form = new FormData()

    form.append("name", formData.name)
    form.append("phoneNo", formData.phoneNo)
    form.append("aadharNumber", formData.aadharNumber)
    form.append("city", formData.city)
    form.append("category", formData.category)
    form.append("date", formData.date)
    form.append("description", formData.description)

    if (formData.file) {
      form.append("file", formData.file)
    }

    form.append("token", localStorage.getItem("token") || "")

    const response = await axios.post(
      "http://localhost:5000/api/complaints",
      form,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )

    if (response.data.complaintId) {
      setSuccessMessage(
        `Complaint submitted successfully! ID: ${response.data.complaintId}`
      )

      setTimeout(() => setSuccessMessage(""), 4000)
    }

  } catch (err: any) {
    alert(err.response?.data?.message || "Error submitting complaint")
  }
}

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden"
      >
        <div className="md:flex">
          <Image
            className="h-48 w-full object-cover md:w-48"
            src="/placeholder.svg"
            alt="Complaint"
            width={300}
            height={300}
          />

          <div className="p-8 w-full">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              File a Complaint
            </h2>

            {/* ✅ SUCCESS DIV */}
            {successMessage && (
              <div className="mb-4 p-4 rounded-lg bg-green-50 border border-green-300 text-green-800 shadow-sm">
                ✅ {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* INPUTS */}
              {[
                { name: "name", label: "Name", placeholder: "Enter your name" },
                { name: "phoneNo", label: "Phone Number", placeholder: "Enter phone number" },
                { name: "aadharNumber", label: "Aadhar Number", placeholder: "Enter Aadhar number" },
                { name: "city", label: "City", placeholder: "Enter your city" },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    name={field.name}
                    placeholder={field.placeholder}
                    value={formData[field.name as keyof FormDataType] as string}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 px-3 py-2 rounded placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              {/* DATE */}
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* CATEGORY */}
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="CM Office">CM Office</option>
                <option value="Municipal">Municipal</option>
                <option value="Police">Police</option>
                <option value="PWD">Public Works Department</option>
              </select>

              {/* DESCRIPTION */}
              <textarea
                name="description"
                placeholder="Describe your issue..."
                value={formData.description}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-3 py-2 rounded placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

             {/* FILE */}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* ✅ IMAGE PREVIEW (ADD HERE) */}
              {previewUrl && (
                <div style={{ marginTop: "10px", position: "relative", width: "100px" }}>

                  <img
                    src={previewUrl}
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid #ccc"
                    }}
                  />

                  {/* ❌ REMOVE BUTTON */}
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setFormData((prev) => ({ ...prev, file: null }));
                    }}
                    style={{
                      position: "absolute",
                      top: "-5px",
                      right: "-5px",
                      background: "red",
                      color: "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      cursor: "pointer"
                    }}
                  >
                    ×
                  </button>

                </div>
              )}
              {/* SUBMIT */}
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded transition"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default FileComplaint