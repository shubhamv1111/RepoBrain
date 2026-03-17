"""
RepoBrain — Hotspots Analysis
Identify largest files and highest-churn files.
"""


def analyze_hotspots(files: list[dict]) -> dict:
    """
    Analyze file hotspots: largest files and estimated churn.

    Args:
        files: list of { path, content, language }

    Returns:
        { largestFiles: [...], highestChurn: [...] }
    """
    # Largest files by line count
    file_sizes = []
    for f in files:
        lines = f["content"].count("\n") + 1
        file_sizes.append({
            "filePath": f["path"],
            "value": lines,
        })

    file_sizes.sort(key=lambda x: -x["value"])
    largest_files = file_sizes[:10]

    # Estimated churn (using file complexity as proxy)
    # Real churn would need git log, this is an approximation based on
    # number of functions/classes and file length
    churn_scores = []
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
    highest_churn = churn_scores[:10]

    return {
        "largestFiles": largest_files,
        "highestChurn": highest_churn,
    }
