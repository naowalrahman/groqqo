from flask import Flask, render_template, request, jsonify
from groq import Groq
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Load the API key from an environment variable
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("No GROQ_API_KEY found in environment variables")

# Set up the Groq API client
client = Groq(api_key=api_key)

chat_history_api = []
chat_history = []


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/ask", methods=["POST"])
def ask():
    global chat_history_api
    user_input = request.json.get("question")
    if not user_input:
        return jsonify({"error": "No question provided"}), 400
    model = request.json.get("model")

    chat_history_api.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(messages=chat_history_api, model=model)

    response_content = response.choices[0].message.content
    chat_history_api.append(
        {
            "role": "assistant",
            "content": response_content,
        }
    )

    completion_time = response.usage.total_time
    chat_history.append(
        {
            "role": "user",
            "content": user_input,
            "timestamp": datetime.now().isoformat(),
        }
    )
    chat_history.append(
        {
            "role": "assistant",
            "content": response_content,
            "timestamp": datetime.now().isoformat(),
            "model": model,
            "completion_time": completion_time,
        }
    )

    return jsonify({"response": response_content, "history": chat_history})


@app.route("/history", methods=["POST"])
def history():
    global chat_history_api
    return jsonify({"history": chat_history})


@app.route("/clear", methods=["POST"])
def clear():
    global chat_history_api, chat_history
    chat_history_api = []
    chat_history = []
    return jsonify({"message": "Chat history cleared"})


if __name__ == "__main__":
    app.run(debug=True)
