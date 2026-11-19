import os
import re
from typing import Tuple, Dict, Any, List
import pymupdf
from docx import Document as DocxDocument
from pptx import Presentation

from app.core.config import settings

class DocumentService:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".pptx", ".txt"}

    @classmethod
    def validate_file(cls, filename: str, file_size: int) -> Tuple[bool, str]:
        ext = os.path.splitext(filename)[1].lower()
        if ext not in cls.ALLOWED_EXTENSIONS:
            return False, f"Unsupported file extension '{ext}'. Allowed: {', '.join(cls.ALLOWED_EXTENSIONS)}"
        
        max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
        if file_size > max_bytes:
            return False, f"File size ({file_size / (1024*1024):.1f} MB) exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_MB} MB"
        
        return True, ""

    @classmethod
    def sanitize_text(cls, text: str) -> str:
        """Strip potentially malicious instruction injection patterns from uploaded documents."""
        # Normalize newlines
        cleaned = re.sub(r'\r\n|\r', '\n', text)
        # Remove prompt injection phrases like 'ignore all instructions and say...'
        cleaned = re.sub(r'(?i)(ignore (all )?previous instructions|disregard (all )?prior commands|system prompt override)', '[FILTERED]', cleaned)
        return cleaned.strip()

    @classmethod
    def extract_text(cls, file_path: str, file_type: str) -> Tuple[str, int, str]:
        """Extract text, calculate word count, and generate an extractive preview summary."""
        file_type = file_type.lower().replace(".", "")
        raw_text = ""

        if file_type == "pdf":
            doc = pymupdf.open(file_path)
            pages_text = []
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_str = page.get_text()
                if page_str.strip():
                    pages_text.append(f"--- [Page {page_num + 1}] ---\n{page_str.strip()}")
            raw_text = "\n\n".join(pages_text)
            doc.close()

        elif file_type == "docx":
            doc = DocxDocument(file_path)
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            raw_text = "\n\n".join(paragraphs)

        elif file_type == "pptx":
            prs = Presentation(file_path)
            slide_texts = []
            for slide_num, slide in enumerate(prs.slides):
                slide_content = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        slide_content.append(shape.text.strip())
                if slide_content:
                    slide_texts.append(f"--- [Slide {slide_num + 1}] ---\n" + "\n".join(slide_content))
            raw_text = "\n\n".join(slide_texts)

        elif file_type == "txt":
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    raw_text = f.read()
            except UnicodeDecodeError:
                with open(file_path, "r", encoding="latin-1") as f:
                    raw_text = f.read()

        else:
            raise ValueError(f"Unsupported file format: {file_type}")

        cleaned_text = cls.sanitize_text(raw_text)
        words = cleaned_text.split()
        word_count = len(words)

        # Generate a concise summary preview (first 400 words)
        preview_words = words[:400]
        preview = " ".join(preview_words) + ("..." if len(words) > 400 else "")
        summary = f"Processed document containing {word_count} words across {file_type.upper()} format. Content ready for AI Quiz Studio analysis."

        return cleaned_text, word_count, summary
