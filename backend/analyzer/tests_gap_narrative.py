"""
Unit tests for Gap Narrative Builder.
"""

from django.test import TestCase
from .gap_narrative import parse_date, detect_gaps, generate_narratives


class GapNarrativeTests(TestCase):
    """Test suite for gap detection and narrative generation logic."""

    def test_parse_date_various_formats(self):
        """Test parsing of different date string formats."""
        self.assertIsNotNone(parse_date("Jan 2020"))
        self.assertIsNotNone(parse_date("March 2021"))
        self.assertIsNotNone(parse_date("2022"))
        self.assertIsNotNone(parse_date("Present"))
        self.assertIsNone(parse_date("Invalid Date"))

    def test_detect_gaps_finds_gap(self):
        """Test detection of a gap greater than 3 months."""
        timeline = [
            {"role": "Role A", "start_date": "Jan 2022", "end_date": "Present"},
            {"role": "Role B", "start_date": "Jan 2020", "end_date": "Dec 2020"},
        ]
        gaps = detect_gaps(timeline)
        self.assertEqual(len(gaps), 1)
        self.assertEqual(gaps[0]["duration_months"], 13)  # Jan 2021 to Jan 2022

    def test_detect_gaps_no_gap(self):
        """Test that contiguous roles do not trigger a gap."""
        timeline = [
            {"role": "Role A", "start_date": "Jan 2022", "end_date": "Present"},
            {"role": "Role B", "start_date": "Jan 2020", "end_date": "Dec 2021"},
        ]
        gaps = detect_gaps(timeline)
        self.assertEqual(len(gaps), 0)

    def test_generate_narratives_creates_options(self):
        """Test that narratives are generated for detected gaps."""
        gaps = [
            {
                "role_before": "Dev",
                "role_after": "Senior Dev",
                "start_date": "Jan 2021",
                "end_date": "Jan 2022",
                "duration_months": 12,
            }
        ]
        context = {
            "skills": "Python",
            "target_role": "Software Engineer",
            "activities": "open source contributions",
        }

        results = generate_narratives(gaps, context)
        self.assertEqual(len(results), 1)
        self.assertGreater(len(results[0]["narratives"]), 0)
        self.assertIn("Python", results[0]["narratives"][0]["text"])
        self.assertIn("Senior Dev", results[0]["narratives"][0]["text"])
        self.assertIn("open source contributions", results[0]["narratives"][0]["text"])
