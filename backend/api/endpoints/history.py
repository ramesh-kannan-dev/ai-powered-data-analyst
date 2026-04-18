from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import desc
from db.database import get_db
from db.models import AnalysisHistory

router = APIRouter()

@router.get("")
def get_history(db: Session = Depends(get_db)):
    records = db.query(AnalysisHistory).order_by(desc(AnalysisHistory.created_at)).all()
    return records
