from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import api_router
from db.database import engine, Base

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI-Powered Data Analyst Engine",
    description="Backend API for processing datasets, generating insights and visual data.",
    version="1.0.0"
)

# CORS configuration - Allow our frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to AI-Powered Data Analyst API"}

import os

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
