"""
Unit tests for Tone Analyzer.
"""

from django.test import TestCase
from .tone_analyzer import (
    analyze_pronoun_usage,
    analyze_sentiment_and_confidence,
    analyze_tone,
)


class ToneAnalyzerTests(TestCase):
    """Test suite for tone and sentiment analysis logic."""

    def test_analyze_pronoun_usage_individual(self):
        """Test detection of individual-focused pronoun usage."""
        text = "I built the system. My code was efficient. I led the project."
        result = analyze_pronoun_usage(text)
        self.assertEqual(result["dominant"], "individual")
        self.assertGreater(result["ratio"], 0.6)

    def test_analyze_pronoun_usage_team(self):
        """Test detection of team-focused pronoun usage."""
        text = "We collaborated on the design. Our team delivered the product. We partnered with stakeholders."
        result = analyze_pronoun_usage(text)
        self.assertEqual(result["dominant"], "team")
        self.assertLess(result["ratio"], 0.4)

    def test_analyze_sentiment_and_confidence_strong(self):
        """Test scoring of strong, confident language."""
        text = "I spearheaded the initiative and delivered a 20% improvement. I architected the solution."
        result = analyze_sentiment_and_confidence(text)
        self.assertGreater(result["confidence_score"], 70)
        self.assertEqual(len(result["suggestions"]), 0)

    def test_analyze_sentiment_and_confidence_weak(self):
        """Test scoring and suggestions for weak language."""
        text = "I think I helped with the project. I tried to improve things. I was responsible for some tasks."
        result = analyze_sentiment_and_confidence(text)
        self.assertLess(result["confidence_score"], 50)
        self.assertLess(result["clarity_score"], 80)
        self.assertTrue(any("weak phrases" in s for s in result["suggestions"]))

    def test_analyze_tone_full_integration(self):
        """Test full tone analysis integration."""
        text = "I led a cross-functional team. We collaborated to architect a solution that increased efficiency by 30%."
        result = analyze_tone(text)

        self.assertIn("confidence_score", result)
        self.assertIn("collaboration_score", result)
        self.assertIn("overall_tone", result)
        self.assertEqual(result["pronoun_dominance"], "balanced")
