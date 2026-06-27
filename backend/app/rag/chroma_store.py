from langchain_community.embeddings import FakeEmbeddings
from langchain_core.documents import Document
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma

from app.core.config import get_settings


class ChromaService:
    def __init__(self) -> None:
        settings = get_settings()
        if settings.google_api_key:
            embeddings = GoogleGenerativeAIEmbeddings(
                model="models/text-embedding-004",
                google_api_key=settings.google_api_key,
            )
        else:
            embeddings = FakeEmbeddings(size=768)

        self.vectorstore = Chroma(
            collection_name="decisionpilot-knowledge",
            embedding_function=embeddings,
            persist_directory=settings.chroma_dir,
        )

    def add_documents(self, customer_id: str, source_type: str, filename: str, content: str) -> None:
        if not content.strip():
            return
        document = Document(
            page_content=content,
            metadata={
                "customer_id": customer_id,
                "source_type": source_type,
                "filename": filename,
            },
        )
        self.vectorstore.add_documents([document])

    def retrieve(self, customer_id: str, query: str, k: int = 5) -> list[Document]:
        return self.vectorstore.similarity_search(
            query,
            k=k,
            filter={"customer_id": customer_id},
        )


chroma_service = ChromaService()
