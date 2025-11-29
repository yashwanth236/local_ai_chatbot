from flask import Flask, request, jsonify, render_template
import subprocess
import json

app = Flask(__name__)

MODEL_NAME = "phi3:mini"
def ask_ollama(prompt):
    """Send user text to Ollama model and return response."""
    process = subprocess.Popen(
        ["ollama", "run", MODEL_NAME],
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )

    output, error = process.communicate(prompt)

    return output.strip()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/chat", methods=["POST"])
def chat():
    user_text = request.json.get("text", "")
    if not user_text:
        return jsonify({"reply": "Say something…"}), 200

    bot_reply = ask_ollama(user_text)
    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    app.run(debug=True)
