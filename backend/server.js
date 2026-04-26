require("dns").setDefaultResultOrder("ipv4first");
require("dotenv").config();

const multer = require("multer");
const path = require("path");
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

// 🔥 SERVE UPLOADED FILES
app.use("/uploads", express.static("uploads"));

// =======================
// MongoDB Connection
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/jansamadhan")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("DB Error:", err));

// =======================
// FILE UPLOAD (MULTER)
// =======================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

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
  file: String, // ✅ NEW FIELD
  department: String,
  priority: {
    type: String,
    default: "Low"
  },
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
// SEND OTP
// =======================
app.post("/api/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000);

    otpStore[email] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000
    };

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "JanSamadhan OTP",
      text: `Your OTP is: ${otp}`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Email failed" });
  }
});

// =======================
// VERIFY OTP
// =======================
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (
    otpStore[email] &&
    otpStore[email].otp == otp &&
    otpStore[email].expires > Date.now()
  ) {
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    delete otpStore[email];

    return res.json({ success: true, token });
  }

  res.status(400).json({ success: false });
});

// =======================
// SUBMIT COMPLAINT (🔥 UPDATED)
// =======================
app.post("/api/complaints", upload.single("file"), async (req, res) => {
  try {
    const {
      token,
      name,
      phoneNo,
      aadharNumber,
      city,
      category,
      description,
      date
    } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const complaintId = "JAN" + Date.now();

    // 🔥 FILE PATH
    const filePath = req.file ? req.file.filename : null;

    const newComplaint = new Complaint({
      complaintId,
      name,
      email,
      phoneNo,
      aadharNumber,
      city,
      category,
      description,
      file: filePath, // ✅ SAVE FILE
      status: "Pending"
    });

    await newComplaint.save();

    res.json({
      success: true,
      complaintId
    });

  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Unauthorized" });
  }
});

// =======================
// GET USER COMPLAINTS
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
// ADMIN GET ALL
// =======================
app.get("/api/complaints", async (req, res) => {
  const data = await Complaint.find().sort({ createdAt: -1 });
  res.json(data);
});

// =======================
// UPDATE STATUS
// =======================
app.put("/api/complaints/:id", async (req, res) => {
  const updated = await Complaint.findByIdAndUpdate(
    req.params.id,
    { status: "Resolved" },
    { new: true }
  );

  res.json(updated);
});

// =======================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});