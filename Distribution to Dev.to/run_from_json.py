#!/usr/bin/env python3
"""Simple runner: read URLs from a local JSON file and invoke app.py for one item.

Behavior:
- Uses DATA_FILE env (default: urls.json) under the same folder.
- If SHEET_ROW_INDEX env is set (1-based), processes that single item.
- Otherwise uses state/last_index.txt (repo-root) to pick next item and advances it only on success.
"""
import json
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).parent
# Load .env if present so vars written by the workflow are available to this process
try:
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=ROOT / ".env")
except Exception:
    pass

DATA_FILE = Path(os.getenv("DATA_FILE", "urls.json"))
if not DATA_FILE.is_absolute():
    DATA_FILE = ROOT / DATA_FILE


def load_items(path: Path):
    if not path.exists():
        print(f"Data file not found: {path}")
        return []
    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, dict):
        # allow {'items': [...]}
        data = data.get("items", [])
    return list(data)


def read_state():
    # store state in Distribution to Dev.to/state/last_index.txt
    sdir = ROOT / "state"
    sdir.mkdir(parents=True, exist_ok=True)
    p = sdir / "last_index.txt"
    if not p.exists():
        return 0
    try:
        v = int(p.read_text(encoding="utf-8").strip())
        return v
    except Exception:
        return 0


def write_state(val: int):
    sdir = ROOT / "state"
    sdir.mkdir(parents=True, exist_ok=True)
    p = sdir / "last_index.txt"
    p.write_text(str(val), encoding="utf-8")


def build_cmd(item, publish: bool):
    cmd = [sys.executable, str(ROOT / "app.py")]
    url = item.get("url") or item.get("link") or item.get("path")
    if not url:
        raise SystemExit("item missing url")
    cmd += ["--url", url]
    if item.get("tags"):
        cmd += ["--tags", ",".join(item.get("tags") if isinstance(item.get("tags"), list) else [item.get("tags")])]
    if item.get("title"):
        cmd += ["--title", item.get("title")]
    if item.get("canonical"):
        cmd += ["--canonical", item.get("canonical")]
    if item.get("banner"):
        cmd += ["--banner", item.get("banner")]
    # Always request auto-banner unless explicit banner is set
    if not item.get("banner"):
        cmd += ["--auto-banner"]
    if publish:
        cmd += ["--publish"]
    return cmd


def main():
    # Diagnostic: print effective publish flag and presence of keys
    print(f"[runner-debug] RUN_PUBLISH={os.getenv('RUN_PUBLISH')} OPENAI_API_KEY_set={'yes' if os.getenv('OPENAI_API_KEY') else 'no'} DEVTO_API_KEY_set={'yes' if os.getenv('DEVTO_API_KEY') else 'no'} BANNER_UPLOAD_PROVIDER={os.getenv('BANNER_UPLOAD_PROVIDER')}")

    items = load_items(DATA_FILE)
    if not items:
        print("No items found in data file.")
        raise SystemExit(1)

    # If SHEET_ROW_INDEX provided, use it (1-based)
    idx_env = os.getenv("SHEET_ROW_INDEX")
    publish = os.getenv("RUN_PUBLISH", "0").lower() in ("1", "true", "yes", "on")

    if idx_env:
        try:
            idx = max(0, int(idx_env) - 1)
        except Exception:
            print("Invalid SHEET_ROW_INDEX")
            raise SystemExit(2)
        if idx >= len(items):
            print(f"Index {idx+1} out of range (items: {len(items)})")
            raise SystemExit(3)
        item = items[idx]
        cmd = build_cmd(item, publish)
        rc = subprocess.call(cmd)
        raise SystemExit(rc)

    # Otherwise use state file to pick next
    last = read_state()
    next_idx = last
    if next_idx >= len(items):
        print("Reached end of items; resetting to 0")
        next_idx = 0

    item = items[next_idx]
    cmd = build_cmd(item, publish)
    rc = subprocess.call(cmd)
    if rc == 0:
        # advance and write state
        new = next_idx + 1
        write_state(new)
        print(f"Processed index {next_idx+1}; advanced to {new}")
    else:
        print(f"Runner failed with exit code {rc}; not advancing state")
    raise SystemExit(rc)


if __name__ == "__main__":
    main()
