from langchain_core.prompts import ChatPromptTemplate

from app.services.job_service import llm
from app.schemas.io_models import SkillMatch, DeepAnalysis
from app.prompts import SKILL_MATCH_PROMPT, DEEP_ANALYSIS_PROMPT


structured_match_llm = llm.with_structured_output(SkillMatch)

match_prompt = ChatPromptTemplate.from_template(SKILL_MATCH_PROMPT)

match_chain = match_prompt | structured_match_llm


def analyze_skill_matches(required_skills, vector_store):
    results = []

    for skill in required_skills:

        documents = vector_store.similarity_search(
            skill,
            k=2
        )

        evidence = "\n\n".join(
            document.page_content
            for document in documents
        )

        result = match_chain.invoke({
            "skill": skill,
            "evidence": evidence
        })

        results.append(result)

    return results

structured_deep_llm = llm.with_structured_output(DeepAnalysis)
deep_prompt = ChatPromptTemplate.from_template(DEEP_ANALYSIS_PROMPT)
deep_chain = deep_prompt | structured_deep_llm

def analyze_deep_fit(job_title: str, target_skills: str, resume_text: str):
    return deep_chain.invoke({
        "job_title": job_title,
        "target_skills": target_skills,
        "resume_text": resume_text
    })