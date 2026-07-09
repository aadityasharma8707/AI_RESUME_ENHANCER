from app.services.job_service import llm
from app.schemas.assessment_models import EvaluationResult
from langchain_core.prompts import PromptTemplate

def evaluate_open_ended_answers(skill: str, assessment_data: dict, user_answers: dict) -> EvaluationResult:
    prompt = PromptTemplate.from_template("""
    You are an expert technical assessor evaluating a candidate's practical understanding of: {skill}.
    
    The candidate has submitted answers for 2 scenario questions and 1 practical task.
    Evaluate the answers considering technical correctness, practical understanding, reasoning quality, and relevance to the skill.
    
    Scoring rules:
    - Scenario 1 max score: 20
    - Scenario 2 max score: 20
    - Practical Task max score: 30
    
    Assessment Data:
    {assessment_data}
    
    Candidate's Answers:
    {user_answers}
    
    Provide your evaluation strictly following the required JSON schema.
    """)
    
    # Format the data for the prompt
    scenarios = assessment_data.get("scenarios", [])
    practical = assessment_data.get("practical_task", {})
    
    formatted_assessment = "Scenarios:\n"
    for i, sc in enumerate(scenarios):
        formatted_assessment += f"Scenario {i+1} (ID: {sc['id']}): {sc['scenario_text']}\n"
    formatted_assessment += f"Practical Task (ID: {practical.get('id')}): {practical.get('task_text')}\n"
    
    formatted_answers = "Scenario Answers:\n"
    for i, sc in enumerate(scenarios):
        ans = user_answers.get(sc['id'], "No answer provided.")
        formatted_answers += f"Scenario {i+1}: {ans}\n"
    
    practical_ans = user_answers.get(practical.get('id'), "No answer provided.")
    formatted_answers += f"Practical Task Answer: {practical_ans}\n"
    
    chain = prompt | llm.with_structured_output(EvaluationResult)
    result = chain.invoke({
        "skill": skill,
        "assessment_data": formatted_assessment,
        "user_answers": formatted_answers
    })
    
    return result
