import os

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

from app.prompts import JOB_EXTRACTION_PROMPT
from app.schemas.io_models import JobRequirements


load_dotenv()


llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)

structured_llm = llm.with_structured_output(JobRequirements)

prompt = ChatPromptTemplate.from_template(JOB_EXTRACTION_PROMPT)

job_extraction_chain = prompt | structured_llm


def extract_job_requirements(job_description: str) -> JobRequirements:
    return job_extraction_chain.invoke({
        "job_description": job_description
    })