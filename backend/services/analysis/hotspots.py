"""
RepoBrain — Hotspots Analysis
Identify largest files and highest-churn files.
"""

from typing import Any


def analyze_hotspots(files: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Analyze file hotspots: largest files and estimated churn.

    Args:
        files: list of { path, content, language }

    Returns:
        { largestFiles: [...], highestChurn: [...] }
    """
    # Largest files by line count
    file_sizes: list[dict[str, Any]] = []
    for f in files:
        lines = f["content"].count("\n") + 1
        file_sizes.append({
            "filePath": f["path"],
            "value": lines,
        })

    file_sizes.sort(key=lambda x: -x["value"])
    largest_files = file_sizes[:10]  # type: ignore[index]

    # Estimated churn (using file complexity as proxy)
    # Real churn would need git log, this is an approximation based on
    # number of functions/classes and file length
    churn_scores: list[dict[str, Any]] = []
    for f in files:
        content = f["content"]
        lines = content.count("\n") + 1
        # Count function/class definitions as complexity indicator
        import re
        defs = len(re.findall(r"(def |class |function |const \w+ = )", content))
        score = lines + (defs * 10)

        churn_scores.append({
            "filePath": f["path"],
            "value": score,
        })

    churn_scores.sort(key=lambda x: -x["value"])
    highest_churn = churn_scores[:10]  # type: ignore[index]

    return {
        "largestFiles": largest_files,
        "highestChurn": highest_churn,
    }
