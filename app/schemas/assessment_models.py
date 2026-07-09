from pydantic import BaseModel, Field
from typing import Literal

class MCQOption(BaseModel):
    id: str
    text: str

class MCQQuestion(BaseModel):
    id: str
    question_text: str
    options: list[MCQOption]
    correct_option_id: str = Field(description="The ID of the correct option. MUST NOT BE SENT TO FRONTEND.")

class ScenarioQuestion(BaseModel):
    id: str
    scenario_text: str

class PracticalTask(BaseModel):
    id: str
    task_text: str

class SkillAssessmentResult(BaseModel):
    mcqs: list[MCQQuestion] = Field(description="Exactly 3 multiple choice questions")
    scenarios: list[ScenarioQuestion] = Field(description="Exactly 2 scenario-based questions")
    practical_task: PracticalTask = Field(description="Exactly 1 practical task")

class EvaluationResult(BaseModel):
    scenario_1_score: int = Field(description="Score for scenario 1, between 0 and 20")
    scenario_2_score: int = Field(description="Score for scenario 2, between 0 and 20")
    practical_score: int = Field(description="Score for the practical task, between 0 and 30")
    strengths: list[str] = Field(description="Concise strengths identified in the answers")
    improvement_areas: list[str] = Field(description="Concise improvement areas identified in the answers")
    scenario_1_feedback: str = Field(description="Feedback for scenario 1")
    scenario_2_feedback: str = Field(description="Feedback for scenario 2")
    practical_feedback: str = Field(description="Feedback for the practical task")
