from datetime import datetime, timezone

from flask import Flask, jsonify, redirect, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

ITEMS = []


@app.get("/")
def home():
    return redirect("/frontend/index.html")


@app.get("/frontend/<path:filename>")
def serve_frontend(filename):
    return send_from_directory("frontend", filename)


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.get("/api/time")
def api_time():
    now_utc = datetime.now(timezone.utc).isoformat()
    return jsonify({"server_time_utc": now_utc}), 200


@app.get("/api/items")
def list_items():
    return jsonify({"count": len(ITEMS), "items": ITEMS}), 200


@app.post("/api/items")
def create_item():
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    name = payload.get("name")
    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Field 'name' is required and must be a non-empty string"}), 400

    new_item = {
        "id": len(ITEMS) + 1,
        "name": name.strip(),
    }
    ITEMS.append(new_item)
    return jsonify(new_item), 201


@app.errorhandler(404)
def not_found(_error):
    return jsonify({"error": "Resource not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
