"""
Unit tests for Project Portfolio Extractor.
"""

from django.test import TestCase
from .project_extractor import extract_projects, score_project_impact, analyze_portfolio


class ProjectExtractorTests(TestCase):
    """Test suite for project extraction and scoring logic."""

    def test_extract_projects_finds_section(self):
        """Test extraction of projects section."""
        resume = """
        Experience
        Some job
        
        Projects
        - Built a web app using React.
        - Developed a Python script.
        
        Education
        Some degree
        """
        projects = extract_projects(resume)
        self.assertEqual(len(projects), 2)
        self.assertIn("React", projects[0]["description"])

    def test_extract_projects_no_section(self):
        """Test handling of resume without projects section."""
        resume = "Experience\nSome job\nEducation\nSome degree"
        projects = extract_projects(resume)
        self.assertEqual(projects, [])

    def test_score_project_impact_high_score(self):
        """Test scoring of a high-impact project."""
        project = {
            "name": "E-commerce App",
            "description": "Architected and developed a React web app serving 10k users, increasing sales by 20%.",
        }
        result = score_project_impact(project)
        self.assertGreater(result["impact_score"], 80)
        self.assertEqual(len(result["suggestions"]), 0)

    def test_score_project_impact_low_score(self):
        """Test scoring of a low-impact project with suggestions."""
        project = {
            "name": "My Project",
            "description": "I worked on a thing and it was good.",
        }
        result = score_project_impact(project)
        self.assertLess(result["impact_score"], 60)
        self.assertGreater(len(result["suggestions"]), 0)
        self.assertTrue(any("quantifiable metrics" in s for s in result["suggestions"]))

    def test_analyze_portfolio_empty(self):
        """Test analyze_portfolio with no projects."""
        results = analyze_portfolio("No projects here.")
        self.assertEqual(results, [])
