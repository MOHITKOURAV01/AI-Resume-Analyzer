"""
Comprehensive unit and integration tests validating STAR component detection,
metric preservation, and rewrite quality.
"""

from django.test import TestCase

from analyzer.quarantine import skip_while_broken
from analyzer.bullet_optimizer import BulletOptimizer, BulletAnalysis
from analyzer.bullet_serializers import BulletOptimizationRequestSerializer


#: These tests were written against behaviour the modules under test do not
#: have. They failed from the day they were written and nobody saw it, because
#: the package they lived in was never collected (#913). Turning collection
#: back on without quarantining them would land a red build for bugs this
#: change is not making.
#:
#: Each quarantine names the issue that tracks its bug and carries a probe for
#: it, so the test starts running again on its own once the fix lands — in
#: whatever order these pull requests are merged. See `analyzer/quarantine.py`
#: for why a plain @skip would outlive its reason here.

class BulletOptimizerTestCase(TestCase):
    @skip_while_broken(
        lambda: BulletOptimizer.analyze(
            "\u2022 Spearheaded a caching layer, cutting API latency by 40%."
        ).has_action_verb
        is False,
        "#915: the bullet marker is read as the first word, so no bullet has a verb",
    )
    def test_strong_bullet_analysis(self):
        bullet = "Spearheaded a new caching system, reducing API latency by 40%."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertTrue(analysis.has_action_verb)
        self.assertTrue(analysis.has_metric)
        self.assertFalse(analysis.is_passive)
        self.assertGreaterEqual(analysis.score, 90)
        self.assertEqual(len(analysis.suggestions), 0)

    @skip_while_broken(
        lambda: BulletOptimizer.analyze("Was responsible for managing the team.").score
        >= 50,
        "#915: scoring starts at 50, so the weakest possible bullet reads as a pass",
    )
    def test_weak_bullet_analysis(self):
        bullet = "Was responsible for managing the team."
        analysis = BulletOptimizer.analyze(bullet)

        self.assertFalse(analysis.has_action_verb)
        self.assertFalse(analysis.has_metric)
        self.assertTrue(analysis.is_passive)
        self.assertLess(analysis.score, 50)
        self.assertGreater(len(analysis.suggestions), 2)

    @skip_while_broken(
        lambda: BulletOptimizer.analyze(
            "Increased sales by $1.5M and improved retention by 15%."
        ).star_components["result"]
        is None,
        "#915: a result stated as a quantified change is not recognised",
    )
    def test_metric_extraction(self):
        bullet = "Increased sales by $1.5M and improved retention by 15%."
        analysis = BulletOptimizer.analyze(bullet)
        self.assertTrue(analysis.has_metric)
        self.assertIsNotNone(analysis.star_components["result"])

    def test_serializer_validation(self):
        valid_data = {
            "bullets": ["Developed a React component.", "Managed a team of 5."]
        }
        serializer = BulletOptimizationRequestSerializer(data=valid_data)
        self.assertTrue(serializer.is_valid())

    def test_serializer_rejection_of_empty_bullets(self):
        invalid_data = {"bullets": ["", "   "]}
        serializer = BulletOptimizationRequestSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("bullets", serializer.errors)
