import os
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from services.data_processor import process_dataset_summary
from db.database import get_db
from db.models import AnalysisHistory

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith((".csv", ".xlsx", ".xls")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are allowed.")
    
    file_id = str(uuid.uuid4())
    ext = file.filename.split(".")[-1]
    saved_filename = f"{file_id}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)
    
    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # Immediately process the dataset to get the summary
        summary = process_dataset_summary(file_path)
        
        # Save to DB
        db_history = AnalysisHistory(
            id=file_id,
            filename=file.filename,
            file_path=file_path,
            rows=summary.get("rows", 0),
            columns=summary.get("columns", 0),
            quality_score=summary.get("quality_score", 0)
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
        
        return {
            "message": "File uploaded successfully",
            "file_id": file_id,
            "filename": file.filename,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
