import os
import random
import string
import sys
from pathlib import Path
from urllib.parse import urlparse

from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(REPO_ROOT))

from app import generate_banner  # noqa: E402


def _rand_id(n: int = 8) -> str:
    return "".join(random.choice(string.ascii_uppercase + string.digits) for _ in range(n))


def main() -> None:
    load_dotenv()

    base_url = os.getenv("BANNER_BASE_URL")
    if not base_url:
        raise SystemExit("BANNER_BASE_URL is missing. Set it to e.g. http://localhost:5000/static/banners")

    rid = _rand_id()
    # Make text very explicit so it's visible on the banner.
    prompt = (
        "Create a 1024x576 blog header image. "
        "Minimal modern style, high contrast. "
        "Add large, centered, readable text exactly: 'GEMINI TEST "
        + rid
        + "'. "
        "Avoid small text. Avoid watermarks."
    )

    print("Using base_url:", base_url)
    print("Using model:", os.getenv("GEMINI_IMAGE_MODEL") or "gemini-2.0-flash-exp-image-generation")
    print("Prompt:", prompt)

    url = generate_banner(prompt, base_url=base_url)
    print("Generated banner URL:", url)

    filename = os.path.basename(urlparse(url).path)
    local_path = os.path.join(os.path.dirname(__file__), "..", "static", "banners", filename)
    local_path = os.path.abspath(local_path)

    if not os.path.exists(local_path):
        raise SystemExit(f"Expected file not found: {local_path}")

    size = os.path.getsize(local_path)
    if size <= 0:
        raise SystemExit(f"File is empty: {local_path}")

    print("Saved local file:", local_path)
    print("File size (bytes):", size)


if __name__ == "__main__":
    main()
