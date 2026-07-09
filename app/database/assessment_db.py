import sqlite3
import os
import json
from uuid import uuid4
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "resume_library.db")

def init_assessment_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id TEXT PRIMARY KEY,
            resume_id TEXT,
            skill TEXT,
            assessment_data TEXT,
            hidden_answers TEXT,
            created_at TIMESTAMP
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessment_results (
            id TEXT PRIMARY KEY,
            assessment_id TEXT UNIQUE,
            resume_id TEXT,
            resume_filename TEXT,
            skill TEXT,
            concept_score INTEGER,
            applied_score INTEGER,
            practical_score INTEGER,
            total_score INTEGER,
            outcome TEXT,
            feedback_json TEXT,
            created_at TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def save_assessment(resume_id: str, skill: str, assessment_data: dict, hidden_answers: dict) -> str:
    init_assessment_db()
    assessment_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO assessments 
        (id, resume_id, skill, assessment_data, hidden_answers, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (assessment_id, resume_id, skill, json.dumps(assessment_data), json.dumps(hidden_answers), now))
    conn.commit()
    conn.close()
    
    return assessment_id

def get_assessment(assessment_id: str):
    init_assessment_db()
    conn = get_db_connection()
    doc = conn.execute("SELECT * FROM assessments WHERE id = ?", (assessment_id,)).fetchone()
    conn.close()
    
    if not doc:
        return None
        
    return {
        "id": doc["id"],
        "resume_id": doc["resume_id"],
        "skill": doc["skill"],
        "assessment_data": json.loads(doc["assessment_data"]),
        "hidden_answers": json.loads(doc["hidden_answers"]),
        "created_at": doc["created_at"]
    }

def has_assessment_result(assessment_id: str) -> bool:
    init_assessment_db()
    conn = get_db_connection()
    doc = conn.execute("SELECT id FROM assessment_results WHERE assessment_id = ?", (assessment_id,)).fetchone()
    conn.close()
    return bool(doc)

def save_assessment_result(
    assessment_id: str, resume_id: str, resume_filename: str, skill: str,
    concept_score: int, applied_score: int, practical_score: int, total_score: int,
    outcome: str, feedback: dict
) -> str:
    init_assessment_db()
    result_id = str(uuid4())
    now = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO assessment_results 
        (id, assessment_id, resume_id, resume_filename, skill, concept_score, applied_score, practical_score, total_score, outcome, feedback_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (result_id, assessment_id, resume_id, resume_filename, skill, concept_score, applied_score, practical_score, total_score, outcome, json.dumps(feedback), now))
    conn.commit()
    conn.close()
    return result_id

def get_verification_history():
    init_assessment_db()
    conn = get_db_connection()
    docs = conn.execute("""
        SELECT * FROM assessment_results ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    
    return [{
        "id": d["id"],
        "assessment_id": d["assessment_id"],
        "resume_id": d["resume_id"],
        "resume_filename": d["resume_filename"],
        "skill": d["skill"],
        "concept_score": d["concept_score"],
        "applied_score": d["applied_score"],
        "practical_score": d["practical_score"],
        "total_score": d["total_score"],
        "outcome": d["outcome"],
        "feedback": json.loads(d["feedback_json"]),
        "created_at": d["created_at"]
    } for d in docs]

def get_resume_skill_status(resume_id: str):
    init_assessment_db()
    conn = get_db_connection()
    docs = conn.execute("""
        SELECT skill, outcome, created_at 
        FROM assessment_results 
        WHERE resume_id = ? 
        ORDER BY created_at ASC
    """, (resume_id,)).fetchall()
    conn.close()
    
    status_map = {}
    for d in docs:
        status_map[d["skill"]] = d["outcome"]
    return status_map
