"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { Modal, Button } from "react-bootstrap";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
  const [filterStatus, setFilterStatus] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ✅ FETCH DATA
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints");
        setComplaints(res.data);
        setFilteredComplaints(res.data); // 🔥 important
      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  // ✅ SEARCH FILTER
  useEffect(() => {
    if (!searchId) {
      setFilteredComplaints(complaints);
    } else {
      const filtered = complaints.filter((c: any) =>
        c.complaintId?.toLowerCase().includes(searchId.toLowerCase())
      );
      setFilteredComplaints(filtered);
    }
  }, [searchId, complaints]);

  // ✅ PIE DATA
  const pieData = useMemo(() => {
    const categoryCount: any = {};

    complaints.forEach((c: any) => {
      const cat = c.category || "Others";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCount),
      datasets: [
        {
          data: Object.values(categoryCount),
          backgroundColor: [
            "#4e73df",
            "#1cc88a",
            "#36b9cc",
            "#f6c23e",
            "#e74a3b"
          ]
        }
      ]
    };
  }, [complaints]);

  // ✅ BAR DATA
  const barData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const received = new Array(12).fill(0);
    const resolved = new Array(12).fill(0);

    complaints.forEach((c: any) => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      if (!d || isNaN(d.getTime())) return;

      const month = d.getMonth();
      received[month] += 1;

      if (c.status === "Resolved") {
        resolved[month] += 1;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: "Received",
          data: received,
          backgroundColor: "#4e73df"
        },
        {
          label: "Resolved",
          data: resolved,
          backgroundColor: "#1cc88a"
        }
      ]
    };
  }, [complaints]);

  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // ✅ MARK RESOLVED
  const markResolved = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`);
      const res = await axios.get("http://localhost:5000/api/complaints");
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container-fluid px-4">
      <h1 className="h3 mb-4 mt-4 text-gray-800">Admin Dashboard</h1>

      {/* CARDS */}
      <Row>
        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Body>
              <h6>Total Complaints</h6>
              <h4>{complaints.length}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Body>
              <h6>Pending</h6>
              <h4>{complaints.filter((c: any) => c.status === "Pending").length}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Body>
              <h6>Resolved</h6>
              <h4>{complaints.filter((c: any) => c.status === "Resolved").length}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CHARTS */}
      <Row>
        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Header>Category</Card.Header>
            <Card.Body>
              <Pie data={pieData} />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow mb-4">
            <Card.Header>Trend</Card.Header>
            <Card.Body>
              <Bar data={barData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* TABLE + SEARCH */}
      <Card className="shadow mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Recent Complaints</span>

          {/* 🔍 SEARCH BOX */}
          <input
            type="text"
            placeholder="Search by Complaint ID..."
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="form-control"
            style={{ maxWidth: "300px" }}
          />
        </Card.Header>

        <Card.Body>
          <div style={{ marginBottom: "15px", display: "flex", gap: "10px" }}>

  <button
    className={`btn ${filterStatus === "All" ? "btn-primary" : "btn-outline-primary"}`}
    onClick={() => setFilterStatus("All")}
  >
    All
  </button>

  <button
    className={`btn ${filterStatus === "Pending" ? "btn-warning" : "btn-outline-warning"}`}
    onClick={() => setFilterStatus("Pending")}
  >
    Pending
  </button>

  <button
    className={`btn ${filterStatus === "Resolved" ? "btn-success" : "btn-outline-success"}`}
    onClick={() => setFilterStatus("Resolved")}
  >
    Resolved
  </button>

</div>
          <Table striped bordered hover responsive>
  <thead className="table-light">
    <tr>
      <th>#</th>
      <th>Complaint ID</th>
      <th>Complaint</th>
      <th>Name</th>
      <th>Category</th>
      <th>City</th>
      <th>Date</th>
      <th>Priority</th>
      <th>Status</th>
      <th>File</th> {/* ✅ NEW */}
      <th>Action</th>
    </tr>
  </thead>

  <tbody>
    {filteredComplaints
  .filter((c: any) => {
    if (filterStatus === "All") return true;
    return c.status === filterStatus;
  })
  .map((c: any, index: number) => (
      <tr key={c._id}>

  <td>{index + 1}</td>

  <td className="fw-semibold text-primary">
    {c.complaintId || "N/A"}
  </td>

  {/* ✅ COMPLAINT TEXT */}
  <td style={{ maxWidth: "200px" }}>
  {c.description ? (
    <span
      style={{ cursor: "pointer", color: "#007bff" }}
      onClick={() => {
        setSelectedComplaint(c);
        setShowModal(true);
      }}
    >
      {c.description.length > 30
        ? c.description.substring(0, 30) + "..."
        : c.description}
    </span>
  ) : (
    <span className="text-muted">No Description</span>
  )}
</td>

  {/* NAME */}
  <td>{c.name}</td>

  {/* CATEGORY */}
  <td>
    <span className="badge bg-secondary">
      {c.category}
    </span>
  </td>

  <td>{c.city}</td>

  <td>
    {c.createdAt
      ? new Date(c.createdAt).toLocaleDateString()
      : "N/A"}
  </td>

  <td>
    <span className={`badge ${
      c.priority === "High"
        ? "bg-danger"
        : c.priority === "Medium"
        ? "bg-warning text-dark"
        : "bg-success"
    }`}>
      {c.priority || "Low"}
    </span>
  </td>

  <td>
    <span className={`badge ${
      c.status === "Pending"
        ? "bg-warning text-dark"
        : "bg-success"
    }`}>
      {c.status}
    </span>
  </td>

  {/* 🔥 FILE COLUMN (IMAGE PREVIEW) */}
  <td>
    {c.file ? (
      /\.(jpg|jpeg|png|webp)$/i.test(c.file) ? (
        <img
          src={`http://localhost:5000/uploads/${c.file}`}
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "6px",
            cursor: "pointer"
          }}
          onClick={() =>
            window.open(`http://localhost:5000/uploads/${c.file}`, "_blank")
          }
        />
      ) : (
        <a
          href={`http://localhost:5000/uploads/${c.file}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-outline-info"
        >
          View
        </a>
      )
    ) : (
      <span className="text-muted">No File</span>
    )}
  </td>

  <td>
    {c.status !== "Resolved" ? (
      <button
        onClick={() => markResolved(c._id)}
        className="btn btn-sm btn-outline-primary"
      >
        Resolve
      </button>
    ) : (
      <span className="text-success fw-semibold">
        Done
      </span>
    )}
  </td>

</tr>
    ))}
  </tbody>
</Table>
<Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Complaint Details</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <p><strong>Name:</strong> {selectedComplaint?.name}</p>
    <p><strong>Category:</strong> {selectedComplaint?.category}</p>
    <p><strong>City:</strong> {selectedComplaint?.city}</p>

    <hr />

    <p><strong>Description:</strong></p>
    <p style={{ whiteSpace: "pre-line" }}>
      {selectedComplaint?.description}
    </p>
  </Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Close
    </Button>
  </Modal.Footer>
</Modal>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;