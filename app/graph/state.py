from typing import TypedDict, Any


class AnalysisState(TypedDict, total=False):
    job_title: str
    target_skills: str
    resume_text: str
    chunks: list[Any]
    job_requirements: Any
    vector_store: Any
    skill_matches: list[Any]
    deep_analysis: Any