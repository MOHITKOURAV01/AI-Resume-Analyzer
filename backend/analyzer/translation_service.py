"""
Service layer to handle secure, batched translation of resume text to English
for the core ATS scoring engine, preserving original text for user display.
"""

import logging
from typing import List, Optional
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class TranslationResult:
    original_text: str
    translated_text: str
    source_language: str
    target_language: str
    success: bool
    error_message: Optional[str] = None


class TranslationService:
    """
    Handles translation of resume text.
    Designed to be extended with actual API clients (e.g., Google Cloud Translation, DeepL).
    Includes a robust fallback/mock mode for development and testing without API keys.
    """

    MAX_CHUNK_SIZE = 4000  # Characters per translation request to respect API limits

    def __init__(self, use_mock: bool = False):
        """
        Initializes the translation service.
        :param use_mock: If True, uses a mock translator for testing/development.
        """
        self.use_mock = use_mock

    def translate_to_english(
        self, text: str, source_lang: str = "auto"
    ) -> TranslationResult:
        """
        Translates a given text to English. Handles chunking for long texts.
        """
        if not text or not text.strip():
            return TranslationResult(
                original_text=text,
                translated_text="",
                source_language=source_lang,
                target_language="en",
                success=True,
            )

        if source_lang == "en" or source_lang == "unknown":
            return TranslationResult(
                original_text=text,
                translated_text=text,
                source_language="en",
                target_language="en",
                success=True,
            )

        try:
            if self.use_mock:
                translated = self._mock_translate(text, source_lang)
            else:
                translated = self._actual_translate(text, source_lang)

            return TranslationResult(
                original_text=text,
                translated_text=translated,
                source_language=source_lang,
                target_language="en",
                success=True,
            )
        except Exception as e:
            logger.error(
                f"Translation failed for source language {source_lang}: {str(e)}"
            )
            return TranslationResult(
                original_text=text,
                translated_text=text,  # Fallback to original text on failure
                source_language=source_lang,
                target_language="en",
                success=False,
                error_message=str(e),
            )

    def _actual_translate(self, text: str, source_lang: str) -> str:
        """
        Placeholder for actual translation API integration.
        Chunks the text to avoid payload limits.
        """
        # Example structure for Google Cloud Translation or DeepL:
        # from google.cloud import translate_v2 as translate
        # translate_client = translate.Client()
        # result = translate_client.translate(text, target_language='en', source_language=source_lang)
        # return result['translatedText']

        # For now, if not in mock mode but no API is configured, we fall back gracefully
        # to prevent breaking the application. In production, this should be replaced
        # with a real API call.
        logger.warning(
            "Actual translation API not configured. Falling back to original text."
        )
        return text

    def _mock_translate(self, text: str, source_lang: str) -> str:
        """
        Mock translation for testing purposes.
        Prefixes the text to indicate it was 'translated' without altering the core content.
        """
        chunks = self._chunk_text(text)
        translated_chunks = []

        for chunk in chunks:
            # Simulate translation by adding a marker.
            # In a real scenario, this would be the API response.
            translated_chunks.append(f"[Translated from {source_lang}] {chunk}")

        return "\n".join(translated_chunks)

    def _chunk_text(self, text: str) -> List[str]:
        """Splits text into chunks respecting the MAX_CHUNK_SIZE."""
        if len(text) <= self.MAX_CHUNK_SIZE:
            return [text]

        chunks = []
        current_chunk = ""

        # Split by paragraphs first to maintain context
        paragraphs = text.split("\n\n")

        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 <= self.MAX_CHUNK_SIZE:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"

        if current_chunk:
            chunks.append(current_chunk.strip())

        return chunks
