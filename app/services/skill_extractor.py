import json
import re
from typing import List
from app.services.job_service import llm

def extract_technical_skills(resume_text: str) -> str:
    """
    Extracts only technical skills from the resume text using the existing LLM.
    Returns a JSON string array of skills.
    """
    prompt = f"""
    You are an expert technical recruiter AI.
    Extract ALL technical skills from the following resume text.
    
    Valid technical skill categories include:
    - programming languages (e.g. Python, Java, C++)
    - frameworks (e.g. React, Django, Spring)
    - libraries (e.g. Pandas, NumPy, Redux)
    - databases (e.g. PostgreSQL, MongoDB, Redis)
    - AI/ML technologies (e.g. TensorFlow, PyTorch, LangChain)
    - cloud platforms (e.g. AWS, GCP, Azure)
    - DevOps tools (e.g. Docker, Kubernetes, Jenkins)
    - development tools (e.g. Git, Jira, Linux)
    
    EXCLUDE:
    - soft skills (e.g. Leadership, Communication)
    - contact information
    - education (e.g. Bachelor of Science)
    - company names
    - job titles
    - generic resume words
    
    Return ONLY a valid JSON array of strings containing the exact technical skill names.
    Do not wrap in markdown blocks, just return the raw JSON array (e.g. ["Python", "React"]).
    
    RESUME TEXT:
    {resume_text}
    """
    
    try:
        response = llm.invoke(prompt)
        content = response.content.strip()
        # Clean up if the LLM adds markdown formatting
        if content.startswith("```json"):
            content = content[7:]
        if content.startswith("```"):
            content = content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        # Validate that it's a JSON array
        skills = json.loads(content)
        if isinstance(skills, list):
            return json.dumps(skills)
        return "[]"
    except Exception as e:
        print(f"Error extracting technical skills: {e}")
        return "[]"
