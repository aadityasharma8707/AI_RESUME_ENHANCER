import os
from pydantic import BaseModel
from typing import List

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

class DocumentHTML(BaseModel):
    html: str

class WritingIssue(BaseModel):
    original_text: str
    problem: str
    why: str
    rewrite: str

class SectionReview(BaseModel):
    issues: List[WritingIssue]

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0
)

document_html_llm = llm.with_structured_output(DocumentHTML)
section_review_llm = llm.with_structured_output(SectionReview)

def convert_resume_to_html(resume_text: str) -> dict:
    prompt = ChatPromptTemplate.from_template("""
    You are an expert resume formatter. Convert the following plain text resume into a clean, semantic HTML document.
    
    RULES:
    - CRITICAL: You must convert the ENTIRE resume, all pages from start to finish. Do not truncate, summarize, or stop early.
    - Preserve the original resume structure, text order, headings, paragraphs, and bullet points exactly.
    - Add a <hr class="page-break" /> if you detect a logical page break, or keep it continuous if unsure.
    - Use semantic HTML tags: <h1> for name, <h2> for section headers, <p> for text, <ul> and <li> for lists, <b> for bold emphasis.
    - Do NOT wrap the HTML in ```html blocks or add a body tag. Just return the raw HTML content.
    - Do NOT invent or fabricate any information.
    
    Resume Text:
    {resume_text}
    """)
    
    chain = prompt | document_html_llm
    
    try:
        result = chain.invoke({"resume_text": resume_text})
        return {"html": result.html}
    except Exception as e:
        print(f"Error converting resume: {e}")
        paragraphs = resume_text.split('\n\n')
        fallback_html = "".join([f"<p>{p.strip()}</p>" for p in paragraphs if p.strip()])
        return {"html": fallback_html}

def review_resume_section(section_name: str, text: str) -> list:
    if not text.strip():
        return []
        
    prompt = ChatPromptTemplate.from_template("""
    You are an expert resume writer. Review the following text from the '{section_name}' section of a resume.
    Identify WEAK WRITING issues such as:
    - vague wording
    - unclear contribution
    - weak descriptions
    - repetition
    - poor professional phrasing
    - unnecessarily wordy text
    
    ANTI-FABRICATION RULE:
    You must NEVER invent metrics, percentages, achievements, technologies, responsibilities, team sizes, experience, outcomes, or business impact.
    Suggested rewrites must preserve original facts. If stronger wording requires missing information, use a clearly visible placeholder (e.g. [Metric]) instead of inventing it.
    
    Do not flag content just to fill the page. Only flag genuine writing issues.
    The 'original_text' MUST be an EXACT substring of the provided text, so it can be highlighted in the UI.
    
    Text to review:
    {text}
    """)
    
    chain = prompt | section_review_llm
    
    try:
        result = chain.invoke({"section_name": section_name, "text": text})
        return [issue.model_dump() for issue in result.issues]
    except Exception as e:
        print(f"Error reviewing section: {e}")
        return []
