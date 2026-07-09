from app.services.job_service import llm
from app.schemas.assessment_models import SkillAssessmentResult
from langchain_core.prompts import PromptTemplate
import uuid

def generate_assessment(skill: str) -> SkillAssessmentResult:
    prompt = PromptTemplate.from_template("""
    You are an expert technical interviewer and technical skills assessor.
    The user claims to have the following technical skill: {skill}
    
    Generate exactly one skill-specific assessment containing exactly 6 questions:
    1. Concept Check: 3 multiple-choice questions (4 options each, exactly 1 correct option).
    2. Applied Understanding: 2 scenario-based open-ended questions.
    3. Practical Task: 1 practical implementation or problem-solving task.
    
    The difficulty must be intermediate.
    Focus on practical, real-world understanding rather than trivia or generic career questions.
    Ensure questions are strictly about the provided skill ({skill}).
    """)
    
    chain = prompt | llm.with_structured_output(SkillAssessmentResult)
    result = chain.invoke({"skill": skill})
    
    # Ensure IDs are globally unique across the assessment to prevent mapping collisions
    for i, mcq in enumerate(result.mcqs):
        mcq.id = f"mcq_{i+1}_{uuid.uuid4().hex[:8]}"
    for i, sc in enumerate(result.scenarios):
        sc.id = f"scenario_{i+1}_{uuid.uuid4().hex[:8]}"
    if result.practical_task:
        result.practical_task.id = f"practical_{uuid.uuid4().hex[:8]}"
        
    return result
