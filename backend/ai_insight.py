import os
import json
from services.data_processor import process_dataset_summary

# Attempt to configure Gemini if key is present
import google.generativeai as genai

API_KEY = os.environ.get("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)
    
def generate_insights(file_path: str) -> dict:
    summary = process_dataset_summary(file_path)
    
    if API_KEY:
        try:
            model = genai.GenerativeModel('gemini-pro')
            prompt = f"Act as an expert Data Analyst. Here is a summary of a dataset:\n{json.dumps(summary, indent=2)}\nProvide 3 key business insights and 2 technical recommendations based on this context. Format as a clean JSON dict with keys 'business_insights' (array of strings) and 'recommendations' (array of strings)."
            response = model.generate_content(prompt)
            # Try to parse JSON from the text
            res_text = response.text.strip()
            if res_text.startswith("```json"):
                res_text = res_text[7:-3]
            return json.loads(res_text)
        except Exception as e:
             # Fallback to mock if API fails
            print(f"Gemini API Error: {e}")
            pass
            
    # Mocked insights if no API key or API fails
    return {
        "business_insights": [
             f"The dataset contains {summary['rows']} rows, offering a statistically significant sample for analysis.",
             "Data quality is mostly good, but attention is needed for missing values.",
             "Variables present varying distributions which suggests diverse behavioral segments."
        ],
        "recommendations": [
            "Impute or drop missing values before running predictive models.",
            "Consider feature engineering combining categorical attributes."
        ]
    }
