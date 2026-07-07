JOB_EXTRACTION_PROMPT = """
You are an expert technical recruiter.

Extract structured information from the following job description.

Job Description:
{job_description}

Identify:
- Job title
- Required skills
- Preferred skills
- Main responsibilities
- Required experience

Only use information present in the job description.
"""
SKILL_MATCH_PROMPT = """
You are an evidence-based technical recruiter.

Evaluate whether the candidate's resume provides evidence for the required skill.

Required Skill:
{skill}

Retrieved Resume Evidence:
{evidence}

Classify the match as exactly one of:
- Strong Match
- Partial Match
- No Evidence

Rules:
- Strong Match: direct and convincing evidence
- Partial Match: related or indirect evidence
- No Evidence: no meaningful evidence
- Never invent candidate experience
"""

DEEP_ANALYSIS_PROMPT = """
You are an expert technical recruiter and resume analyst.

Evaluate the resume's fit for the target job title and skills.

Target Job Title: {job_title}
Target Skills: {target_skills}

Resume Content:
{resume_text}

Analyze the resume and provide the following:
1. Infer any crucial role-relevant skills that are implicitly expected for this title but weren't provided.
2. Identify which of the combined skills (target + inferred) are completely missing from the resume.
3. Evaluate the relevance of the candidate's experience to the target role. (Be specific using actual resume content).
4. Evaluate the relevance of the candidate's projects to the target role. (Be specific using actual resume content).
5. Identify the top strengths (reasons the resume fits the target).
6. Identify the top gaps (reasons the resume does not fully fit).
7. Determine the overall fit: Strong Fit, Good Fit, Partial Fit, or Weak Fit, and provide a 1-2 sentence reasoning.

RULES:
- Base everything STRICTLY on the provided resume content.
- DO NOT fabricate, guess, or invent any experience, projects, metrics, or technologies.
- Do NOT include ATS factors or resume writing advice.
"""

AI_SUGGESTIONS_PROMPT = """
You are an expert career coach and technical resume editor.

Review the candidate's resume, their target job, and our internal Deep Analysis findings.

Target Job Title: {job_title}
Target Skills: {target_skills}

Deep Analysis Context:
{deep_analysis_context}

Raw Resume Text:
{resume_text}

Your task is to generate actionable, grounded improvements for this resume divided into TWO categories:
1. Resume Improvements (rewriting weak text, clarifying ownership, removing vagueness).
2. Skill Improvements (action plans for missing target skills or weak evidence skills).

ABSOLUTE ANTI-FABRICATION RULE:
- NEVER invent achievements, metrics, revenue, team sizes, technologies, responsibilities, or years of experience.
- When suggesting a rewrite, use ONLY facts present in the raw resume text.
- If necessary facts are missing, use a bracketed placeholder like "[Add specific outcome here]".

For Skill Improvements:
- 'Target Skill Gap' means the user provided the skill but it's completely missing from the resume.
- 'Role-relevant Opportunity' means the AI inferred the skill based on the job title, but it's missing.
- 'Evidence Gap' means the skill is listed in the resume, but not backed up by a project or job description.

Keep suggestions high-quality. Do not create duplicates. Focus on the most impactful changes.
"""