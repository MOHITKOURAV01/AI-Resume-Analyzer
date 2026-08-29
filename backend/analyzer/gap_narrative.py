"""
AI-Driven Resume Gap Explanation and Narrative Builder.

Identifies employment gaps from resume timeline and generates professional,
positive narrative explanations for various gap reasons.
"""

import re
from datetime import datetime
from typing import List, Dict, Any, Optional

MONTH_MAP = {
    "jan": 1,
    "feb": 2,
    "mar": 3,
    "apr": 4,
    "may": 5,
    "jun": 6,
    "jul": 7,
    "aug": 8,
    "sep": 9,
    "oct": 10,
    "nov": 11,
    "dec": 12,
    "january": 1,
    "february": 2,
    "march": 3,
    "april": 4,
    "june": 6,
    "july": 7,
    "august": 8,
    "september": 9,
    "october": 10,
    "november": 11,
    "december": 12,
}

NARRATIVE_TEMPLATES = {
    "upskilling": [
        "During this period, I dedicated my time to intensive upskilling, completing certifications in {skills} to stay current with industry advancements.",
        "I took a strategic career pause to focus on professional development, acquiring new competencies in {skills} that directly enhance my value in {target_role} roles.",
    ],
    "caregiving": [
        "I stepped away from the workforce to provide essential caregiving for a family member. This experience honed my crisis management, empathy, and organizational skills, and I am now fully prepared to re-engage in my career.",
        "This timeframe was dedicated to family caregiving responsibilities. I maintained my industry knowledge through {activities} and am now eager to bring my refined soft skills and renewed focus to a new role.",
    ],
    "freelance": [
        "I operated as an independent consultant during this time, delivering {deliverables} for various clients. This allowed me to broaden my expertise in {skills} and manage end-to-end project lifecycles.",
        "This period reflects my work as a freelance professional, where I successfully {achievements}, demonstrating adaptability and self-directed project management.",
    ],
    "health": [
        "I took a necessary medical leave to address a health matter, which is now fully resolved. I used part of this time to {activities}, and I am excited to return to the workforce with renewed energy.",
        "This gap was due to a temporary health situation that has been completely resolved. I remained engaged with the industry through {activities} and am ready to contribute immediately.",
    ],
    "job_market": [
        "I have been strategically evaluating opportunities to ensure my next role aligns with my long-term career goals in {target_role}, while actively maintaining my skills through {activities}.",
        "Due to broader market conditions, I have been selectively pursuing roles that match my expertise in {skills}, using this time to refine my portfolio and complete {certifications}.",
    ],
}


def parse_date(date_str: str) -> Optional[datetime]:
    """Parses various date string formats into a datetime object."""
    date_str = date_str.strip().lower()
    if date_str in ["present", "now", "current"]:
        return datetime.now()

    parts = date_str.split()
    if len(parts) >= 2:
        month_str, year_str = parts[0], parts[1]
        month = MONTH_MAP.get(month_str[:3])
        if month and year_str.isdigit():
            return datetime(year=int(year_str), month=month, day=1)
    elif len(parts) == 1 and parts[0].isdigit():
        return datetime(year=int(parts[0]), month=1, day=1)

    return None


def detect_gaps(timeline_data: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    """Detects employment gaps greater than 3 months between roles."""
    gaps = []
    if not timeline_data or len(timeline_data) < 2:
        return gaps

    # Sort by start date descending (most recent first)
    sorted_timeline = sorted(
        timeline_data,
        key=lambda x: parse_date(x.get("start_date", "2000-01")) or datetime.min,
        reverse=True,
    )

    for i in range(len(sorted_timeline) - 1):
        current_role = sorted_timeline[i]
        prev_role = sorted_timeline[i + 1]

        current_end = parse_date(current_role.get("end_date", "present"))
        prev_start = parse_date(prev_role.get("start_date", "2000-01"))

        if current_end and prev_start:
            # Calculate difference in months
            diff_months = (current_end.year - prev_start.year) * 12 + (
                current_end.month - prev_start.month
            )

            if diff_months > 3:
                gaps.append(
                    {
                        "role_before": prev_role.get("role", "Previous Role"),
                        "role_after": current_role.get("role", "Current Role"),
                        "start_date": current_end.strftime("%b %Y"),
                        "end_date": prev_start.strftime("%b %Y"),
                        "duration_months": diff_months,
                    }
                )

    return gaps


def generate_narratives(
    gaps: List[Dict[str, Any]], context: Dict[str, str]
) -> List[Dict[str, Any]]:
    """Generates narrative options for each detected gap."""
    results = []
    skills = context.get("skills", "new technologies")
    target_role = context.get("target_role", "this field")
    activities = context.get("activities", "independent study and industry reading")

    for gap in gaps:
        narratives = []
        for category, templates in NARRATIVE_TEMPLATES.items():
            for template in templates[:2]:  # Take top 2 templates per category
                narrative = template.format(
                    skills=skills,
                    target_role=target_role,
                    activities=activities,
                    deliverables="scalable software solutions",
                    achievements="streamlined client workflows",
                )
                narratives.append(
                    {"category": category.capitalize(), "text": narrative}
                )

        results.append({**gap, "narratives": narratives})

    return results
