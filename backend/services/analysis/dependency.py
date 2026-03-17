"""
RepoBrain — Dependency Graph Generator
Extract import/require statements to build a file-level dependency graph.
"""

import re
from typing import Any, Optional


def _extract_python_imports(content: str, file_path: str) -> list[str]:
    """Extract import targets from Python files."""
    imports = []
    for line in content.split("\n"):
        line = line.strip()
        # from X import Y
        m = re.match(r"^from\s+([\w.]+)\s+import", line)
        if m:
            imports.append(m.group(1).replace(".", "/") + ".py")
            continue
        # import X
        m = re.match(r"^import\s+([\w.]+)", line)
        if m:
            imports.append(m.group(1).replace(".", "/") + ".py")
    return imports


def _extract_js_ts_imports(content: str, file_path: str) -> list[str]:
    """Extract import/require targets from JS/TS files."""
    imports = []
    patterns = [
        r"""import\s+.*?\s+from\s+['"](\..*?)['"]""",
        r"""import\s*\(['"](\..*?)['"]\)""",
        r"""require\s*\(['"](\..*?)['"]\)""",
    ]
    for pattern in patterns:
        for m in re.finditer(pattern, content):
            target = m.group(1)
            # Resolve relative path
            if not target.endswith((".js", ".ts", ".tsx", ".jsx")):
                target += ".ts"  # Default extension
            imports.append(target)
    return imports


def build_dependency_graph(files: list[dict[str, Any]]) -> dict[str, Any]:
    """
    Build a dependency graph from file contents.

    Args:
        files: list of { path, content, language }

    Returns:
        { nodes: [...], edges: [...] } for react-flow
    """
    file_paths = {f["path"] for f in files}
    edges: list[dict[str, str]] = []
    edge_id: int = 0

    for f in files:
        if f["language"] == "python":
            imports = _extract_python_imports(f["content"], f["path"])
        elif f["language"] in ("javascript", "typescript"):
            imports = _extract_js_ts_imports(f["content"], f["path"])
        else:
            continue

        for imp in imports:
            # Try to match with actual file paths
            for fp in file_paths:
                if fp.endswith(imp) or fp == imp:
                    edge_id += 1  # type: ignore[operator]
                    edge = {
                        "id": f"e{edge_id}",
                        "source": f["path"],  # type: ignore[index]
                        "target": fp,
                    }
                    edges.append(edge)
                    break

    # Build nodes from files that have connections
    connected_files = set()
    for e in edges:
        connected_files.add(e["source"])
        connected_files.add(e["target"])

    nodes: list[dict[str, Any]] = []
    for fp in connected_files:
        file_info = next((f for f in files if f["path"] == fp), None)
        summary = ""
        if file_info:
            lines = file_info["content"].split("\n")
            # Use first docstring/comment as summary
            for line in lines[:10]:
                stripped = line.strip()
                if stripped.startswith(("#", "//", "/*", '"""', "'''")) and len(stripped) > 3:
                    summary = stripped.lstrip("#/ *\"'").strip()
                    break

        name = fp.split("/")[-1]
        nodes.append({
            "id": fp,
            "data": {"label": name, "summary": summary or f"Module: {name}"},
            "position": {"x": 0, "y": 0},
        })

    return {"nodes": nodes[:50], "edges": edges[:100]}  # type: ignore[index]
