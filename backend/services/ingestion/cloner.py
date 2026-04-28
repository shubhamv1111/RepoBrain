"""
RepoBrain — Repository Cloner
Clones a GitHub repo into a temp directory, applies ignore filters,
and returns a list of indexable files with their content.
"""

import os
import re
import tempfile
import shutil
from pathlib import Path
from typing import Optional
from git import Repo

# ── Hardcoded ignore lists ───────────────────────────────────
IGNORE_DIRS = {
    "node_modules", "dist", "build", ".git", ".github",
    "__pycache__", ".next", "coverage", ".cache", "vendor",
    "venv", ".venv", "env", ".env", "out", ".turbo",
}

IGNORE_EXTENSIONS = {
    ".lock", ".min.js", ".min.css", ".map", ".jpg", ".jpeg",
    ".png", ".gif", ".svg", ".ico", ".woff", ".woff2",
    ".ttf", ".eot", ".pdf", ".zip", ".tar", ".gz",
}

MAX_FILE_SIZE_KB = 300

# ── Language detection from extension ────────────────────────
EXTENSION_LANGUAGE_MAP = {
    ".py": "python", ".js": "javascript", ".ts": "typescript",
    ".tsx": "typescript", ".jsx": "javascript", ".java": "java",
    ".go": "go", ".rs": "rust", ".rb": "ruby", ".php": "php",
    ".c": "c", ".cpp": "cpp", ".h": "c", ".hpp": "cpp",
    ".cs": "csharp", ".swift": "swift", ".kt": "kotlin",
    ".scala": "scala", ".r": "r", ".R": "r",
    ".html": "html", ".css": "css", ".scss": "scss",
    ".json": "json", ".yaml": "yaml", ".yml": "yaml",
    ".xml": "xml", ".md": "markdown", ".txt": "text",
    ".sh": "bash", ".bash": "bash", ".zsh": "bash",
    ".sql": "sql", ".graphql": "graphql",
    ".dockerfile": "dockerfile", ".toml": "toml",
    ".ini": "ini", ".cfg": "ini", ".env": "text",
}


def detect_language(extension: str) -> str:
    """Detect programming language from file extension."""
    return EXTENSION_LANGUAGE_MAP.get(extension.lower(), "text")


def _build_clone_url(repo_url: str, token: Optional[str] = None) -> str:
    """Build clone URL, injecting token for private repos."""
    url = repo_url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]

    # Extract owner/repo from various URL formats
    match = re.match(
        r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/]+)", url
    )
    if not match:
        raise ValueError(f"Invalid GitHub URL: {repo_url}")

    owner, name = match.group(1), match.group(2)

    if token:
        return f"https://{token}@github.com/{owner}/{name}.git"
    return f"https://github.com/{owner}/{name}.git"


def parse_repo_url(repo_url: str) -> tuple[str, str]:
    """Extract owner and repo name from a GitHub URL."""
    url = repo_url.rstrip("/")
    if url.endswith(".git"):
        url = url[:-4]

    match = re.match(
        r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/]+)", url
    )
    if not match:
        raise ValueError(f"Invalid GitHub URL: {repo_url}")

    return match.group(1), match.group(2)


def _should_skip(path: Path) -> bool:
    """Check if a file/directory should be skipped."""
    # Check directory names in path
    for part in path.parts:
        if part in IGNORE_DIRS:
            return True

    # Check extension
    if path.suffix.lower() in IGNORE_EXTENSIONS:
        return True

    # Check file size
    try:
        size_kb = path.stat().st_size / 1024
        if size_kb > MAX_FILE_SIZE_KB:
            return True
    except OSError:
        return True

    return False


def clone_and_collect(
    repo_url: str,
    token: Optional[str] = None,
    progress_callback=None,
) -> tuple[str, list[dict], list[dict]]:
    """
    Clone a GitHub repo and collect indexable files and recent commits.

    Returns:
        (clone_dir, files, commits) where:
          - files is a list of { path, content, extension, language }
          - commits is a list of { hash, message, author, date }
    """
    clone_url = _build_clone_url(repo_url, token)

    # Create temp directory
    clone_dir = tempfile.mkdtemp(prefix="repobrain_")

    try:
        if progress_callback:
            progress_callback("Cloning repository...", 10)

        # Shallow clone — depth=50 gives enough history for commit Q&A
        git_repo = Repo.clone_from(clone_url, clone_dir, depth=50)

        if progress_callback:
            progress_callback("Scanning files...", 30)

        # Walk and collect files
        files = []
        root = Path(clone_dir)

        all_paths = list(root.rglob("*"))
        total = len(all_paths)

        for i, file_path in enumerate(all_paths):
            if not file_path.is_file():
                continue

            # Get relative path
            rel_path = file_path.relative_to(root)

            if _should_skip(file_path):
                continue

            try:
                content = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            if not content.strip():
                continue

            ext = file_path.suffix
            files.append({
                "path": str(rel_path).replace("\\", "/"),
                "content": content,
                "extension": ext,
                "language": detect_language(ext),
            })

            # Progress update every 50 files
            if progress_callback and i % 50 == 0:
                pct = 30 + int((i / max(total, 1)) * 60)
                progress_callback(f"Scanned {len(files)} files...", min(pct, 90))

        if progress_callback:
            progress_callback(f"Found {len(files)} indexable files", 100)

        # Extract recent commit history
        commits: list[dict] = []
        try:
            for c in git_repo.iter_commits(max_count=50):
                commits.append({
                    "hash": c.hexsha[:8],
                    "message": c.message.strip()[:200],
                    "author": c.author.name,
                    "date": c.authored_datetime.isoformat(),
                })
        except Exception:
            pass

        return clone_dir, files, commits

    except Exception as e:
        # Cleanup on error
        shutil.rmtree(clone_dir, ignore_errors=True)
        raise e


def cleanup_clone(clone_dir: str) -> None:
    """Remove the cloned repository directory."""
    shutil.rmtree(clone_dir, ignore_errors=True)
