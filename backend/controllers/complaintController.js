const Complaint = require("../models/Complaint");
const axios = require("axios");

// ✅ Submit Complaint
exports.submitComplaint = async (req, res) => {
  try {
    const {
      name,
      phoneNo,
      aadharNumber,
      city,
      category,
      description
    } = req.body;

    const email = req.user.email; // 🔥 FROM JWT

    const complaintId = "JAN" + Date.now();

    // 🔥 AI API
    let department = "General";
    let priority = "Normal";
    let solution = "No suggestion";

    try {
      const aiRes = await axios.post("http://localhost:8000/predict", {
        name,
        description
      });

      department = aiRes.data.department;
      priority = aiRes.data.priority;
      solution = aiRes.data.solution;

    } catch {
      console.log("AI not connected");
    }

    const newComplaint = new Complaint({
      complaintId,
      name,
      email, // ✅ secure
      phoneNo,
      aadharNumber,
      city,
      category,
      description,
      department,
      priority,
      solution,
      status: "Pending"
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted",
      complaintId
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Get All Complaints (Admin)
exports.getAllComplaints = async (req, res) => {
  const data = await Complaint.find().sort({ createdAt: -1 });
  res.json(data);
};

// ✅ Track Complaint
exports.trackComplaint = async (req, res) => {
  try {
    const email = req.user.email; // 🔥 from JWT

    const complaints = await Complaint.find({ email }).sort({ createdAt: -1 });

    res.json(complaints);

  } catch {
    res.status(500).json({ message: "Error fetching complaints" });
  }
};

// ✅ Update Status
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Complaint.findByIdAndUpdate(
      id,
      { status: "Resolved" },
      { returnDocument: "after" }
    );

    res.json(updated); // ✅ FIXED

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};