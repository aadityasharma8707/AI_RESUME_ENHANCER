from fastapi import APIRouter, UploadFile, File, HTTPException
import json
from app.services.resume_service import process_resume
from app.services.skill_extractor import extract_technical_skills
from app.database.resume_db import save_resume_document, get_all_resumes, get_resume, delete_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("")
def upload_central_resume(resume: UploadFile = File(...)):
    file_bytes = resume.file.read()
    
    # 1. Extract text (we process_resume here to get raw text)
    resume_text, _ = process_resume(
        file_bytes=file_bytes,
        filename=resume.filename
    )
    
    # 2. Extract technical skills
    extracted_skills_json = extract_technical_skills(resume_text)
    
    # 3. Store permanently
    saved_doc = save_resume_document(
        file_bytes=file_bytes,
        filename=resume.filename,
        target_job_title="", # Optional for library
        extracted_text=resume_text,
        extracted_skills=extracted_skills_json
    )
    
    return saved_doc

@router.get("")
def list_central_resumes():
    return get_all_resumes()

@router.get("/{resume_id}")
def get_central_resume(resume_id: str):
    doc = get_resume(resume_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    return doc

@router.delete("/{resume_id}")
def delete_central_resume(resume_id: str):
    success = delete_resume(resume_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": "Resume deleted successfully"}
