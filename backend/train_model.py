import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import pickle

# Load dataset
df = pd.read_csv("data/mental_health_dataset.csv")

print("Dataset Loaded ✅")

# Select ONLY needed columns (match frontend)
df = df[[
    "age",
    "gender",
    "employment_status",
    "work_environment",
    "mental_health_history",
    "seeks_treatment",
    "stress_level",
    "sleep_hours",
    "physical_activity_days",
    "depression_score",
    "anxiety_score",
    "social_support_score",
    "productivity_score",
    "mental_health_risk"
]]

# Encode categorical
df = pd.get_dummies(df)

print("Data Encoded ✅")

# Split
X = df.drop("mental_health_risk_High", axis=1)
y = df["mental_health_risk_High"]

# Train model
model = RandomForestClassifier()
model.fit(X, y)

print("Model Trained ✅")

# Save
pickle.dump(model, open("model.pkl", "wb"))

print("Model saved as model.pkl 🎯")