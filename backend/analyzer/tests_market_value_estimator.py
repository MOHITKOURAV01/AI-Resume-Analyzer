"""
Unit tests for Market Value Estimator.
"""

from django.test import TestCase
from .market_value_estimator import (
    normalize_role,
    normalize_level,
    calculate_salary_range,
    generate_negotiation_points,
)


class MarketValueEstimatorTests(TestCase):
    """Test suite for market value estimation logic."""

    def test_normalize_role(self):
        """Test role normalization."""
        self.assertEqual(
            normalize_role("Senior Software Engineer"), "software engineer"
        )
        self.assertEqual(normalize_role("Data Scientist"), "data scientist")
        self.assertEqual(normalize_role("Unknown Role"), "default")

    def test_normalize_level(self):
        """Test experience level normalization."""
        self.assertEqual(normalize_level("Junior"), "entry")
        self.assertEqual(normalize_level("Mid-level"), "mid")
        self.assertEqual(normalize_level("Senior"), "senior")
        self.assertEqual(normalize_level("Principal"), "lead")

    def test_calculate_salary_range_base(self):
        """Test basic salary range calculation."""
        result = calculate_salary_range("Software Engineer", "Mid", [])
        self.assertEqual(result["currency"], "USD")
        self.assertLess(result["min"], result["median"])
        self.assertLess(result["median"], result["max"])

    def test_calculate_salary_range_with_high_value_skills(self):
        """Test salary boost from high-value skills."""
        base_result = calculate_salary_range("Software Engineer", "Mid", [])
        boosted_result = calculate_salary_range(
            "Software Engineer", "Mid", ["AWS", "Kubernetes", "Machine Learning"]
        )

        self.assertGreater(boosted_result["median"], base_result["median"])

    def test_generate_negotiation_points(self):
        """Test generation of negotiation talking points."""
        points = generate_negotiation_points("Senior", ["Python", "Leadership", "AWS"])
        self.assertGreater(len(points), 0)
        self.assertTrue(any("Leadership" in p for p in points))
        self.assertTrue(any("AWS" in p for p in points))
