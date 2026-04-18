import datetime
from sqlalchemy import Column, Integer, String, DateTime
from .database import Base

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, index=True)
    file_path = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    rows = Column(Integer)
    columns = Column(Integer)
    quality_score = Column(Integer)
