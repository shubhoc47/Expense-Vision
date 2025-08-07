import google.generativeai as genai
import json
import os

# The client will automatically find the API key from your environment variable
genai.configure()

# A simple, hardcoded example of receipt text
sample_receipt_text = """
WOOLWORTHS SUPERMARKET
CAMPSIE NSW 2194
ABN 88 000 014 675

BROWN ONIONS 500G       $2.50
APPLES PINK LADY        $4.00
TOTAL                   $6.50
"""

# The prompt telling the AI what to do
prompt = f"""
Analyze the following receipt text and extract the information into a valid JSON object.
The JSON object must have these exact keys: "store_name", "total_price", and "items".
The "items" key should be a list of objects, where each object has "name", "quantity", and "price".
If a quantity is not found for an item, assume the quantity is 1.

Receipt Text:
---
{sample_receipt_text}
---
"""

print("--- Sending Prompt to Gemini ---")

try:
    # Call the Gemini model to generate content
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    response = model.generate_content(prompt)

    print("\n--- Raw Response from Gemini ---")
    print(response.text)

    # Clean up and parse the JSON response
    json_string = response.text.strip().replace("```json", "").replace("```", "")
    structured_data = json.loads(json_string)

    print("\n--- Parsed Structured Data ---")
    print(json.dumps(structured_data, indent=2))

except Exception as e:
    print(f"\n--- An Error Occurred ---")
    print(e)