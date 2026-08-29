"""
Resume Tone and Sentiment Analyzer for Cultural Fit.

Evaluates linguistic patterns to assess confidence, collaboration style,
and overall cultural tone, providing suggestions for alignment.
"""

import re
from typing import List, Dict, Any

# Pronoun and phrasing indicators
FIRST_PERSON_SINGULAR = [r"\bi\b", r"\bmy\b", r"\bmine\b", r"\bme\b"]
FIRST_PERSON_PLURAL = [r"\bwe\b", r"\bour\b", r"\bours\b", r"\bus\b"]
PASSIVE_WEAK_PHRASES = [
    r"\bi think\b",
    r"\bi believe\b",
    r"\bi feel like\b",
    r"\bi tried to\b",
    r"\bi was responsible for\b",
    r"\bi helped with\b",
]
STRONG_CONFIDENT_PHRASES = [
    r"\bi led\b",
    r"\bi architected\b",
    r"\bi spearheaded\b",
    r"\bi delivered\b",
    r"\bi am confident\b",
    r"\bproven track record\b",
]
COLLABORATION_PHRASES = [
    r"\bcollaborated\b",
    r"\bpartnered\b",
    r"\bworked with\b",
    r"\bcross-functional\b",
    r"\bteam\b",
    r"\bmentored\b",
    r"\bcoordinated\b",
]


def analyze_pronoun_usage(text: str) -> Dict[str, Any]:
    """Analyzes the balance of pronoun usage."""
    text_lower = text.lower()

    singular_count = sum(
        len(re.findall(pattern, text_lower)) for pattern in FIRST_PERSON_SINGULAR
    )
    plural_count = sum(
        len(re.findall(pattern, text_lower)) for pattern in FIRST_PERSON_PLURAL
    )
    total = singular_count + plural_count

    if total == 0:
        return {
            "ratio": 0.5,
            "dominant": "neutral",
            "suggestion": "Consider adding more personal ownership ('I led') or team context ('We collaborated').",
        }

    ratio = singular_count / total
    dominant = "individual" if ratio > 0.6 else "team" if ratio < 0.4 else "balanced"

    suggestion = ""
    if ratio > 0.8:
        suggestion = "High individual focus. Consider highlighting team collaboration and cross-functional partnerships."
    elif ratio < 0.2:
        suggestion = "High team focus. Ensure your individual contributions and leadership are clearly articulated."

    return {"ratio": round(ratio, 2), "dominant": dominant, "suggestion": suggestion}


def analyze_sentiment_and_confidence(text: str) -> Dict[str, Any]:
    """Analyzes sentence structure for confidence and clarity."""
    text_lower = text.lower()

    weak_count = sum(
        len(re.findall(pattern, text_lower)) for pattern in PASSIVE_WEAK_PHRASES
    )
    strong_count = sum(
        len(re.findall(pattern, text_lower)) for pattern in STRONG_CONFIDENT_PHRASES
    )
    collab_count = sum(
        len(re.findall(pattern, text_lower)) for pattern in COLLABORATION_PHRASES
    )

    # Calculate scores (0-100)
    confidence_score = max(0, min(100, 50 + (strong_count * 10) - (weak_count * 15)))
    collaboration_score = max(0, min(100, 30 + (collab_count * 12)))
    clarity_score = max(0, min(100, 100 - (weak_count * 10)))

    suggestions = []
    if weak_count > 2:
        suggestions.append(
            "Replace weak phrases like 'I tried to' or 'I helped with' with strong action verbs like 'I delivered' or 'I executed'."
        )
    if strong_count == 0 and weak_count == 0:
        suggestions.append(
            "Add more confident, results-oriented language to highlight your achievements."
        )
    if collab_count < 2:
        suggestions.append(
            "Incorporate more collaboration keywords (e.g., 'partnered', 'cross-functional') to demonstrate teamwork."
        )

    return {
        "confidence_score": confidence_score,
        "collaboration_score": collaboration_score,
        "clarity_score": clarity_score,
        "suggestions": suggestions,
    }


def analyze_tone(resume_text: str) -> Dict[str, Any]:
    """Main function to analyze resume tone and cultural fit."""
    if not resume_text or not isinstance(resume_text, str):
        return {}

    pronoun_analysis = analyze_pronoun_usage(resume_text)
    sentiment_analysis = analyze_sentiment_and_confidence(resume_text)

    # Determine overall tone
    if (
        sentiment_analysis["confidence_score"] >= 80
        and sentiment_analysis["collaboration_score"] >= 60
    ):
        overall_tone = "Authoritative & Collaborative"
    elif sentiment_analysis["confidence_score"] >= 80:
        overall_tone = "Highly Confident / Individual Contributor"
    elif sentiment_analysis["collaboration_score"] >= 80:
        overall_tone = "Team-Oriented / Supportive"
    else:
        overall_tone = "Passive / Needs Refinement"

    all_suggestions = sentiment_analysis["suggestions"]
    if pronoun_analysis["suggestion"]:
        all_suggestions.append(pronoun_analysis["suggestion"])

    return {
        "confidence_score": sentiment_analysis["confidence_score"],
        "collaboration_score": sentiment_analysis["collaboration_score"],
        "clarity_score": sentiment_analysis["clarity_score"],
        "overall_tone": overall_tone,
        "pronoun_dominance": pronoun_analysis["dominant"],
        "suggestions": list(set(all_suggestions)),  # Remove duplicates
    }
