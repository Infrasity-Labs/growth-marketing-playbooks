import os
from dotenv import load_dotenv
from google import genai


def main() -> None:
    load_dotenv()
    key = (os.getenv("GOOGLE_API_KEY") or "").strip()
    if not key:
        raise SystemExit("GOOGLE_API_KEY missing")

    client = genai.Client(api_key=key)

    total = 0
    shown = 0
    matched = 0
    for m in client.models.list():
        total += 1
        name = getattr(m, "name", "")
        methods = getattr(m, "supported_generation_methods", None) or []
        if shown < 20:
            print("model", name, "methods", methods)
            shown += 1
        if any(x in methods for x in ("generateImages", "generateContent")):
            matched += 1
        if total >= 50:
            break

    print("total_seen", total)
    print("matched", matched)


if __name__ == "__main__":
    main()
