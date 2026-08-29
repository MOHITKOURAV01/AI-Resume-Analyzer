"""
Unit tests for Skill Proficiency Estimator.
"""

from django.test import TestCase
from .proficiency_estimator import analyze_skill_context, estimate_all_proficiencies


class ProficiencyEstimatorTests(TestCase):
    """Test suite for proficiency estimation logic."""

    def test_analyze_skill_context_beginner(self):
        """Test detection of beginner-level context."""
        resume = "I have basic knowledge of Python and helped with some scripts."
        result = analyze_skill_context(resume, "Python")
        self.assertEqual(result["estimated_level"], "Beginner")
        self.assertLess(result["confidence_score"], 50)

    def test_analyze_skill_context_expert_with_metrics(self):
        """Test detection of expert-level context with metrics."""
        resume = "I have 8+ years of experience in Python. I architected a system serving 10 million users, optimizing performance by 40%."
        result = analyze_skill_context(resume, "Python")
        self.assertEqual(result["estimated_level"], "Expert")
        self.assertGreater(result["confidence_score"], 80)
        self.assertEqual(len(result["warnings"]), 0)

    def test_analyze_skill_context_unsupported_expert_claim(self):
        """Test flagging of unsupported expert claims."""
        resume = "I am a subject matter expert in Python."
        result = analyze_skill_context(resume, "Python")
        self.assertEqual(result["estimated_level"], "Expert")
        self.assertGreater(len(result["warnings"]), 0)
        self.assertIn("lacks quantifiable metrics", result["warnings"][0])

    def test_estimate_all_proficiencies_empty(self):
        """Test handling of empty skills list."""
        results = estimate_all_proficiencies("Some text", [])
        self.assertEqual(results, [])

    def test_estimate_all_proficiencies_sorting(self):
        """Test that results are sorted by confidence score descending."""
        resume = "Basic knowledge of Java. 10+ years of experience in Python, architected systems."
        skills = ["Java", "Python"]
        results = estimate_all_proficiencies(resume, skills)
        self.assertEqual(results[0]["skill"], "Python")
        self.assertEqual(results[1]["skill"], "Java")
        self.assertGreater(
            results[0]["confidence_score"], results[1]["confidence_score"]
        )
