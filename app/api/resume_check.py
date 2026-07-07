from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.resume_service import process_resume
from app.services.deterministic_engine import analyze_resume_text
from uuid import uuid4

router = APIRouter()

# In-memory store for Resume Check sessions (separate from Job Match analyses)
resume_check_store = {}

@router.post("/analyze")
async def analyze_resume_check(resume: UploadFile = File(...)):
    # 1. Read PDF bytes
    file_bytes = await resume.read()

    # 2. Extract text (we don't strictly need chunks for the deterministic overview, 
    # but we'll use the existing service to get the raw text)
    resume_text, _ = process_resume(
        file_bytes=file_bytes,
        filename=resume.filename
    )

    # 3. Deterministic Analysis
    analysis_result = analyze_resume_text(resume_text)

    # 4. Store Session
    analysis_id = str(uuid4())
    session_data = {
        "id": analysis_id,
        "filename": resume.filename,
        "scores": {
            "overall": analysis_result["overall_score"]
        },
        "metrics": analysis_result["metrics"]
    }
    
    resume_check_store[analysis_id] = session_data

    return session_data

@router.get("/analyses/{analysis_id}")
def get_resume_check(analysis_id: str):
    if analysis_id not in resume_check_store:
        raise HTTPException(
            status_code=404,
            detail="Resume Check session not found"
        )
    return resume_check_store[analysis_id]
