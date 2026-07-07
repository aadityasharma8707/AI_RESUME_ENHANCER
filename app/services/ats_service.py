import re

def evaluate_ats_score(resume_text: str, target_skills: str) -> dict:
    # 1. Categories & Weights
    # Weights sum to 100
    category_weights = {
        "Parseability & Extraction": 20,
        "Structure & Headings": 25,
        "Contact Information": 20,
        "Formatting Safety": 15,
        "Keyword Visibility": 20
    }
    
    categories = {
        "Parseability & Extraction": {"score": 0, "checks": []},
        "Structure & Headings": {"score": 0, "checks": []},
        "Contact Information": {"score": 0, "checks": []},
        "Formatting Safety": {"score": 0, "checks": []},
        "Keyword Visibility": {"score": 0, "checks": []}
    }
    
    total_score = 0
    recommendations = []
    
    # helper for checking
    def add_check(category: str, name: str, status: str, pass_points: float, message: str):
        categories[category]["checks"].append({
            "name": name,
            "status": status,
            "message": message
        })
        if status == "Passed":
            categories[category]["score"] += pass_points
        elif status == "Warning":
            categories[category]["score"] += pass_points / 2.0
            
    text_len = len(resume_text.strip())
    
    # --- Parseability & Extraction (20 pts) ---
    # Check 1: Useful text volume (10 pts)
    if text_len > 1500:
        add_check("Parseability & Extraction", "Useful Text Volume", "Passed", 10, "Substantial readable text extracted.")
    elif text_len > 500:
        add_check("Parseability & Extraction", "Useful Text Volume", "Warning", 10, "Low readable text volume extracted. Ensure resume is not image-based.")
        recommendations.append("Ensure your resume uses standard selectable text, not image-based text.")
    else:
        add_check("Parseability & Extraction", "Useful Text Volume", "Failed", 10, "Almost no readable text extracted. Likely an image-based PDF or flattened file.")
        recommendations.append("Your resume text could not be extracted. Use a standard Word-to-PDF export with selectable text.")
        
    # Check 2: Text extraction quality (10 pts)
    # Check for excessive unreadable characters (unicode replacements etc)
    unreadable_chars = len(re.findall(r'[\ufffd\x00-\x08\x0b\x0c\x0e-\x1f]', resume_text))
    if unreadable_chars == 0:
        add_check("Parseability & Extraction", "Text Extraction Quality", "Passed", 10, "No corrupted characters detected.")
    elif unreadable_chars < 5:
        add_check("Parseability & Extraction", "Text Extraction Quality", "Warning", 10, "A few irregular characters detected.")
    else:
        add_check("Parseability & Extraction", "Text Extraction Quality", "Failed", 10, "Excessive corrupted characters detected. ATS parsing may fail.")
        recommendations.append("Remove custom icon fonts or complex symbols that corrupt text extraction.")

    # --- Structure & Headings (25 pts) ---
    # Standard headings check
    standard_headings = ["experience", "education", "skills", "projects", "summary", "profile"]
    found_headings = []
    lines = [line.strip().lower() for line in resume_text.split('\n') if line.strip()]
    
    for heading in standard_headings:
        # Check if heading appears alone on a line (common ATS heuristic)
        if any(heading in line and len(line) < 30 for line in lines):
            found_headings.append(heading)
            
    # Check 1: Detectable Standard Sections (15 pts)
    if len(found_headings) >= 3:
        add_check("Structure & Headings", "Recognizable Sections", "Passed", 15, f"Detected {len(found_headings)} standard sections.")
    elif len(found_headings) > 0:
        add_check("Structure & Headings", "Recognizable Sections", "Warning", 15, "Detected few standard sections. Use traditional headings (e.g., 'Experience').")
        recommendations.append("Use standard, clear section headings like 'Experience', 'Education', and 'Skills' so ATS can segment your resume.")
    else:
        add_check("Structure & Headings", "Recognizable Sections", "Failed", 15, "No standard sections detected.")
        recommendations.append("Use standard, clear section headings like 'Experience', 'Education', and 'Skills' so ATS can segment your resume.")
        
    # Check 2: Core Sections Present (10 pts)
    has_experience = "experience" in found_headings
    has_education = "education" in found_headings
    if has_experience and has_education:
        add_check("Structure & Headings", "Core Sections Present", "Passed", 10, "Experience and Education sections both detected.")
    elif has_experience or has_education:
        add_check("Structure & Headings", "Core Sections Present", "Warning", 10, "Missing either Experience or Education heading.")
    else:
        add_check("Structure & Headings", "Core Sections Present", "Failed", 10, "Missing both Experience and Education headings.")

    # --- Contact Information (20 pts) ---
    # Check 1: Email (10 pts)
    has_email = bool(re.search(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+', resume_text))
    if has_email:
        add_check("Contact Information", "Email Detectable", "Passed", 10, "Valid email address extracted.")
    else:
        add_check("Contact Information", "Email Detectable", "Failed", 10, "No email address detected.")
        recommendations.append("Include a standard, machine-readable email address at the top of your resume.")
        
    # Check 2: Phone (10 pts)
    # Simple regex for phone
    has_phone = bool(re.search(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', resume_text))
    if has_phone:
        add_check("Contact Information", "Phone Detectable", "Passed", 10, "Valid phone number extracted.")
    else:
        add_check("Contact Information", "Phone Detectable", "Failed", 10, "No phone number detected.")
        recommendations.append("Include a standard format phone number (e.g. 555-123-4567).")

    # --- Formatting Safety (15 pts) ---
    # Check 1: Reasonable length (5 pts)
    if text_len < 8000:
        add_check("Formatting Safety", "Resume Length", "Passed", 5, "Resume length is within safe ATS parsing limits.")
    else:
        add_check("Formatting Safety", "Resume Length", "Failed", 5, "Resume is excessively long, potentially causing parsing timeouts or cutoffs.")
        
    # Check 2: Special Characters (10 pts)
    # Excessive punctuation or weird bullets
    special_chars = len(re.findall(r'[*|/\\#@!~^&]', resume_text))
    if special_chars < 50:
        add_check("Formatting Safety", "Special Character Density", "Passed", 10, "Special character density is normal.")
    else:
        add_check("Formatting Safety", "Special Character Density", "Warning", 10, "High density of special characters detected.")
        recommendations.append("Avoid complex ASCII art, dividers, or unconventional bullet points that confuse parsers.")

    # --- Keyword Visibility (20 pts) ---
    # Check 1: Target Skills (20 pts)
    if target_skills.strip():
        skills = [s.strip().lower() for s in target_skills.split(',') if s.strip()]
        found_count = 0
        text_lower = resume_text.lower()
        for s in skills:
            if s in text_lower:
                found_count += 1
                
        if found_count == len(skills) and len(skills) > 0:
            add_check("Keyword Visibility", "Target Skills Exact Match", "Passed", 20, f"All {len(skills)} provided target skills were exactly matched.")
        elif found_count > 0:
            add_check("Keyword Visibility", "Target Skills Exact Match", "Warning", 20, f"Only {found_count} of {len(skills)} provided target skills were exactly matched.")
            recommendations.append("Ensure target skills are written in your resume exactly as they appear in standard job descriptions.")
        else:
            add_check("Keyword Visibility", "Target Skills Exact Match", "Failed", 20, "None of the provided target skills were exactly matched.")
            recommendations.append("Include exact keyword matches for required skills to ensure ATS indexing.")
    else:
        # If no target skills provided, we just give pass based on general tech term extraction heuristics
        add_check("Keyword Visibility", "Target Skills Exact Match", "Warning", 20, "No target skills provided to evaluate keyword visibility.")

    # Calculate final score
    overall_score = 0
    for cat in categories.values():
        overall_score += cat["score"]
        
    overall_score = int(round(overall_score))
    
    # Score band
    if overall_score >= 90:
        band = "Excellent"
    elif overall_score >= 75:
        band = "Strong"
    elif overall_score >= 60:
        band = "Needs Improvement"
    else:
        band = "High Risk"
        
    # Deduplicate recommendations
    unique_recommendations = list(dict.fromkeys(recommendations))
        
    return {
        "ats_engine_version": "1.0",
        "overall_score": overall_score,
        "score_band": band,
        "categories": categories,
        "recommendations": unique_recommendations
    }
