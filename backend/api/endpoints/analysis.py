import os
from fastapi import APIRouter, HTTPException
from services.data_processor import get_chart_data
from services.ai_insight import generate_insights

router = APIRouter()
UPLOAD_DIR = "uploads"

def get_file_path(file_id: str) -> str:
    # Try looking for exactly matched extensions
    for ext in ["csv", "xlsx", "xls"]:
        path = os.path.join(UPLOAD_DIR, f"{file_id}.{ext}")
        if os.path.exists(path):
            return path
    return None

@router.get("/{file_id}/charts")
async def get_analysis_charts(file_id: str):
    file_path = get_file_path(file_id)
    if not file_path:
         raise HTTPException(status_code=404, detail="Dataset not found")
         
    try:
        chart_data = get_chart_data(file_path)
        return {"file_id": file_id, "charts": chart_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating charts: {str(e)}")

@router.get("/{file_id}/insights")
async def get_ai_insights(file_id: str):
    file_path = get_file_path(file_id)
    if not file_path:
         raise HTTPException(status_code=404, detail="Dataset not found")
         
    try:
        insights = generate_insights(file_path)
        return {"file_id": file_id, "insights": insights}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insights: {str(e)}")
