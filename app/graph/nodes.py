from app.services.job_service import extract_job_requirements
from app.services.analysis_service import analyze_skill_matches, analyze_deep_fit
from app.rag.database import create_resume_vector_store
from app.schemas.io_models import JobRequirements


def infer_skills_node(state):
    # Instead of extracting from a long description, we just build a JobRequirements object
    # from the explicit title and skills, and then the deep analysis infers the rest.
    # We create a dummy job_requirements so match_skills_node works without crashing.
    target_skills_list = [s.strip() for s in state["target_skills"].split(",") if s.strip()]
    return {
        "job_requirements": JobRequirements(
            job_title=state["job_title"],
            required_skills=target_skills_list,
            preferred_skills=[],
            responsibilities=[],
            experience_required=""
        )
    }


def create_vector_store_node(state):
    return {
        "vector_store": create_resume_vector_store(
            state["chunks"]
        )
    }


def match_skills_node(state):
    return {
        "skill_matches": analyze_skill_matches(
            state["job_requirements"].required_skills,
            state["vector_store"]
        )
    }


def deep_analysis_node(state):
    deep_analysis = analyze_deep_fit(
        job_title=state["job_title"],
        target_skills=state["target_skills"],
        resume_text=state["resume_text"]
    )
    return {
        "deep_analysis": deep_analysis
    }