import os
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from services.data_processor import process_dataset_summary
from services.ai_insight import generate_insights

def create_pdf_report(file_id: str, file_path: str, output_path: str):
    summary = process_dataset_summary(file_path)
    insights = generate_insights(file_path)
    
    c = canvas.Canvas(output_path, pagesize=letter)
    width, height = letter
    
    # Title
    c.setFont("Helvetica-Bold", 20)
    c.drawString(50, height - 50, "Data Analysis Report")
    
    # Summary Section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 100, f"Dataset Name: {os.path.basename(file_path)}")
    
    c.setFont("Helvetica", 12)
    c.drawString(50, height - 130, f"Total Rows: {summary['rows']}")
    c.drawString(50, height - 150, f"Total Columns: {summary['columns']}")
    c.drawString(50, height - 170, f"Data Quality Score: {summary['quality_score']}/100")
    
    # Insights Section
    c.setFont("Helvetica-Bold", 14)
    c.drawString(50, height - 220, "Key Business Insights:")
    
    c.setFont("Helvetica", 11)
    y_pos = height - 250
    for insight in insights.get('business_insights', []):
        # simple wrap (naive approach)
        c.drawString(60, y_pos, f"- {insight[:80]}...")
        y_pos -= 20
        
    c.setFont("Helvetica-Bold", 14)
    y_pos -= 30
    c.drawString(50, y_pos, "Recommendations:")
    c.setFont("Helvetica", 11)
    y_pos -= 30
    for rec in insights.get('recommendations', []):
        c.drawString(60, y_pos, f"- {rec[:80]}...")
        y_pos -= 20
        
    c.save()
    return output_path
