"use client"

import React, { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Table, Modal, Button } from 'react-bootstrap';
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

  const [filterStatus, setFilterStatus] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [complaints, setComplaints] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // ================= FETCH =================
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

  useEffect(() => {
    fetchComplaints();

    // 🔥 AUTO REFRESH
    const interval = setInterval(fetchComplaints, 5000);
    return () => clearInterval(interval);
  }, []);

  // ================= FILTER =================
  const finalComplaints = useMemo(() => {
    return complaints.filter((c: any) => {

      const matchesSearch = searchId
        ? c.complaintId?.toLowerCase().includes(searchId.toLowerCase())
        : true;

      const matchesStatus =
        filterStatus === "All" ? true : c.status === filterStatus;

      const matchesPriority =
        priorityFilter === "All" ? true : c.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [complaints, searchId, filterStatus, priorityFilter]);

  // ================= SORT =================
  const sortedComplaints = [...finalComplaints].sort((a: any, b: any) => {
    const order: any = { High: 3, Medium: 2, Low: 1 };
    return (order[b.priority] || 0) - (order[a.priority] || 0);
  });

  // ================= PRIORITY DATA 🔥 =================
  const priorityData = {
    labels: ["High", "Medium", "Low"],
    datasets: [{
      data: [
        complaints.filter((c:any)=>c.priority==="High").length,
        complaints.filter((c:any)=>c.priority==="Medium").length,
        complaints.filter((c:any)=>c.priority==="Low").length
      ],
      backgroundColor: ["#dc3545","#ffc107","#28a745"]
    }]
  };

  // ================= CATEGORY PIE =================
  const pieData = useMemo(() => {
    const categoryCount: any = {};

    complaints.forEach((c: any) => {
      const cat = c.category || "Others";
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    });

    return {
      labels: Object.keys(categoryCount),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"]
      }]
    };
  }, [complaints]);

  // ================= BAR =================
  const barData = useMemo(() => {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const received = new Array(12).fill(0);
    const resolved = new Array(12).fill(0);

    complaints.forEach((c: any) => {
      const d = c.createdAt ? new Date(c.createdAt) : null;
      if (!d || isNaN(d.getTime())) return;

      const m = d.getMonth();
      received[m] += 1;
      if (c.status === "Resolved") resolved[m] += 1;
    });

    return {
      labels: months,
      datasets: [
        { label: "Received", data: received, backgroundColor: "#4e73df" },
        { label: "Resolved", data: resolved, backgroundColor: "#1cc88a" }
      ]
    };
  }, [complaints]);

  // ================= ACTION =================
  const markResolved = async (id: string) => {
    try {
      await axios.put(`http://localhost:5000/api/complaints/${id}`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="container-fluid px-4">

      <h1 className="h3 mt-4 mb-4">Admin Dashboard</h1>
        {complaints.some((c:any)=>c.priority==="High") && (
        <div className="alert alert-danger fw-bold">
          🚨 High Priority Complaints Present — Immediate Attention Required
        </div>
      )}

      {/* ================= CARDS ================= */}
      <Row>
        <Col lg={3}><Card><Card.Body><h6>Total</h6><h4>{complaints.length}</h4></Card.Body></Card></Col>
        <Col lg={3}><Card><Card.Body><h6>Pending</h6><h4>{complaints.filter((c:any)=>c.status==="Pending").length}</h4></Card.Body></Card></Col>
        <Col lg={3}><Card><Card.Body><h6>Resolved</h6><h4>{complaints.filter((c:any)=>c.status==="Resolved").length}</h4></Card.Body></Card></Col>
        <Col lg={3}><Card><Card.Body><h6>High</h6><h4>{complaints.filter((c:any)=>c.priority==="High").length}</h4></Card.Body></Card></Col>
        <Col lg={3}><Card><Card.Body><h6>Medium</h6><h4>{complaints.filter((c:any)=>c.priority==="Medium").length}</h4></Card.Body></Card></Col>
        <Col lg={3}><Card><Card.Body><h6>Low</h6><h4>{complaints.filter((c:any)=>c.priority==="Low").length}</h4></Card.Body></Card></Col>
      </Row>

      {/* ================= CHARTS ================= */}
      <Row className="mt-4">
        <Col lg={4}><Card><Card.Body><h6>Priority Distribution</h6><Pie data={priorityData} /></Card.Body></Card></Col>
        <Col lg={4}><Card><Card.Body><h6>Category Distribution</h6><Pie data={pieData} /></Card.Body></Card></Col>
        <Col lg={4}><Card><Card.Body><Bar data={barData} /></Card.Body></Card></Col>
      </Row>

      {/* ================= FILTERS ================= */}
      <div className="d-flex gap-2 mt-4 flex-wrap">

        {["All","Pending","Resolved"].map(s=>(
          <button key={s}
            className={`btn ${filterStatus===s?"btn-primary":"btn-outline-primary"}`}
            onClick={()=>setFilterStatus(s)}>
            {s}
          </button>
        ))}

        {["All","High","Medium","Low"].map(p=>(
          <button key={p}
            className={`btn ${priorityFilter===p?"btn-dark":"btn-outline-dark"}`}
            onClick={()=>setPriorityFilter(p)}>
            {p}
          </button>
        ))}

        <input
          placeholder="Search ID..."
          value={searchId}
          onChange={(e)=>setSearchId(e.target.value)}
          className="form-control"
          style={{maxWidth:200}}
        />
      </div>

      {/* ================= TABLE ================= */}
      <Card className="mt-3">
        <Card.Body>

          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>Description</th>
                <th>Name</th>
                <th>Category</th>
                <th>City</th>
                <th>Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th>File</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {sortedComplaints.map((c:any,index)=>(
                <tr
                    key={c._id}
                    className={
                      c.status === "Resolved"
                        ? "table-success"
                        : c.priority === "High"
                        ? "table-danger high-row"
                        : c.priority === "Medium"
                        ? "table-warning"
                        : ""
                    }
                    style={{
                      borderLeft:
                        c.status === "Resolved"
                          ? "5px solid green"
                          : c.priority === "High"
                          ? "5px solid red"
                          : c.priority === "Medium"
                          ? "5px solid orange"
                          : "5px solid green"
                    }}
                  >

                  <td>{index+1}</td>
                  <td>{c.complaintId}</td>

                  <td onClick={()=>{setSelectedComplaint(c);setShowModal(true)}} style={{cursor:"pointer"}}>
                    {c.description?.slice(0,30)}...
                  </td>

                  <td>{c.name}</td>
                  <td><span className="badge bg-secondary">{c.category}</span></td>
                  <td>{c.city}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>

                  <td>
                    <span className={`badge px-3 py-2 ${
                      c.priority==="High"?"bg-danger":
                      c.priority==="Medium"?"bg-warning text-dark":
                      "bg-success"
                    }`}>
                      {c.priority === "High" ? "⚠️ HIGH" : c.priority}
                    </span>
                  </td>

                  <td>
                    <span className={`badge ${
                      c.status==="Pending"?"bg-warning text-dark":"bg-success"
                    }`}>
                      {c.status}
                    </span>
                  </td>

                  <td>
                    {c.file ? (
                      /\.(jpg|jpeg|png)$/i.test(c.file) ? (
                        <img src={`http://localhost:5000/uploads/${c.file}`} style={{width:50,height:50}} />
                      ) : (
                        <a href={`http://localhost:5000/uploads/${c.file}`} target="_blank">View</a>
                      )
                    ) : "No File"}
                  </td>

                  <td>
                    {c.status!=="Resolved" ? (
                      <button className="btn btn-sm btn-primary" onClick={()=>markResolved(c._id)}>
                        Resolve
                      </button>
                    ) : "Done"}
                  </td>

                </tr>
              ))}
            </tbody>
          </Table>

        </Card.Body>
      </Card>

      {/* ================= MODAL ================= */}
      <Modal show={showModal} onHide={()=>setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Complaint Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p><b>Name:</b> {selectedComplaint?.name}</p>
          <p><b>Category:</b> {selectedComplaint?.category}</p>
          <p><b>City:</b> {selectedComplaint?.city}</p>
          <p><b>Description:</b> {selectedComplaint?.description}</p>
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={()=>setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Dashboard;