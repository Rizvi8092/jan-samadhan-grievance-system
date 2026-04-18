const express = require("express");
const router = express.Router();

const {
  submitComplaint,
  getAllComplaints,
  trackComplaint,
  updateStatus
} = require("../controllers/complaintController");

// 🔐 IMPORT MIDDLEWARE
const { verifyToken, isAdmin } = require("../middleware/auth");

// =======================
// 🔐 USER ROUTES
// =======================

// Submit complaint (only logged-in users)
router.post("/complaints", verifyToken, submitComplaint);

// Get user's own complaints
router.post("/my-complaints", verifyToken, trackComplaint);


// =======================
// 🔐 ADMIN ROUTES
// =======================

// Get all complaints (admin only)
router.get("/complaints", verifyToken, isAdmin, getAllComplaints);

// Update status (admin only)
router.put("/complaints/:id", verifyToken, isAdmin, updateStatus);

module.exports = router;