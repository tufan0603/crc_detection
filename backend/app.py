import os
import shutil
import uuid
from flask import Flask, request, jsonify
from flask_cors import CORS
from predict import detect_patient

app = Flask(__name__)
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
CORS(app, origins=allowed_origins)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

VALID_MODELS = {"densenet", "resnet", "efficientnet"}


@app.route("/predict", methods=["POST"])
def predict():
    files = request.files.getlist("files")
    if not files:
        return jsonify({"error": "No files uploaded"}), 400

    models_param = request.form.get("models", "densenet")
    model_names  = [m.strip() for m in models_param.split(",") if m.strip() in VALID_MODELS]
    if not model_names:
        model_names = ["densenet"]

    session_id  = str(uuid.uuid4())
    patient_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(patient_dir, exist_ok=True)

    try:
        for file in files:
            filename = os.path.basename(file.filename)
            if not filename.lower().endswith(".dcm"):
                continue
            file.save(os.path.join(patient_dir, filename))

        dcm_files = [f for f in os.listdir(patient_dir) if f.lower().endswith(".dcm")]
        if not dcm_files:
            return jsonify({"error": "No valid .dcm files found"}), 400

        result = detect_patient(patient_dir, model_names=model_names)
        return jsonify(result)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

    finally:
        shutil.rmtree(patient_dir, ignore_errors=True)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, port=int(os.environ.get("PORT", 5000)))
