from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS
from pymongo import MongoClient

# -------------------------------
# 🔥 FLASK APP
# -------------------------------
app = Flask(__name__)
CORS(app)

# -------------------------------
# 🔥 MONGODB CONNECTION
# -------------------------------
client = MongoClient(
    "mongodb+srv://testuser:test123@mindbridgeai.qocqsdy.mongodb.net/mindbridge?retryWrites=true&w=majority"
)

db = client["mindbridge"]
records_collection = db["records"]
users_collection = db["users"]

# -------------------------------
# 🔥 LOAD MODEL
# -------------------------------
model = pickle.load(open("model.pkl", "rb"))

# -------------------------------
# 🔥 HOME ROUTE
# -------------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Server is running"})

# -------------------------------
# 🔥 SIGNUP ROUTE
# -------------------------------
@app.route("/signup", methods=["POST"])
def signup():
    data = request.json

    if users_collection.find_one({"email": data["email"]}):
        return jsonify({"error": "User already exists"}), 400

    users_collection.insert_one(data)

    return jsonify({"message": "Signup successful"})

# -------------------------------
# 🔥 PREDICTION ROUTE
# -------------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    try:
        df = pd.DataFrame([data])
        df = pd.get_dummies(df)

        model_columns = model.feature_names_in_
        df = df.reindex(columns=model_columns, fill_value=0)

        prediction = model.predict(df)[0]

        try:
            prob = model.predict_proba(df)[0][1]
        except:
            prob = 0.5

        score = int((1 - prob) * 100)

        sleep = data.get("sleep_hours", 6)
        depression = data.get("depression_score", 10)
        anxiety = data.get("anxiety_score", 10)

        if sleep >= 7 and depression <= 5 and anxiety <= 5:
            risk = "Low"
            status = "Good mental health 🌟"

        elif sleep <= 4 and depression >= 15 and anxiety >= 15:
            risk = "High"
            status = "Critical condition ⚠️"

        else:
            if prob > 0.6:
                risk = "High"
                status = "Critical condition ⚠️"
            elif prob > 0.3:
                risk = "Medium"
                status = "Moderate condition ⚖️"
            else:
                risk = "Low"
                status = "Good mental health 🌟"

        return jsonify({
            "risk": risk,
            "score": score,
            "status": status
        })

    except Exception as e:
        return jsonify({"error": str(e)})

# -------------------------------
# 🔥 SAVE DATA
# -------------------------------
@app.route("/save", methods=["POST"])
def save():
    data = request.json
    records_collection.insert_one(data)
    return jsonify({"message": "Saved to MongoDB"})

# -------------------------------
# 🔥 GET RECORDS
# -------------------------------
@app.route("/records", methods=["GET"])
def records():
    data = list(records_collection.find({}, {"_id": 0}))
    return jsonify(data)

# -------------------------------
# 🔥 RUN SERVER
# -------------------------------
if __name__ == "__main__":
    app.run(debug=True)