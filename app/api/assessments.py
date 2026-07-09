from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

from app.database.resume_db import get_resume
from app.database.assessment_db import save_assessment
from app.services.assessment_service import generate_assessment

router = APIRouter()

class GenerateAssessmentRequest(BaseModel):
    resume_id: str
    skill: str

@router.post("/generate")
def generate_assessment_endpoint(request: GenerateAssessmentRequest):
    # 1. Validate resume exists
    doc = get_resume(request.resume_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    # 2. Validate skill exists in resume
    if not doc.get("extracted_skills"):
        raise HTTPException(status_code=400, detail="Resume has no extracted skills")
        
    extracted_skills = json.loads(doc["extracted_skills"])
    if request.skill not in extracted_skills:
        raise HTTPException(status_code=400, detail="Requested skill not found in this resume")
        
    # 3. Generate assessment
    try:
        result = generate_assessment(request.skill)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate assessment: {str(e)}")
        
    # 4. Prepare hidden data and frontend payload
    hidden_answers = {
        mcq.id: mcq.correct_option_id for mcq in result.mcqs
    }
    
    frontend_mcqs = []
    for mcq in result.mcqs:
        frontend_mcqs.append({
            "id": mcq.id,
            "question_text": mcq.question_text,
            "options": [{"id": opt.id, "text": opt.text} for opt in mcq.options]
        })
        
    frontend_payload = {
        "mcqs": frontend_mcqs,
        "scenarios": [{"id": sc.id, "scenario_text": sc.scenario_text} for sc in result.scenarios],
        "practical_task": {"id": result.practical_task.id, "task_text": result.practical_task.task_text}
    }
    
    # 5. Save to database
    assessment_id = save_assessment(
        resume_id=request.resume_id,
        skill=request.skill,
        assessment_data=frontend_payload,
        hidden_answers=hidden_answers
    )
    
    return {
        "assessment_id": assessment_id,
        "skill": request.skill,
        "assessment": frontend_payload
    }

class SubmitAssessmentRequest(BaseModel):
    answers: dict

@router.post("/{assessment_id}/submit")
def submit_assessment_endpoint(assessment_id: str, request: SubmitAssessmentRequest):
    from app.database.assessment_db import get_assessment, has_assessment_result, save_assessment_result
    from app.services.evaluation_service import evaluate_open_ended_answers
    
    # 1. Load the existing pending assessment
    assessment = get_assessment(assessment_id)
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
        
    # 2. Confirm it has not already been completed
    if has_assessment_result(assessment_id):
        raise HTTPException(status_code=400, detail="Assessment already submitted")
        
    assessment_data = assessment["assessment_data"]
    hidden_answers = assessment["hidden_answers"]
    user_answers = request.answers
    
    # 3. Confirm all 6 answers are present
    mcqs = assessment_data.get("mcqs", [])
    scenarios = assessment_data.get("scenarios", [])
    practical_task = assessment_data.get("practical_task", {})
    
    expected_ids = [q["id"] for q in mcqs] + [q["id"] for q in scenarios] + [practical_task.get("id")]
    for expected_id in expected_ids:
        if not expected_id or expected_id not in user_answers or not str(user_answers[expected_id]).strip():
            raise HTTPException(status_code=400, detail="All questions must be answered")
            
    # 4. Score MCQs deterministically
    concept_score = 0
    for mcq in mcqs:
        mcq_id = mcq["id"]
        if user_answers.get(mcq_id) == hidden_answers.get(mcq_id):
            concept_score += 10
            
    # 5. Evaluate open-ended answers
    try:
        eval_result = evaluate_open_ended_answers(assessment["skill"], assessment_data, user_answers)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
        
    # 6. Validate and clamp scores
    scenario_1_score = max(0, min(20, eval_result.scenario_1_score))
    scenario_2_score = max(0, min(20, eval_result.scenario_2_score))
    practical_score = max(0, min(30, eval_result.practical_score))
    
    applied_score = scenario_1_score + scenario_2_score
    
    # 7. Calculate total score
    total_score = concept_score + applied_score + practical_score
    
    # 8. Determine verification outcome
    if total_score >= 80:
        outcome = "Verified"
    elif total_score >= 60:
        outcome = "Needs Improvement"
    else:
        outcome = "Not Verified"
        
    # 9. Persist result
    resume = get_resume(assessment["resume_id"])
    resume_filename = resume["original_filename"] if resume else "Unknown"
    
    feedback = {
        "strengths": eval_result.strengths,
        "improvement_areas": eval_result.improvement_areas,
        "scenario_1_feedback": eval_result.scenario_1_feedback,
        "scenario_2_feedback": eval_result.scenario_2_feedback,
        "practical_feedback": eval_result.practical_feedback
    }
    
    save_assessment_result(
        assessment_id=assessment_id,
        resume_id=assessment["resume_id"],
        resume_filename=resume_filename,
        skill=assessment["skill"],
        concept_score=concept_score,
        applied_score=applied_score,
        practical_score=practical_score,
        total_score=total_score,
        outcome=outcome,
        feedback=feedback
    )
    
    # 10. Return safe payload
    return {
        "total_score": total_score,
        "concept_score": concept_score,
        "applied_score": applied_score,
        "practical_score": practical_score,
        "outcome": outcome,
        "feedback": feedback
    }

@router.get("/history")
def get_assessment_history_endpoint():
    from app.database.assessment_db import get_verification_history
    return get_verification_history()

@router.get("/resume/{resume_id}/status")
def get_resume_status_endpoint(resume_id: str):
    from app.database.assessment_db import get_resume_skill_status
    return get_resume_skill_status(resume_id)
