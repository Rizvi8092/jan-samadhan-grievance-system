"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"

export default function TrackPage() {
  const router = useRouter()

  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      alert("Please login first")
      router.push("/")
      return
    }

    fetchComplaints(token)
  }, [])

  const fetchComplaints = async (token: string) => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/my-complaints",
        { token }
      )

      setComplaints(res.data)

    } catch (err: any) {

      // 🔥 HANDLE TOKEN EXPIRED / INVALID
      if (err.response?.status === 401) {
        localStorage.removeItem("token")
        alert("Session expired. Please login again")
        router.push("/")
        return
      }

      console.log("ERROR:", err)
      alert(err.response?.data?.message || "Error fetching complaints")

    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center pt-10">
      <div className="w-full max-w-3xl">

        <h2 className="text-3xl font-bold mb-6 text-center">
          My Complaints
        </h2>

        {/* 🔄 LOADING */}
        {loading ? (
          <p className="text-center text-gray-500">
            Loading complaints...
          </p>
        ) : complaints.length === 0 ? (
          <p className="text-center text-gray-500">
            No complaints found
          </p>
        ) : (
          complaints.map((c) => (
            <div
              key={c._id}
              className="bg-white p-5 mb-4 rounded-lg shadow-md border"
            >

              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">
                  ID: {c.complaintId}
                </p>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    c.status === "Resolved"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {c.status || "Pending"}
                </span>
              </div>

              <p><b>Category:</b> {c.category}</p>
              <p><b>Description:</b> {c.description}</p>

            </div>
          ))
        )}

      </div>
    </div>
  )
}