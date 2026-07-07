from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.health import router as health_router
from app.api.analyses import router as analyses_router
from app.api.resume_check import router as resume_check_router

app = FastAPI(
    title="AI Resume Enhancer API",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "name": "AI Resume Enhancer API",
        "status": "running",
        "docs": "/docs"
    }

app.include_router(health_router)
app.include_router(analyses_router)
app.include_router(resume_check_router, prefix="/resume-check", tags=["Resume Check"])