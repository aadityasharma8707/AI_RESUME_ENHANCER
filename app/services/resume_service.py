from io import BytesIO

from pypdf import PdfReader
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def process_resume(file_bytes: bytes, filename: str):
    pdf_reader = PdfReader(BytesIO(file_bytes))

    resume_text = ""

    for page in pdf_reader.pages:
        page_text = page.extract_text()

        if page_text:
            resume_text += page_text + "\n"

    document = Document(
        page_content=resume_text,
        metadata={
            "source": filename,
            "type": "resume"
        }
    )

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents([document])

    return resume_text, chunks