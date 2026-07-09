from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from app.database.resume_db import get_all_resumes, get_resume, delete_resume

router = APIRouter(prefix="/resume-builder", tags=["resume-builder"])

@router.get("/resumes")
def list_resumes():
    return get_all_resumes()

@router.get("/resumes/{doc_id}")
def get_resume_metadata(doc_id: str):
    doc = get_resume(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
    return doc

@router.get("/resumes/{doc_id}/file")
def get_resume_file(doc_id: str):
    doc = get_resume(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    file_path = doc["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file is missing from storage")
        
    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        headers={"Content-Disposition": f'inline; filename="{doc["original_filename"]}"'}
    )

@router.get("/resumes/{doc_id}/download")
def download_resume_file(doc_id: str):
    doc = get_resume(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    file_path = doc["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Resume file is missing from storage")
        
    return FileResponse(
        path=file_path,
        filename=doc["original_filename"],
        media_type="application/pdf",
        content_disposition_type="attachment"
    )

@router.delete("/resumes/{doc_id}")
def delete_resume_doc(doc_id: str):
    success = delete_resume(doc_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"message": "Resume deleted successfully"}

import json
from pydantic import BaseModel
from app.services.builder_ai import convert_resume_to_html, review_resume_section

class StructuredDataUpdate(BaseModel):
    structured_data: dict

from app.services.resume_service import process_resume

@router.get("/resumes/{doc_id}/structured")
def get_structured_resume(doc_id: str):
    doc = get_resume(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    if doc.get("structured_data"):
        data = json.loads(doc["structured_data"])
        # Ensure we have the new full-page version (version 2)
        if data.get("html") and data["html"].strip() and data.get("version") == 2:
            return data
            
    # If not present or old version, parse and generate it from original PDF
    file_bytes = open(doc["file_path"], "rb").read()
    resume_text, _ = process_resume(file_bytes, doc["original_filename"])
    
    structured = convert_resume_to_html(resume_text)
    structured["version"] = 2
    
    # Save it to DB
    from app.database.resume_db import get_db_connection
    conn = get_db_connection()
    conn.execute("UPDATE resume_documents SET structured_data = ? WHERE id = ?", (json.dumps(structured), doc_id))
    conn.commit()
    conn.close()
    
    return structured

@router.put("/resumes/{doc_id}/structured")
def update_resume_structured(doc_id: str, data: StructuredDataUpdate):
    doc = get_resume(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Resume not found")
        
    from app.database.resume_db import get_db_connection
    conn = get_db_connection()
    
    data_dict = data.structured_data
    data_dict["version"] = 2
    
    conn.execute("UPDATE resume_documents SET structured_data = ? WHERE id = ?", (json.dumps(data_dict), doc_id))
    conn.commit()
    conn.close()
    
    return {"message": "Updated successfully"}

class ReviewRequest(BaseModel):
    section_name: str
    text: str

@router.post("/resumes/{doc_id}/review")
def review_section(doc_id: str, req: ReviewRequest):
    issues = review_resume_section(req.section_name, req.text)
    return {"issues": issues}
