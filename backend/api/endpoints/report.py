import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.pdf_generator import create_pdf_report

router = APIRouter()
UPLOAD_DIR = "uploads"
REPORT_DIR = "reports"
os.makedirs(REPORT_DIR, exist_ok=True)

def get_file_path(file_id: str) -> str:
    for ext in ["csv", "xlsx", "xls"]:
        path = os.path.join(UPLOAD_DIR, f"{file_id}.{ext}")
        if os.path.exists(path):
            return path
    return None

@router.get("/{file_id}/download")
async def download_report(file_id: str):
    file_path = get_file_path(file_id)
    if not file_path:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    report_path = os.path.join(REPORT_DIR, f"{file_id}_report.pdf")
    
    try:
        # Generate on the fly if it doesn't exist
        if not os.path.exists(report_path):
            create_pdf_report(file_id, file_path, report_path)
        return FileResponse(path=report_path, filename=f"Data_Report_{file_id[:6]}.pdf", media_type='application/pdf')
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
