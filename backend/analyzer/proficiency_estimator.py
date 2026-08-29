"""
Skill Proficiency Estimator and Validation Engine.

Analyzes the context surrounding extracted skills to estimate proficiency levels
(Beginner, Intermediate, Advanced, Expert) and flags unsupported claims.
"""

import re
from typing import List, Dict, Any, Tuple

PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"]

BEGINNER_INDICATORS = [
    r"\bfamiliar with\b",
    r"\bbasic knowledge of\b",
    r"\blearning\b",
    r"\bexposed to\b",
    r"\bassisted in\b",
    r"\bhelped with\b",
]

ADVANCED_INDICATORS = [
    r"\barchitected\b",
    r"\bspearheaded\b",
    r"\bled\b",
    r"\bdesigned\b",
    r"\boptimized\b",
    r"\bimplemented\b",
    r"\bdeveloped\b",
    r"\bmanaged\b",
]

EXPERT_INDICATORS = [
    r"\b\d+\+?\s+years?\s+of\s+experience\b",
    r"\bdecade\b",
    r"\bdeep expertise\b",
    r"\bthought leader\b",
    r"\bsubject matter expert\b",
    r"\b SME\b",
]

QUANTIFIABLE_METRICS = [
    r"\b\d+%\b",
    r"\b\d+\s+users?\b",
    r"\b\d+\s+million\b",
    r"\b\d+x\b",
    r"\b\d+\s+team members?\b",
]


def analyze_skill_context(resume_text: str, skill: str) -> Dict[str, Any]:
    """
    Analyzes the context around a specific skill to estimate proficiency.
    """
    text_lower = resume_text.lower()
    skill_lower = skill.lower()

    # Find sentences containing the skill
    sentences = re.split(r"(?<=[.!?])\s+", text_lower)
    relevant_sentences = [s for s in sentences if skill_lower in s]

    context_snippets = relevant_sentences[:3]  # Keep up to 3 snippets
    context_text = " ".join(context_snippets)

    score = 50  # Base score
    warnings = []
    level = "Intermediate"  # Default

    # Check for beginner indicators
    if any(re.search(indicator, context_text) for indicator in BEGINNER_INDICATORS):
        score -= 30
        level = "Beginner"

    # Check for advanced indicators
    if any(re.search(indicator, context_text) for indicator in ADVANCED_INDICATORS):
        score += 20
        level = "Advanced"

    # Check for expert indicators
    if any(re.search(indicator, context_text) for indicator in EXPERT_INDICATORS):
        score += 30
        level = "Expert"

    # Check for quantifiable metrics (boosts confidence)
    metrics_found = [m for m in QUANTIFIABLE_METRICS if re.search(m, context_text)]
    if metrics_found:
        score += 15

    # Flag unsupported expert claims
    if level == "Expert" and not metrics_found and len(context_text) < 100:
        warnings.append(
            "Claimed expertise lacks quantifiable metrics or detailed context."
        )

    # Flag beginner skills listed as core
    if level == "Beginner" and score < 40:
        warnings.append(
            "Skill is presented with weak action verbs; consider reframing or moving to 'Familiar With' section."
        )

    confidence = min(100, max(0, score))

    return {
        "skill": skill,
        "estimated_level": level,
        "confidence_score": confidence,
        "warnings": warnings,
        "context_snippets": context_snippets,
    }


def estimate_all_proficiencies(
    resume_text: str, skills: List[str]
) -> List[Dict[str, Any]]:
    """
    Estimates proficiency for a list of skills based on resume context.
    """
    if not skills or not resume_text:
        return []

    results = []
    for skill in skills:
        analysis = analyze_skill_context(resume_text, skill)
        results.append(analysis)

    # Sort by confidence score descending
    results.sort(key=lambda x: x["confidence_score"], reverse=True)
    return results
