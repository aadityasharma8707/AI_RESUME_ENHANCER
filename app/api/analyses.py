from fastapi import APIRouter, UploadFile, File, Form

from app.services.resume_service import process_resume
from app.services.ats_service import evaluate_ats_score
from app.services.suggestions_service import generate_ai_suggestions
from app.graph.workflow import analysis_graph
from uuid import uuid4
from fastapi import HTTPException


analyses_store = {}


router = APIRouter()


@router.post("/analyze")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_title: str = Form(""),
    target_skills: str = Form(""),
    job_description: str = Form("") # Fallback for old requests
):
    file_bytes = await resume.read()

    resume_text, chunks = process_resume(
        file_bytes=file_bytes,
        filename=resume.filename
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
        "filename": resume.filename,
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