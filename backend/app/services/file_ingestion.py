import csv
import io
from email import policy
from email.parser import BytesParser

import pandas as pd
from docx import Document as DocxDocument
from pypdf import PdfReader


SUPPORTED_EXTENSIONS = {".txt", ".md", ".csv", ".pdf", ".docx", ".eml"}


def extract_text(filename: str, file_content: bytes) -> str:
    lower_name = filename.lower()
    if lower_name.endswith(".txt") or lower_name.endswith(".md"):
        return file_content.decode("utf-8", errors="ignore")

    if lower_name.endswith(".csv"):
        try:
            dataframe = pd.read_csv(io.BytesIO(file_content))
            return dataframe.to_csv(index=False)
        except Exception:
            csv_rows = list(csv.reader(io.StringIO(file_content.decode("utf-8", errors="ignore"))))
            return "\n".join([", ".join(row) for row in csv_rows])

    if lower_name.endswith(".pdf"):
        reader = PdfReader(io.BytesIO(file_content))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n".join(pages)

    if lower_name.endswith(".docx"):
        document = DocxDocument(io.BytesIO(file_content))
        return "\n".join([paragraph.text for paragraph in document.paragraphs])

    if lower_name.endswith(".eml"):
        message = BytesParser(policy=policy.default).parsebytes(file_content)
        body = message.get_body(preferencelist=("plain", "html"))
        if body:
            return body.get_content()
        return str(message)

    raise ValueError("Unsupported file extension. Use PDF, DOCX, CSV, TXT/MD, or EML.")
