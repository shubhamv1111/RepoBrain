"""
RepoBrain — Static Issue Detection
Scans code for potential issues using regex and AST-based rules.
"""

import re
import ast
from typing import Any


REGEX_RULES = [
    {
        "id": "hardcoded_secret",
        "severity": "HIGH",
        "pattern": r"(password|secret|api_key|token|passwd)\s*=\s*['\"][^'\"]{6,}['\"]",
        "message": "Possible hardcoded secret",
    },
    {
        "id": "todo_comment",
        "severity": "LOW",
        "pattern": r"#\s*(TODO|FIXME|HACK|XXX)",
        "message": "TODO/FIXME comment",
    },
    {
        "id": "print_statement",
        "severity": "LOW",
        "pattern": r"^\s*print\(",
        "message": "print() in production code",
    },
    {
        "id": "console_log",
        "severity": "LOW",
        "pattern": r"console\.(log|warn|error)\(",
        "message": "console.log() in production code",
    },
    {
        "id": "eval_usage",
        "severity": "HIGH",
        "pattern": r"\beval\s*\(",
        "message": "eval() usage detected — security risk",
    },
]


def _check_large_functions_python(content: str, path: str) -> list[dict]:
    """Check for Python functions exceeding 80 lines."""
    issues = []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                end_line = node.end_lineno if node.end_lineno is not None else node.lineno
                func_lines = end_line - node.lineno + 1  # type: ignore[operator]
                if func_lines > 80:
                    issues.append({
                        "id": f"large_function_{node.lineno}",
                        "severity": "MEDIUM",
                        "message": f"Function '{node.name}' exceeds 80 lines ({func_lines} lines)",
                        "filePath": path,
                        "line": node.lineno,
                    })
    except SyntaxError:
        pass
    return issues


def _check_missing_error_handling_python(content: str, path: str) -> list[dict]:
    """Check for Python functions without try/except."""
    issues = []
    try:
        tree = ast.parse(content)
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                has_try = any(isinstance(n, ast.Try) for n in ast.walk(node))
                func_lines = (node.end_lineno or 0) - node.lineno + 1
                if not has_try and func_lines > 20:
                    issues.append({
                        "id": f"no_error_handling_{node.lineno}",
                        "severity": "MEDIUM",
                        "message": f"Function '{node.name}' has no error handling",
                        "filePath": path,
                        "line": node.lineno,
                    })
    except SyntaxError:
        pass
    return issues


def detect_issues(files: list[dict]) -> list[dict]:
    """
    Scan files for potential issues.

    Args:
        files: list of { path, content, language }

    Returns:
        list of { id, severity, message, filePath, line }
    """
    issues: list[dict[str, Any]] = []
    issue_counter: int = 0

    for f in files:
        content = f["content"]
        path = f["path"]
        lines = content.split("\n")

        # Regex-based checks
        for rule in REGEX_RULES:
            for line_num, line in enumerate(lines, 1):
                if re.search(rule["pattern"], line, re.IGNORECASE):
                    issue_counter += 1  # type: ignore[operator]
                    issues.append({
                        "id": f"{rule['id']}_{issue_counter}",
                        "severity": rule["severity"],
                        "message": rule["message"],
                        "filePath": path,
                        "line": line_num,
                    })

        # AST-based checks for Python
        if f["language"] == "python":
            issues.extend(_check_large_functions_python(content, path))
            issues.extend(_check_missing_error_handling_python(content, path))

    # Sort: HIGH first, then MEDIUM, then LOW
    severity_order = {"HIGH": 0, "MEDIUM": 1, "LOW": 2}
    issues.sort(key=lambda x: severity_order.get(x["severity"], 3))

    return issues[:50]  # type: ignore[index]
