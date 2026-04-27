import pandas as pd
import pickle
import re
import os
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report

# =========================
# LOAD DATASET
# =========================
base_dir = os.path.dirname(__file__)
file_path = os.path.join(base_dir, "dataset.csv")

df = pd.read_csv(file_path)

print("📊 Dataset Loaded:", df.shape)

# =========================
# CLEAN TEXT
# =========================
def clean_text(text):
    text = str(text).lower()
    text = re.sub(r'\W', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

df["Description"] = df["Description"].apply(clean_text)

# =========================
# RULE-BASED LABELING (IMPROVED)
# =========================
def generate_priority(text):
    if any(word in text for word in [
        "rape", "murder", "violence", "fire", "accident",
        "robbery", "theft", "crime", "injury", "death", "crash", "burn"
    ]):
        return "High"

    elif any(word in text for word in [
        "water", "electricity", "road", "drainage",
        "transport", "pollution", "garbage", "traffic", "sewage"
    ]):
        return "Medium"

    else:
        return "Low"

df["Priority"] = df["Description"].apply(generate_priority)

# =========================
# CLASS BALANCE CHECK
# =========================
print("\n📊 Class Distribution:")
print(df["Priority"].value_counts())

# =========================
# FEATURES
# =========================
X = df["Description"]
y = df["Priority"]

vectorizer = TfidfVectorizer(
    stop_words="english",
    max_features=5000,
    ngram_range=(1, 2)  # 🔥 better context
)

X_vec = vectorizer.fit_transform(X)

# =========================
# TRAIN / TEST SPLIT
# =========================
X_train, X_test, y_train, y_test = train_test_split(
    X_vec, y, test_size=0.2, random_state=42, stratify=y
)

# =========================
# MODEL (IMPROVED)
# =========================
model = LogisticRegression(
    max_iter=1000,
    class_weight="balanced"  # 🔥 handles imbalance
)

model.fit(X_train, y_train)

# =========================
# EVALUATION
# =========================
pred = model.predict(X_test)

print("\n🎯 Accuracy:", accuracy_score(y_test, pred))
print("\n📊 Classification Report:\n")
print(classification_report(y_test, pred))

# =========================
# SAVE MODEL
# =========================
pickle.dump(model, open(os.path.join(base_dir, "priority_model.pkl"), "wb"))
pickle.dump(vectorizer, open(os.path.join(base_dir, "vectorizer.pkl"), "wb"))

print("\n✅ Model trained and saved successfully!")