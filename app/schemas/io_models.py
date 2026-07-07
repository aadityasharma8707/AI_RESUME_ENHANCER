from pydantic import BaseModel
from typing import Literal

class JobRequirements(BaseModel):
    job_title: str
    required_skills: list[str]
    preferred_skills: list[str]
    responsibilities: list[str]
    experience_required: str


class SkillMatch(BaseModel):
    skill: str
    status: Literal["Strong Match", "Partial Match", "No Evidence"]
    evidence: str
    reason: str


class DeepAnalysis(BaseModel):
    overall_fit: Literal["Strong Fit", "Good Fit", "Partial Fit", "Weak Fit"]
    overall_reasoning: str
    experience_relevance: str
    project_relevance: str
    strengths: list[str]
    gaps: list[str]
    inferred_skills: list[str]
    missing_skills: list[str]

class ResumeImprovement(BaseModel):
    priority: Literal["High", "Medium", "Low"]
    issue_type: str
    location: str
    original_text: str
    suggested_text: str
    reason: str

class SkillImprovement(BaseModel):
    skill: str
    gap_type: Literal["Target Skill Gap", "Role-relevant Opportunity", "Evidence Gap"]
    priority: Literal["High", "Medium", "Low"]
    why_it_matters: str
    current_evidence: str
    next_step: str

class AISuggestions(BaseModel):
    resume_improvements: list[ResumeImprovement]
    skill_improvements: list[SkillImprovement]