import os
from dotenv import load_dotenv
from google import genai
from google.genai import types


def main() -> None:
    load_dotenv()
    key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if not key:
        raise SystemExit("GOOGLE_API_KEY missing")

    client = genai.Client(api_key=key)
    model = os.getenv("GEMINI_IMAGE_MODEL") or "gemini-2.0-flash-exp-image-generation"

    resp = client.models.generate_content(
        model=model,
        contents="Generate a 1024x576 banner with large centered text: 'TEST BANNER'.",
        config=types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"]),
    )

    print("got response type", type(resp))
    cands = getattr(resp, "candidates", None) or []
    print("candidate_count", len(cands))
    if cands:
        parts = getattr(getattr(cands[0], "content", None), "parts", None) or []
        print("first_candidate_part_types", [type(p).__name__ for p in parts])
        has_inline = any(getattr(getattr(p, "inline_data", None), "data", None) for p in parts)
        print("has_inline_image", has_inline)


if __name__ == "__main__":
    main()
