"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.post(
          "http://localhost:5000/api/my-complaints",
          { token }
        );

        setComplaints(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">My Complaints</h1>

      {complaints.length === 0 ? (
        <p>No complaints found</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c: any) => (
            <div
              key={c._id}
              className="p-4 border rounded-lg shadow-sm"
            >
              <p><strong>ID:</strong> {c.complaintId}</p>
              <p><strong>Category:</strong> {c.category}</p>
              <p><strong>Status:</strong> {c.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}