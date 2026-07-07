from langchain_core.prompts import ChatPromptTemplate
from app.services.job_service import llm
from app.schemas.io_models import AISuggestions, DeepAnalysis
from app.prompts import AI_SUGGESTIONS_PROMPT
import json

structured_suggestions_llm = llm.with_structured_output(AISuggestions)
suggestions_prompt = ChatPromptTemplate.from_template(AI_SUGGESTIONS_PROMPT)
suggestions_chain = suggestions_prompt | structured_suggestions_llm

def generate_ai_suggestions(job_title: str, target_skills: str, resume_text: str, deep_analysis: DeepAnalysis) -> dict:
    try:
        # Convert DeepAnalysis model to string context
        deep_context = ""
        if deep_analysis:
            deep_context = f"""
Overall Fit: {deep_analysis.overall_fit}
Strengths: {", ".join(deep_analysis.strengths)}
Gaps: {", ".join(deep_analysis.gaps)}
Inferred Skills: {", ".join(deep_analysis.inferred_skills)}
Missing Skills: {", ".join(deep_analysis.missing_skills)}
"""
        
        result = suggestions_chain.invoke({
            "job_title": job_title,
            "target_skills": target_skills,
            "resume_text": resume_text,
            "deep_analysis_context": deep_context
        })
        
        if result:
            return result.model_dump()
        return None
    except Exception as e:
        print(f"Failed to generate AI suggestions: {e}")
        return None
