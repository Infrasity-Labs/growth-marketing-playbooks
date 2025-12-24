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
import traceback
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



def state_file_path():
    sdir = ROOT / "state"
    sdir.mkdir(parents=True, exist_ok=True)
    return sdir / "last_state.json"

def read_state_json():
    p = state_file_path()
    if not p.exists():
        return {"processed": [], "pending": [], "error": []}
    try:
        with p.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"processed": [], "pending": [], "error": []}

def write_state_json(state):
    p = state_file_path()
    with p.open("w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)





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

    idx_env = os.getenv("SHEET_ROW_INDEX")
    publish = os.getenv("RUN_PUBLISH", "0").lower() in ("1", "true", "yes", "on")

    state = read_state_json()
    # On first run, populate pending if empty
    if not state["pending"] and not state["processed"] and not state["error"]:
        state["pending"] = [item["url"] for item in items]
        write_state_json(state)

    def find_item_by_url(url):
        for item in items:
            if item.get("url") == url:
                return item
        return None

    # If SHEET_ROW_INDEX provided, use it (1-based)
    if idx_env:
        try:
            idx = max(0, int(idx_env) - 1)
        except Exception:
            print("Invalid SHEET_ROW_INDEX")
            raise SystemExit(2)
        if idx >= len(state["pending"]):
            print(f"Index {idx+1} out of range (pending items: {len(state['pending'])})")
            raise SystemExit(3)
        url = state["pending"][idx]
        item = find_item_by_url(url)
        if not item:
            print(f"Item for url {url} not found in data file.")
            raise SystemExit(4)
        cmd = build_cmd(item, publish)
        rc = subprocess.call(cmd)
        if rc == 0:
            state["processed"].append(url)
            state["pending"].remove(url)
        else:
            state["error"].append({"url": url, "error": f"Exit code {rc}"})
            state["pending"].remove(url)
        write_state_json(state)
        raise SystemExit(rc)

    # Try pending URLs in order until one is published successfully, or all are errors
    published = False
    for url in list(state["pending"]):
        item = find_item_by_url(url)
        if not item:
            print(f"Item for url {url} not found in data file.")
            state["error"].append({"url": url, "error": "Not found in data file"})
            state["pending"].remove(url)
            write_state_json(state)
            continue
        cmd = build_cmd(item, publish)
        try:
            rc = subprocess.call(cmd)
        except Exception as exc:
            rc = 99
            err_msg = f"Exception: {exc}\n{traceback.format_exc()}"
            print(f"Runner exception for {url}: {err_msg}")
            state["error"].append({"url": url, "error": err_msg})
            state["pending"].remove(url)
            write_state_json(state)
            continue
        if rc == 0:
            state["processed"].append(url)
            state["pending"].remove(url)
            write_state_json(state)
            print(f"Processed {url}")
            published = True
            break
        else:
            state["error"].append({"url": url, "error": f"Exit code {rc}"})
            state["pending"].remove(url)
            write_state_json(state)
            print(f"Error processing {url}, exit code {rc}")
    if not published:
        print("No blog was published (all pending URLs failed or errored).")
    raise SystemExit(0)


if __name__ == "__main__":
    main()
