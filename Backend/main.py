from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import json
import google.generativeai as genai
import re

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GOOGLE_API_KEY")
genai.configure(api_key=api_key)

# Use Gemini API to autocomplete the spreadsheet data
def get_gemini_response(data):
    model = genai.GenerativeModel("gemini-2.0-flash")

    user_json_str = json.dumps(data, indent=2)

    prompt = (
        f"The following JSON object has some values marked as '<Fill in here>'.\n"
        f"Based on the provided information, fill in appropriate values and return the full JSON with the exact JSON schema:\n\n"
        f"{user_json_str}"
        f"Make sure to return the JSON object only, not any other text or comments."
    )

    response = model.generate_content(prompt)
    parsed_response = re.sub(r"^```json\n|\n```$", "", response.text.strip())
    parsed_json = json.loads(parsed_response)

    return parsed_json

# API endpoint for autocomplete
@app.route('/api/autocomplete', methods=['POST'])
def autocomplete():
    try:
        data = request.get_json()
        print("Received data:", data)
        output = get_gemini_response(data)
        print("Output:", output)

        return jsonify({'status': 'success', 'output': output})
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)