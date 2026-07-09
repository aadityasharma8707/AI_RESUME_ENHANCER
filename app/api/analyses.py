from fastapi import APIRouter, UploadFile, File, Form

from app.services.resume_service import process_resume
from app.services.ats_service import evaluate_ats_score
from app.services.suggestions_service import generate_ai_suggestions
from app.database.resume_db import save_resume_document
from app.graph.workflow import analysis_graph
from uuid import uuid4
from fastapi import HTTPException


analyses_store = {}


router = APIRouter()


@router.post("/analyze")
def analyze_resume(
    resume: UploadFile = File(None),
    resume_id: str = Form(None),
    job_title: str = Form(""),
    target_skills: str = Form(""),
    job_description: str = Form("") # Fallback for old requests
):

    if resume_id:
        from app.database.resume_db import get_resume
        doc = get_resume(resume_id)
        if not doc:
            raise HTTPException(status_code=404, detail="Resume not found")
        resume_text = doc.get("extracted_text")
        if not resume_text:
            raise HTTPException(
                status_code=400,
                detail="This resume is missing extracted text. Please re-upload the resume to use it for analysis."
            )
        filename = doc["original_filename"]
        # Chunks are still needed for RAG pipeline if we are using them, but actually we can generate them from text
        from app.services.resume_service import split_text_into_chunks
        chunks = split_text_into_chunks(resume_text, chunk_size=1000, chunk_overlap=200, filename=filename)
    else:
        if not resume:
            raise HTTPException(status_code=400, detail="Must provide resume file or resume_id")
        file_bytes = resume.file.read()
        filename = resume.filename

        # Save to My Resumes persistent library
        actual_title = job_title if job_title else "Target Role"
        try:
            save_resume_document(file_bytes, filename, actual_title)
        except Exception as e:
            print("ERROR SAVING RESUME DOCUMENT:", e)
            import traceback
            traceback.print_exc()

        resume_text, chunks = process_resume(
            file_bytes=file_bytes,
            filename=filename
        )
    
    # If old frontend is used, fallback to job_description (though we change frontend)
    actual_title = job_title if job_title else "Target Role"
    actual_skills = target_skills if target_skills else ""

    graph_result = analysis_graph.invoke({
        "job_title": actual_title,
        "target_skills": actual_skills,
        "resume_text": resume_text,
        "chunks": chunks
    })
    
    analysis_id = str(uuid4())
    
    deep = graph_result.get("deep_analysis")
    
    # Run deterministic ATS scoring
    ats_score_data = evaluate_ats_score(resume_text, actual_skills)
    
    # Run AI suggestions (gracefully falls back if fails)
    ai_suggestions_data = generate_ai_suggestions(
        job_title=actual_title,
        target_skills=actual_skills,
        resume_text=resume_text,
        deep_analysis=deep
    )
    
    analysis_data = {
        "id": analysis_id,
        "filename": filename,
        "target_job_title": actual_title,
        "target_skills": actual_skills,
        "resume_text_length": len(resume_text),
        "total_chunks": len(chunks),
        
        # Keep old format for AnalysisDashboard to not crash (Overview)
        "job_requirements": {
            "job_title": actual_title,
            "required_skills": graph_result["job_requirements"].required_skills,
            "preferred_skills": [],
            "experience_required": ""
        },
        
        "skill_matches": [
            match.model_dump()
            for match in graph_result["skill_matches"]
        ],
        
        # New Resume Analysis fields
        "deep_analysis": deep.model_dump() if deep else None,
        
        # New ATS Score fields
        "ats_score": ats_score_data,
        
        # New AI Suggestions fields
        "ai_suggestions": ai_suggestions_data
    }
    
    analyses_store[analysis_id] = analysis_data
    return analysis_data
@router.get("/analyses")
def get_all_analyses():
    return list(analyses_store.values())


@router.get("/analyses/{analysis_id}")
def get_analysis(analysis_id: str):
    if analysis_id not in analyses_store:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    return analyses_store[analysis_id]


@router.delete("/analyses/{analysis_id}")
def delete_analysis(analysis_id: str):
    if analysis_id not in analyses_store:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    del analyses_store[analysis_id]

    return {
        "message": "Analysis deleted successfully"
    }
@router.put("/analyses/{analysis_id}")
def update_analysis(
    analysis_id: str,
    job_description: str = Form(...)
):
    if analysis_id not in analyses_store:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    analyses_store[analysis_id]["job_description"] = job_description

    return analyses_store[analysis_id]