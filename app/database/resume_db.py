import sqlite3
import os
import hashlib
from datetime import datetime
from uuid import uuid4

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "resume_library.db")
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploaded_resumes")

def init_db():
    if not os.path.exists(UPLOAD_DIR):
        os.makedirs(UPLOAD_DIR)

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resume_documents (
            id TEXT PRIMARY KEY,
            display_name TEXT,
            original_filename TEXT,
            source TEXT,
            file_path TEXT,
            content_hash TEXT UNIQUE,
            target_job_title TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)
    try:
        cursor.execute("ALTER TABLE resume_documents ADD COLUMN extracted_text TEXT")
    except sqlite3.OperationalError:
        pass
    try:
        cursor.execute("ALTER TABLE resume_documents ADD COLUMN extracted_skills TEXT")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def compute_hash(file_bytes: bytes) -> str:
    return hashlib.sha256(file_bytes).hexdigest()

def get_resume_by_hash(content_hash: str):
    conn = get_db_connection()
    doc = conn.execute("SELECT * FROM resume_documents WHERE content_hash = ?", (content_hash,)).fetchone()
    conn.close()
    return dict(doc) if doc else None

def save_resume_document(file_bytes: bytes, filename: str, target_job_title: str, extracted_text: str = None, extracted_skills: str = None):
    init_db()
    
    content_hash = compute_hash(file_bytes)
    existing = get_resume_by_hash(content_hash)
    if existing:
        # If job title changed, we could update it, but for duplicate prevention just return existing
        return existing
        
    doc_id = str(uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{doc_id}.pdf")
    
    with open(file_path, "wb") as f:
        f.write(file_bytes)
        
    now = datetime.utcnow().isoformat()
    
    conn = get_db_connection()
    conn.execute("""
        INSERT INTO resume_documents 
        (id, display_name, original_filename, source, file_path, content_hash, target_job_title, created_at, updated_at, extracted_text, extracted_skills)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (doc_id, filename, filename, "Uploaded", file_path, content_hash, target_job_title, now, now, extracted_text, extracted_skills))
    conn.commit()
    
    doc = conn.execute("SELECT * FROM resume_documents WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    return dict(doc)

def get_all_resumes():
    init_db()
    conn = get_db_connection()
    # Explicitly exclude structured_data from the list to avoid huge payload and freezing
    docs = conn.execute("""
        SELECT id, display_name, original_filename, source, file_path, content_hash, target_job_title, created_at, updated_at, extracted_skills
        FROM resume_documents 
        ORDER BY created_at DESC
    """).fetchall()
    conn.close()
    return [dict(d) for d in docs]

def get_resume(doc_id: str):
    init_db()
    conn = get_db_connection()
    doc = conn.execute("SELECT * FROM resume_documents WHERE id = ?", (doc_id,)).fetchone()
    conn.close()
    return dict(doc) if doc else None

def delete_resume(doc_id: str):
    doc = get_resume(doc_id)
    if not doc:
        return False
        
    # Delete physical file
    file_path = doc["file_path"]
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass # Keep going to delete DB record even if file deletion fails
            
    conn = get_db_connection()
    conn.execute("DELETE FROM resume_documents WHERE id = ?", (doc_id,))
    conn.commit()
    conn.close()
    return True
