from fastapi import APIRouter
from .endpoints import dataset, analysis, report, history

api_router = APIRouter()
api_router.include_router(dataset.router, prefix="/dataset", tags=["dataset"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(report.router, prefix="/report", tags=["report"])
api_router.include_router(history.router, prefix="/history", tags=["history"])
