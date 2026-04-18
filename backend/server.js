require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const app = express();

// =======================
// Middleware
// =======================
app.use(express.json());
app.use(cors());

// =======================
// MongoDB Connection
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/jansamadhan")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log(err));

// =======================
// Schema
// =======================
const complaintSchema = new mongoose.Schema({
  complaintId: String,
  name: String,
  email: String,
  phoneNo: String,
  aadharNumber: String,
  city: String,
  category: String,
  description: String,
  department: String,
  priority: String,
  solution: String,
  status: {
    type: String,
    default: "Pending"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Complaint = mongoose.model("Complaint", complaintSchema);

// =======================
// OTP Store
// =======================
let otpStore = {};

// =======================
// Root
// =======================
app.get("/", (req, res) => {
  res.send("Jan Samadhan Backend Running 🚀");
});

// =======================
// SEND OTP (FIXED)
// =======================
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;   // ✅ FIXED (IMPORTANT)

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    console.log("OTP:", otp);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "JanSamadhan OTP",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent" });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ message: "Email error" });
  }
});

// =======================
// VERIFY OTP + LOGIN
// =======================
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (
    otpStore[email] &&
    otpStore[email].otp == otp &&
    otpStore[email].expires > Date.now()
  ) {
    const role = email === "admin@gmail.com" ? "admin" : "user";

    const token = jwt.sign(
      { email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token });

  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
});

// =======================
// SUBMIT COMPLAINT
// =======================
app.post("/api/complaints", async (req, res) => {
  try {
    const { token, name, phoneNo, aadharNumber, city, category, description } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    if (!category || !description) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const complaintId = "JAN" + Date.now();

    const newComplaint = new Complaint({
      complaintId,
      name,
      email,
      phoneNo,
      aadharNumber,
      city,
      category,
      description,
      status: "Pending"
    });

    await newComplaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaintId
    });

  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// =======================
// USER: GET OWN COMPLAINTS
// =======================
app.post("/api/my-complaints", async (req, res) => {
  try {
    const { token } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const complaints = await Complaint.find({
      email: decoded.email
    }).sort({ createdAt: -1 });

    res.json(complaints);

  } catch {
    res.status(401).json({ message: "Unauthorized" });
  }
});

// =======================
// ADMIN: GET ALL
// =======================
app.get("/api/complaints", async (req, res) => {
  try {
    const data = await Complaint.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// =======================
// ADMIN: UPDATE STATUS
// =======================
app.put("/api/complaints/:id", async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status: "Resolved" },
      { new: true }
    );

    res.json(updated);

  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});

// =======================
// START SERVER
// =======================
app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 5000} 🚀`);
});