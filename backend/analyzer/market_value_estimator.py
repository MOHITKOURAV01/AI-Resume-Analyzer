"""
AI-Powered Market Value and Salary Estimator.

Analyzes extracted skills, experience level, and target role to provide
data-driven salary range estimates and tailored negotiation talking points.
"""

from typing import List, Dict, Any

# Baseline salary data (mocked for demonstration, in thousands)
BASELINE_SALARIES = {
    "software engineer": {"entry": 70, "mid": 110, "senior": 150, "lead": 180},
    "data scientist": {"entry": 80, "mid": 120, "senior": 160, "lead": 190},
    "product manager": {"entry": 75, "mid": 115, "senior": 155, "lead": 185},
    "devops engineer": {"entry": 85, "mid": 125, "senior": 165, "lead": 195},
    "default": {"entry": 60, "mid": 90, "senior": 120, "lead": 150},
}

HIGH_VALUE_SKILLS = [
    "machine learning",
    "artificial intelligence",
    "aws",
    "azure",
    "kubernetes",
    "docker",
    "tensorflow",
    "pytorch",
    "blockchain",
    "rust",
    "go",
    "golang",
    "system design",
    "architecture",
    "leadership",
    "management",
]

NEGOTIATION_TEMPLATES = {
    "high_experience": "Emphasize your {years} years of experience and proven track record of {achievements} to justify the upper end of the range.",
    "high_value_skills": "Highlight your expertise in high-demand areas like {skills}, which command a premium in the current market.",
    "leadership": "Focus on your leadership experience and ability to mentor teams, as these soft skills significantly increase market value.",
    "general": "Research the specific company's compensation bands and be prepared to discuss your total compensation expectations, including equity and benefits.",
}


def normalize_role(role: str) -> str:
    """Normalizes the target role to match baseline keys."""
    role_lower = role.lower().strip()
    for key in BASELINE_SALARIES.keys():
        if key in role_lower:
            return key
    return "default"


def normalize_level(level: str) -> str:
    """Normalizes the experience level."""
    level_lower = level.lower().strip()
    if any(word in level_lower for word in ["entry", "junior", "graduate", "0-2"]):
        return "entry"
    elif any(word in level_lower for word in ["mid", "intermediate", "3-5"]):
        return "mid"
    elif any(word in level_lower for word in ["senior", "sr", "5-8"]):
        return "senior"
    elif any(word in level_lower for word in ["lead", "principal", "staff", "8+"]):
        return "lead"
    return "mid"


def calculate_salary_range(role: str, level: str, skills: List[str]) -> Dict[str, int]:
    """Calculates the estimated salary range based on inputs."""
    norm_role = normalize_role(role)
    norm_level = normalize_level(level)

    base = BASELINE_SALARIES.get(norm_role, BASELINE_SALARIES["default"])[norm_level]

    # Adjust for high-value skills
    skill_match_count = sum(1 for skill in skills if skill.lower() in HIGH_VALUE_SKILLS)
    multiplier = 1.0 + (min(skill_match_count, 5) * 0.05)  # Max 25% boost

    min_salary = int(base * 0.85 * multiplier)
    max_salary = int(base * 1.15 * multiplier)
    median_salary = int((min_salary + max_salary) / 2)

    return {
        "min": min_salary * 1000,
        "max": max_salary * 1000,
        "median": median_salary * 1000,
        "currency": "USD",
    }


def generate_negotiation_points(level: str, skills: List[str]) -> List[str]:
    """Generates tailored negotiation talking points."""
    points = []

    norm_level = normalize_level(level)
    if norm_level in ["senior", "lead"]:
        points.append(
            NEGOTIATION_TEMPLATES["high_experience"].format(
                years="5+", achievements="delivering complex projects"
            )
        )
        points.append(NEGOTIATION_TEMPLATES["leadership"])

    matched_skills = [s for s in skills if s.lower() in HIGH_VALUE_SKILLS][:3]
    if matched_skills:
        points.append(
            NEGOTIATION_TEMPLATES["high_value_skills"].format(
                skills=", ".join(matched_skills).title()
            )
        )

    points.append(NEGOTIATION_TEMPLATES["general"])

    return points
