from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid

app = Flask(__name__)
CORS(app)

# In-memory storage
complaints = []

# Home route
@app.route('/')
def home():
    return "Backend is running 🚀"

# ✅ Submit Complaint
@app.route('/complaints', methods=['POST'])
def submit_complaint():
    data = request.get_json()

    complaint = {
        "complaint_id": str(uuid.uuid4()),
        "name": data.get("name"),
        "email": data.get("email"),
        "phoneNo": data.get("phoneNo"),
        "aadharNumber": data.get("aadharNumber"),
        "city": data.get("city"),
        "category": data.get("category"),
        "date": data.get("date"),
        "description": data.get("description"),
        "status": "Pending"
    }

    complaints.append(complaint)

    print("Stored:", complaints)

    return jsonify({
        "message": "Complaint submitted successfully",
        "complaint_id": complaint["complaint_id"]
    }), 201


# ✅ Get All Complaints (Admin)
@app.route('/complaints', methods=['GET'])
def get_complaints():
    return jsonify(complaints)


# 🔥 NEW: Update Complaint Status (IMPORTANT)
@app.route('/complaints/<complaint_id>', methods=['PUT'])
def update_status(complaint_id):
    for complaint in complaints:
        if complaint["complaint_id"] == complaint_id:
            complaint["status"] = "Resolved"
            return jsonify({
                "message": "Status updated to Resolved",
                "complaint": complaint
            }), 200

    return jsonify({"error": "Complaint not found"}), 404


# 🔥 OPTIONAL: Delete Complaint (BONUS)
@app.route('/complaints/<complaint_id>', methods=['DELETE'])
def delete_complaint(complaint_id):
    global complaints
    complaints = [c for c in complaints if c["complaint_id"] != complaint_id]

    return jsonify({"message": "Complaint deleted"}), 200


if __name__ == '__main__':
    app.run(port=5000, debug=True)