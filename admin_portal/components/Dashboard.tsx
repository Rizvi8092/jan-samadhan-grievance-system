"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Table, Badge } from 'react-bootstrap';
import { Pie, Bar } from 'react-chartjs-2';
import axios from 'axios';

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

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ SIMPLE FETCH (NO AUTH)
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/complaints");

        setComplaints(res.data);

      } catch (err) {
        console.error("Error fetching complaints:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

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

  // ✅ LOADING
  if (loading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  // ✅ MARK RESOLVED (NO AUTH)
  const markResolved = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`);

      const res = await axios.get("http://localhost:5000/api/complaints");
      setComplaints(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ STATUS COLOR
  const getStatusColor = (status: string) => {
    if (status === "Pending") return "warning";
    if (status === "Resolved") return "success";
    return "danger";
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

      {/* TABLE */}
      <Card className="shadow mb-4">
        <Card.Header>Recent Complaints</Card.Header>
        <Card.Body>
          <Table striped bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Complaint ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>City</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
          {complaints.map((c: any, index: number) => (
            <tr key={c._id}>

              <td>{index + 1}</td>

              {/* Complaint ID */}
              <td className="fw-semibold text-primary">
                {c.complaintId || "N/A"}
              </td>

              {/* Name */}
              <td>{c.name}</td>

              {/* Category */}
              <td>
                <span className="badge bg-secondary">
                  {c.category}
                </span>
              </td>

              {/* City */}
              <td>{c.city}</td>

              {/* Date */}
              <td>
                {c.createdAt
                  ? new Date(c.createdAt).toLocaleDateString()
                  : "N/A"}
              </td>

              {/* Priority */}
              <td>
                <span
                  className={`badge ${
                    c.priority === "High"
                      ? "bg-danger"
                      : c.priority === "Medium"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {c.priority || "Low"}
                </span>
              </td>

              {/* Status */}
              <td>
                <span
                  className={`badge ${
                    c.status === "Pending"
                      ? "bg-warning text-dark"
                      : "bg-success"
                  }`}
                >
                  {c.status}
                </span>
              </td>

              {/* Action */}
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
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;