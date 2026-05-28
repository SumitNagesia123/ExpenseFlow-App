import sys
import pickle

description = sys.argv[1]

with open("category_model.pkl", "rb") as f:
    model, vectorizer = pickle.load(f)

X = vectorizer.transform([description])
prediction = model.predict(X)

print(prediction[0])
