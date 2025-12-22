import os
from typing import List

from flask import Flask, render_template, request
from dotenv import load_dotenv

from app import (
    fetch_page,
    summarize_content,
    post_devto,
    generate_banner,
    build_banner_prompt,
    banner_caption_text,
    company_blurb,
    _ensure_front_matter_cover_image,
    _remove_leading_title,
    _ensure_banner_markdown,
)

load_dotenv()

app = Flask(__name__)
app.config["TEMPLATES_AUTO_RELOAD"] = True


def _truthy_env(name: str, default: str = "0") -> bool:
    return (os.getenv(name, default) or "").strip().lower() in {"1", "true", "yes", "on"}


def _parse_tags(raw: str) -> List[str]:
    return [t.strip() for t in raw.split(",") if t.strip()] if raw else []


@app.route("/", methods=["GET", "POST"])
def index():
    status_messages: List[str] = []
    errors: List[str] = []
    summary_md: str | None = None
    banner_url: str | None = None
    title: str | None = None
    source_url: str | None = None

    if request.method == "POST":
        action = request.form.get("action", "generate")

        if action == "generate":
            source_url = request.form.get("url", "").strip()
            if not source_url:
                errors.append("URL is required.")

            if not errors:
                try:
                    page_title, page_text, page_links, page_main_points = fetch_page(source_url)
                    title = page_title
                    caption_text = banner_caption_text()

                    try:
                        base_url = (os.getenv("BANNER_BASE_URL") or "").strip()
                        if not base_url:
                            upload_provider = (os.getenv("BANNER_UPLOAD_PROVIDER") or "").strip().lower()
                            if upload_provider != "github":
                                base_url = request.host_url.rstrip("/") + "/static/banners"
                        prompt = build_banner_prompt(title, page_text, [], caption=caption_text)
                        banner_url = generate_banner(prompt, base_url=base_url, caption=caption_text)
                    except Exception as exc:
                        banner_url = None
                        errors.append(f"Banner generation failed: {exc}")

                    summary_md = summarize_content(
                        title,
                        source_url,
                        page_text,
                        main_points=page_main_points,
                        banner_url=banner_url,
                        lock_title=True,
                    )

                    summary_md = _remove_leading_title(summary_md, title)

                    if banner_url:
                        summary_md = _ensure_front_matter_cover_image(summary_md, banner_url)

                    if banner_url and _truthy_env("INLINE_BANNER", default="0"):
                        summary_md = _ensure_banner_markdown(summary_md, banner_url)

                    blurb = company_blurb()
                    if blurb and blurb not in summary_md:
                        summary_md = summary_md.rstrip() + "\n\n---\n\n## About Infrasity\n\n" + blurb
                    status_messages.append("Draft ready. Review markdown and banner, then click Publish when ready.")
                except Exception as exc:  # pragma: no cover - interactive path
                    errors.append(f"Failed to summarize: {exc}")

        elif action == "publish":
            summary_md = (request.form.get("summary_md") or "").strip()
            title = (request.form.get("title") or "").strip() or None
            source_url = (request.form.get("url") or "").strip() or None
            banner_url = (request.form.get("banner_url") or "").strip() or None

            if not summary_md:
                errors.append("Nothing to publish. Generate a draft first.")

            devto_key = os.getenv("DEVTO_API_KEY")
            if not devto_key:
                errors.append("DEVTO_API_KEY missing.")

            if not errors:
                try:
                    devto_resp = post_devto(
                        devto_key,
                        title or "Untitled",
                        summary_md,
                        [],
                        publish=True,
                        canonical_url=source_url,
                    )
                    status_messages.append(f"Dev.to published: {devto_resp.get('url', devto_resp)}")
                except Exception as exc:  # pragma: no cover - interactive path
                    errors.append(f"Dev.to failed: {exc}")

    return render_template(
        "index.html",
        status_messages=status_messages,
        errors=errors,
        summary_md=summary_md,
        banner_url=banner_url,
        title=title,
        source_url=source_url,
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)
