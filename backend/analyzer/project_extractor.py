"""
Resume Project Portfolio Extractor and Impact Scorer.

Isolates project sections from the resume, evaluates them for impact metrics,
and assigns a Project Impact Score with specific improvement suggestions.
"""

import re
from typing import List, Dict, Any

PROJECT_HEADERS = [
    r"projects",
    r"personal projects",
    r"key projects",
    r"portfolio",
    r"academic projects",
    r"side projects",
]

METRIC_PATTERNS = [
    r"\d+%",
    r"\d+\s+users?",
    r"\d+\s+million",
    r"\d+x",
    r"\$\d+",
    r"\d+\s+team members?",
    r"reduced by \d+",
    r"increased by \d+",
]

ACTION_VERBS = [
    r"\barchitected\b",
    r"\bdeveloped\b",
    r"\bimplemented\b",
    r"\bdesigned\b",
    r"\boptimized\b",
    r"\bled\b",
    r"\bbuilt\b",
    r"\bcreated\b",
]

TECH_STACK_INDICATORS = [
    r"python",
    r"react",
    r"node\.js",
    r"aws",
    r"docker",
    r"kubernetes",
    r"tensorflow",
    r"sql",
    r"mongodb",
    r"typescript",
    r"java",
    r"c\+\+",
]


def extract_projects(resume_text: str) -> List[Dict[str, Any]]:
    """
    Extracts project entries from the resume text.
    """
    projects = []
    text_lower = resume_text.lower()

    # Find the start of the projects section
    header_match = None
    for header in PROJECT_HEADERS:
        match = re.search(rf"^\s*{header}\s*$", text_lower, re.MULTILINE)
        if match:
            header_match = match
            break

    if not header_match:
        return projects

    # Extract text from the projects section until the next major section
    section_text = resume_text[header_match.end() :]
    next_section = re.search(
        r"^\s*(?:experience|education|skills|certifications|awards)\s*$",
        section_text.lower(),
        re.MULTILINE,
    )

    if next_section:
        section_text = section_text[: next_section.start()]

    # Split into individual projects (heuristic: capitalized lines or bullet points)
    raw_projects = re.split(
        r"\n(?=[A-Z][a-zA-Z\s]+(?:Project|:|$)|\s*[-•*]\s+[A-Z])", section_text.strip()
    )

    for raw_proj in raw_projects:
        if len(raw_proj.strip()) < 20:
            continue

        projects.append(
            {
                "name": "Unnamed Project",  # Simplified extraction
                "description": raw_proj.strip(),
            }
        )

    return projects


def score_project_impact(project: Dict[str, Any]) -> Dict[str, Any]:
    """
    Scores a project based on impact metrics, action verbs, and tech stack.
    """
    desc = project["description"]
    desc_lower = desc.lower()
    score = 40  # Base score for having a project

    suggestions = []
    metrics_found = []
    tech_found = []

    # Check for metrics
    for pattern in METRIC_PATTERNS:
        if re.search(pattern, desc, re.IGNORECASE):
            score += 15
            metrics_found.append(
                pattern.replace("\\", "").replace("d+", "X").replace("s+", " ")
            )

    if not metrics_found:
        suggestions.append(
            "Add quantifiable metrics (e.g., 'Improved performance by 20%', 'Served 10k users')."
        )

    # Check for action verbs
    verb_count = sum(1 for pattern in ACTION_VERBS if re.search(pattern, desc_lower))
    score += min(verb_count * 10, 20)

    if verb_count == 0:
        suggestions.append(
            "Start descriptions with strong action verbs (e.g., 'Developed', 'Architected', 'Optimized')."
        )

    # Check for tech stack
    for tech in TECH_STACK_INDICATORS:
        if re.search(rf"\b{tech}\b", desc_lower):
            score += 5
            tech_found.append(tech.title())

    if not tech_found:
        suggestions.append(
            "Explicitly mention the technologies and tools used in the project."
        )

    return {
        "name": project["name"],
        "description": desc,
        "impact_score": min(100, score),
        "metrics_found": list(set(metrics_found)),
        "technologies": list(set(tech_found)),
        "suggestions": suggestions,
    }


def analyze_portfolio(resume_text: str) -> List[Dict[str, Any]]:
    """
    Main function to extract and score all projects in a resume.
    """
    raw_projects = extract_projects(resume_text)
    if not raw_projects:
        return []

    return [score_project_impact(proj) for proj in raw_projects]
