import os
import json
import io
import datetime
from flask import Flask, request, jsonify
import google.generativeai as genai

# --- SETUP ---
# Configure the Gemini client. It automatically finds the API key
# from the environment variable you set.
genai.configure()

# Initialize the Flask application.
app = Flask(__name__)


# --- API ENDPOINT ---

@app.route('/process-receipt', methods=['POST'])
def process_receipt():
    # Check if an image file was included in the request
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({'error': 'No image file selected'}), 400

    try:
        # --- Combined OCR and Parsing with Gemini 2.5 Flash ---

        # 1. Prepare the file for the Gemini API by reading its content and MIME type.
        receipt_file = {
            'mime_type': file.mimetype,
            'data': file.read()
        }

        # 2. Create the detailed prompt for the AI model.
        prompt = f"""
        Analyze the attached receipt file (which could be an image or a PDF) and extract its information into a valid JSON object.
        Your main goal is to be completely accurate.

        The JSON object must have these exact keys: "store_name", "total_price", "items", "total_discount", and "receipt_date".

        Follow these steps carefully:
        1.  First, find every individual item on the receipt. For each item, extract its "name", "quantity", and "price".
            - The "name" should be the descriptive product name, ignoring product codes.
            - Do not include any lines about discounts in the items list.
        2.  Next, identify any total discount amount. This is often labeled "Discount", "Savings", or similar. If no total discount is found, set the "total_discount" value to 0.00.
        3.  Find the date of the transaction on the receipt. You must format it as "YYYY-MM-DD". If you cannot find a date, use today's date: {datetime.date.today().strftime('%Y-%m-%d')}.
        4.  After extracting all items and the total discount, you MUST calculate the final "total_price". The final "total_price" is the sum of all item prices (quantity * price) minus the total_discount.
        5.  Do not just look for the word 'Total' on the receipt. Use your own calculation as the primary source for the total_price. The printed total on the receipt should only be used as a last resort.
        6.  Finally, determine the "store_name".
        """
        
        # 3. Call the Gemini 2.5 Flash model with the prompt and the file data.
        model = genai.GenerativeModel('gemini-2.5-flash')
        response = model.generate_content([prompt, receipt_file])
        
        # 4. Clean up and parse the JSON response.
        json_string = response.text.strip().replace("```json", "").replace("```", "")
        structured_data = json.loads(json_string)

        return jsonify(structured_data)

    except Exception as e:
        print("DETAILED ERROR:", e) # Add this line to see the error in your terminal
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)