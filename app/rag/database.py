from langchain_chroma import Chroma

from app.rag.embeddings import embeddings


def create_resume_vector_store(chunks):
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings
    )

    return vector_store