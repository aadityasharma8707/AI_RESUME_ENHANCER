import re

def analyze_resume_text(text: str) -> dict:
    """
    Analyzes resume text using purely deterministic (regex/heuristic) logic.
    Provides foundational metrics for the Overview page.
    """
    text_lower = text.lower()
    
    # 1. Word Count
    words = [w for w in text.split() if w.strip()]
    word_count = len(words)
    
    # 2. Contact Info Detection
    # Basic email regex
    has_email = bool(re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text))
    # Basic phone regex (at least 10 digits with optional separators)
    has_phone = bool(re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text))
    
    # 3. Standard Sections Detection
    # Common headers mapping
    section_patterns = {
        "experience": r'\b(experience|employment|work history|career history)\b',
        "education": r'\b(education|academic background|qualifications)\b',
        "skills": r'\b(skills|technologies|technical skills|core competencies)\b',
        "projects": r'\b(projects|personal projects|academic projects)\b',
        "summary": r'\b(summary|profile|professional summary|objective)\b'
    }
    
    sections_found = {}
    for section_name, pattern in section_patterns.items():
        # Check if it appears at the start of a line or is surrounded by newlines
        # Simplified for now: just checking presence in text as a basic heuristic
        sections_found[section_name] = bool(re.search(pattern, text_lower))

    # 4. Score Calculation
    # Start at 50, add points for good practices
    score = 50
    
    # Contact Info (+10 each)
    if has_email: score += 10
    if has_phone: score += 10
    
    # Word Count (+10 if reasonable length, e.g., 200-1000 words)
    if 200 <= word_count <= 1000:
        score += 10
    elif word_count > 1000:
        score += 5 # A bit too long
        
    # Sections (+5 for each core section)
    if sections_found["experience"]: score += 5
    if sections_found["education"]: score += 5
    if sections_found["skills"]: score += 5
    if sections_found["summary"]: score += 5
    
    # Cap at 100
    score = min(100, score)
    
    return {
        "overall_score": score,
        "metrics": {
            "word_count": word_count,
            "has_email": has_email,
            "has_phone": has_phone,
            "sections_found": sections_found
        }
    }
