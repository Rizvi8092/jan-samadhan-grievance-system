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

  // ✅ FETCH DATA
  useEffect(() => {
    axios.get("http://localhost:5000/complaints")
      .then((res) => {
        setComplaints(res.data);
      })
      .catch((err) => {
        console.error("Error fetching complaints:", err);
      });
  }, []);

  // ✅ PIE DATA (CATEGORY)
  const getPieData = () => {
    const categoryCount = {};

    complaints.forEach((c) => {
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
  };

  // ✅ BAR DATA (MONTHLY)
  const getBarData = () => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

    const received = new Array(12).fill(0);
    const resolved = new Array(12).fill(0);

    complaints.forEach((c) => {
      if (!c.date) return;

      const d = new Date(c.date);
      if (isNaN(d)) return;

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
  };

  // ✅ OPTIMIZE (VERY IMPORTANT)
  const pieData = useMemo(() => getPieData(), [complaints]);
  const barData = useMemo(() => getBarData(), [complaints]);

  // ✅ LOADING FIX (CORRECT PLACE)
  if (!complaints.length) {
    return <p className="text-center mt-10">Loading...</p>;
  }
const markResolved = async (id) => {
  try {
    await axios.put(`http://localhost:5000/complaints/${id}`);

    // refresh data
    const res = await axios.get("http://localhost:5000/complaints");
    setComplaints(res.data);
  } catch (err) {
    console.error(err);
  }
};
  // ✅ STATUS COLOR
  const getStatusColor = (status) => {
    if (status === "Pending") return "warning";
    if (status === "Resolved") return "success";
    return "danger";
  };

  return (
    <div className="container-fluid px-4">
      <h1 className="h3 mb-4 mt-4 text-gray-800">Dashboard</h1>

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
              <h4>{complaints.filter(c => c.status === "Pending").length}</h4>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="shadow mb-4">
            <Card.Body>
              <h6>Resolved</h6>
              <h4>{complaints.filter(c => c.status === "Resolved").length}</h4>
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
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>City</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((c, index) => (
                <tr key={c.complaint_id}>
                  <td>{index + 1}</td>
                  <td>{c.name}</td>
                  <td>{c.category}</td>
                  <td>{c.city}</td>
                  <td>{c.description}</td>
                  <td>
                    <Badge bg={getStatusColor(c.status)}>
                      {c.status}
                    </Badge>

                    {/* ✅ ADD BUTTON HERE */}
                    {c.status !== "Resolved" && (
                      <button
                        style={{ marginLeft: "10px", padding: "5px 10px" }}
                        onClick={() => markResolved(c.complaint_id)}
                      >
                        Resolve
                      </button>
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