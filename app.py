import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
from dotenv import load_dotenv

# Load your GEMINI_API_KEY from the .env file
load_dotenv()

app = Flask(__name__)
CORS(app) # Required for the frontend-backend connection

# Configure the AI with a faster model
api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash-latest')

def clean_json(text):
    """Removes AI markdown syntax to ensure stable parsing"""
    return text.replace('```json', '').replace('```', '').strip()

# ROUTE 1: IMAGE SCAN (DECODE STRIP)
@app.route('/decode-strip', methods=['POST'])
def decode_strip():
    try:
        img_file = request.files['image']
        img = Image.open(img_file)
        
        # We ask for structured JSON to make the frontend update easier
        prompt = "Analyze this medicine strip. Return ONLY a JSON object with: medicine_name, active_compounds (list), therapeutic_class, indications, common_side_effects (list), and critical_warning."
        
        response = model.generate_content([prompt, img])
        return jsonify({"status": "success", "data": clean_json(response.text)})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"status": "error", "message": str(e)}), 500

# ROUTE 2: SEARCH BY NAME
@app.route('/search-by-name', methods=['POST'])
def search_by_name():
    try:
        query = request.json.get('query')
        prompt = f"Provide professional medical details for: {query}. Return ONLY a JSON object with: medicine_name, active_compounds (list), therapeutic_class, indications, common_side_effects (list), and critical_warning."
        
        response = model.generate_content(prompt)
        return jsonify({"status": "success", "data": clean_json(response.text)})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
