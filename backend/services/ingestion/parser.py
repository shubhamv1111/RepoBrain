"""
RepoBrain — Code Parser
Uses tree-sitter to extract functions, classes, and code chunks with line ranges.
"""

import re
from typing import Optional

# Languages supported by tree-sitter for function/class extraction
TREE_SITTER_LANGUAGES = {
    "python", "javascript", "typescript", "java", "go",
    "rust", "ruby", "php", "c", "cpp", "csharp",
}


def _chunk_by_lines(content: str, chunk_size: int = 60) -> list[dict]:
    """Split content into line-based chunks for files without AST support."""
    lines = content.split("\n")
    chunks = []
    for i in range(0, len(lines), chunk_size):
        chunk_lines = lines[i : i + chunk_size]
        chunks.append({
            "content": "\n".join(chunk_lines),
            "startLine": i + 1,
            "endLine": min(i + chunk_size, len(lines)),
            "type": "chunk",
            "name": f"lines_{i + 1}_{min(i + chunk_size, len(lines))}",
        })
    return chunks


def _extract_python_items(content: str) -> list[dict]:
    """Extract functions and classes from Python source using regex-based parsing."""
    items = []
    lines = content.split("\n")

    # Track indentation-based blocks
    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.lstrip()

        # Match class or function definitions
        class_match = re.match(r"^class\s+(\w+)", stripped)
        func_match = re.match(r"^(async\s+)?def\s+(\w+)", stripped)

        if class_match or func_match:
            item_type = "class" if class_match else "function"
            name = class_match.group(1) if class_match else func_match.group(2)
            start_line = i + 1
            indent = len(line) - len(stripped)

            # Find the end of this block
            j = i + 1
            while j < len(lines):
                next_line = lines[j]
                if next_line.strip() == "":
                    j += 1
                    continue
                next_indent = len(next_line) - len(next_line.lstrip())
                if next_indent <= indent and next_line.strip():
                    break
                j += 1

            end_line = j
            block_content = "\n".join(lines[i:end_line])

            items.append({
                "content": block_content,
                "startLine": start_line,
                "endLine": end_line,
                "type": item_type,
                "name": name,
            })

            i = j
        else:
            i += 1

    return items


def _extract_js_ts_items(content: str) -> list[dict]:
    """Extract functions and classes from JS/TS source using regex."""
    items = []
    lines = content.split("\n")

    i = 0
    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        # Match various function/class patterns
        patterns = [
            (r"^(?:export\s+)?(?:default\s+)?class\s+(\w+)", "class"),
            (r"^(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+(\w+)", "function"),
            (r"^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(", "function"),
            (r"^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>", "function"),
        ]

        matched = False
        for pattern, item_type in patterns:
            m = re.match(pattern, stripped)
            if m:
                name = m.group(1)
                start_line = i + 1

                # Find matching brace end
                brace_count = 0
                j = i
                found_opening = False
                while j < len(lines):
                    for ch in lines[j]:
                        if ch == "{":
                            brace_count += 1
                            found_opening = True
                        elif ch == "}":
                            brace_count -= 1
                    if found_opening and brace_count <= 0:
                        break
                    j += 1

                end_line = min(j + 1, len(lines))
                block_content = "\n".join(lines[i:end_line])

                items.append({
                    "content": block_content,
                    "startLine": start_line,
                    "endLine": end_line,
                    "type": item_type,
                    "name": name,
                })

                i = end_line
                matched = True
                break

        if not matched:
            i += 1

    return items


def parse_file(
    path: str,
    content: str,
    language: str,
) -> list[dict]:
    """
    Parse a file and extract code chunks with metadata.

    Returns list of:
    { path, language, type, name, startLine, endLine, content }
    """
    chunks = []

    # Try language-specific extraction
    items = []
    if language == "python":
        items = _extract_python_items(content)
    elif language in ("javascript", "typescript"):
        items = _extract_js_ts_items(content)

    if items:
        for item in items:
            chunks.append({
                "path": path,
                "language": language,
                "type": item["type"],
                "name": item["name"],
                "startLine": item["startLine"],
                "endLine": item["endLine"],
                "content": item["content"],
            })
    else:
        # No AST extraction — chunk by lines
        line_chunks = _chunk_by_lines(content)
        for chunk in line_chunks:
            chunks.append({
                "path": path,
                "language": language,
                "type": chunk["type"],
                "name": chunk["name"],
                "startLine": chunk["startLine"],
                "endLine": chunk["endLine"],
                "content": chunk["content"],
            })

    # If file is small enough, also include as whole-file chunk
    lines = content.split("\n")
    if len(lines) <= 80 and not items:
        chunks = [{
            "path": path,
            "language": language,
            "type": "file",
            "name": path.split("/")[-1],
            "startLine": 1,
            "endLine": len(lines),
            "content": content,
        }]

    return chunks


def parse_files(
    files: list[dict],
    progress_callback=None,
) -> list[dict]:
    """
    Parse all collected files into chunks.

    Args:
        files: list of { path, content, extension, language }
        progress_callback: optional (message, percent) callback

    Returns:
        list of chunks with metadata
    """
    all_chunks = []
    total = len(files)

    for i, file_info in enumerate(files):
        chunks = parse_file(
            path=file_info["path"],
            content=file_info["content"],
            language=file_info["language"],
        )
        all_chunks.extend(chunks)

        if progress_callback and i % 20 == 0:
            pct = int((i / max(total, 1)) * 100)
            progress_callback(
                f"Parsed {i}/{total} files — {len(all_chunks)} chunks",
                min(pct, 95),
            )

    if progress_callback:
        progress_callback(
            f"Parsing complete — {len(all_chunks)} chunks from {total} files",
            100,
        )

    return all_chunks
