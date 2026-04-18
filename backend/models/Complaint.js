const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintId: String,
  name: String,
  email: String,
  phoneNo: String,
  aadharNumber: String,
  city: String,
  category: String,
  description: String,

  // 🔥 Smart fields (AI)
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

module.exports = mongoose.model("Complaint", complaintSchema);