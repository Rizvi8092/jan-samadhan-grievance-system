from flask import Flask, request, jsonify
import pickle
import os
import re

app = Flask(__name__)

# =========================
# LOAD MODEL (SAFE)
# =========================
base_dir = os.path.dirname(__file__)

try:
    vectorizer = pickle.load(open(os.path.join(base_dir, "vectorizer.pkl"), "rb"))
    model = pickle.load(open(os.path.join(base_dir, "priority_model.pkl"), "rb"))
    print("✅ Model Loaded Successfully")
except Exception as e:
    print("❌ Model Load Error:", e)
    vectorizer = None
    model = None

# =========================
# CLEAN TEXT
# =========================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# =========================
# RULE SYSTEM
# =========================
def rule_priority(text):
    if any(word in text for word in [
        "rape", "murder", "fire", "accident",
        "robbery", "injury", "death", "violence",
        "crash", "burn"
    ]):
        return "High"

    if any(word in text for word in [
        "water", "electricity", "road",
        "garbage", "drainage", "pollution",
        "sewage", "traffic"
    ]):
        return "Medium"

    return None

# =========================
# UNIVERSAL DATA PARSER 🔥
# =========================
def get_request_data():
    # Try JSON
    data = request.get_json(silent=True)

    # Try form-data
    if not data:
        data = request.form.to_dict()

    # Try raw data (last fallback)
    if not data and request.data:
        try:
            import json
            data = json.loads(request.data)
        except:
            data = {}

    print("📦 RAW DATA:", data)
    return data

# =========================
# API
# =========================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = get_request_data()
        text = data.get("description", "").strip()

        if not text:
            return jsonify({
                "priority": "Low",
                "confidence": 0,
                "error": "No description provided"
            })

        # 🔥 CLEAN TEXT
        cleaned = clean_text(text)

        print("\n========== NEW REQUEST ==========")
        print("INPUT:", text)
        print("CLEANED:", cleaned)

        # 🔥 RULE FIRST
        rule = rule_priority(cleaned)
        print("RULE RESULT:", rule)

        if rule:
            return jsonify({
                "priority": rule,
                "confidence": 1.0,
                "source": "rule"
            })

        # 🔥 ML FALLBACK
        if model and vectorizer:
            vec = vectorizer.transform([cleaned])
            prediction = model.predict(vec)[0]
            confidence = model.predict_proba(vec).max()

            print("ML RESULT:", prediction, confidence)

            return jsonify({
                "priority": prediction,
                "confidence": float(confidence),
                "source": "ml"
            })

        # fallback if model missing
        return jsonify({
            "priority": "Low",
            "confidence": 0,
            "error": "Model not loaded"
        })

    except Exception as e:
        print("❌ ML ERROR:", str(e))
        return jsonify({
            "priority": "Low",
            "confidence": 0,
            "error": str(e)
        })

# =========================
# ROOT
# =========================
@app.route("/", methods=["GET"])
def home():
    return "ML API Running ✅"

# =========================
if __name__ == "__main__":
    app.run(port=5001, debug=True)