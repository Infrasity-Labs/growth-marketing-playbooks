import argparse
import os
import pathlib
import time
import base64
import json
import re
from io import BytesIO
from urllib.parse import quote, urljoin
from typing import List, Optional, Tuple

import requests
from PIL import Image, ImageDraw, ImageFont
from agents import Agent, ModelSettings, Runner, set_default_openai_key
from bs4 import BeautifulSoup
from dotenv import load_dotenv

STATIC_BANNERS_DIR = pathlib.Path(__file__).parent / "static" / "banners"

DEFAULT_COMPANY_BLURB = (
    "Infrasity helps early-stage B2B SaaS and DevTools startups with developer marketing through hands-on technical content. "
    "We work on technical blogs, product documentation, and use-case driven guides built from real product workflows. "
    "The focus is on reducing evaluation and onboarding friction for engineers. Everything we create is grounded in how developers actually discover and assess tools."
)


def company_blurb() -> str:
    """Return the company blurb used for About sections."""
    return (os.getenv("DEVTO_COMPANY_BLURB") or DEFAULT_COMPANY_BLURB or "").strip()


def banner_caption_text() -> str:
    """Return caption text for banner rendering (falls back to the blurb)."""
    return (os.getenv("BANNER_CAPTION") or os.getenv("DEVTO_COMPANY_BLURB") or DEFAULT_COMPANY_BLURB or "").strip()


def _truthy_env(name: str, default: str = "0") -> bool:
    return (os.getenv(name, default) or "").strip().lower() in {"1", "true", "yes", "on"}


def _ensure_front_matter_cover_image(body_md: str, cover_image_url: str) -> str:
    """Ensure DEV front matter includes cover_image, without clobbering other content."""
    md = body_md or ""
    url = (cover_image_url or "").strip()
    if not url:
        return md

    stripped = md.lstrip()
    if stripped.startswith("---\n"):
        # Try to update existing YAML front matter.
        start_idx = md.find("---\n")
        end_idx = md.find("\n---", start_idx + 4)
        if end_idx != -1:
            end_idx = md.find("\n", end_idx + 1)
        if start_idx != -1 and end_idx != -1:
            fm = md[start_idx + 4 : end_idx].splitlines()
            new_fm: list[str] = []
            replaced = False
            for line in fm:
                if line.strip().startswith("cover_image:"):
                    new_fm.append(f"cover_image: {url}")
                    replaced = True
                else:
                    new_fm.append(line)
            if not replaced:
                new_fm.append(f"cover_image: {url}")
            rebuilt = "---\n" + "\n".join(new_fm).rstrip() + "\n---\n\n" + md[end_idx + 1 :].lstrip("\n")
            return rebuilt

    # No front matter; prepend minimal one.
    return f"---\ncover_image: {url}\n---\n\n" + md.lstrip("\n")


def _ensure_banner_markdown(body_md: str, banner_url: str) -> str:
    """Ensure the markdown includes a visible banner image without breaking front matter."""
    md = body_md or ""
    url = (banner_url or "").strip()
    if not url:
        return md

    # If already present anywhere near the top, don't add again.
    head = md.lstrip()[:400]
    if head.startswith("![Banner]") or "![Banner](" in head:
        return md

    stripped = md.lstrip()
    if stripped.startswith("---\n"):
        start_idx = md.find("---\n")
        end_marker = md.find("\n---", start_idx + 4)
        if end_marker != -1:
            end_line = md.find("\n", end_marker + 1)
            if end_line != -1:
                before = md[: end_line + 1]
                after = md[end_line + 1 :].lstrip("\n")
                return before + f"\n![Banner]({url})\n\n" + after

    return f"![Banner]({url})\n\n" + md.lstrip("\n")


def _github_upload_banner(file_path: pathlib.Path) -> str:
    """Upload a local banner to GitHub via the Contents API and return a public download URL.

    Requires:
    - GITHUB_TOKEN
    - GITHUB_REPO ("owner/repo")
    Optional:
    - GITHUB_BRANCH (default: main)
    - GITHUB_PATH_PREFIX (default: banners)

    Note: The repo must be public for Dev.to to fetch the returned URL.
    """
    token = (os.getenv("GITHUB_TOKEN") or "").strip()
    repo = (os.getenv("GITHUB_REPO") or "").strip()
    branch = (os.getenv("GITHUB_BRANCH") or "main").strip() or "main"
    path_prefix_raw = (os.getenv("GITHUB_PATH_PREFIX") or "banners").strip()

    if not token:
        raise RuntimeError("GITHUB_TOKEN missing (needed to upload banner when BANNER_BASE_URL is not set)")
    if not repo or "/" not in repo:
        raise RuntimeError('GITHUB_REPO missing/invalid (expected "owner/repo")')

    file_bytes = file_path.read_bytes()
    b64 = base64.b64encode(file_bytes).decode("utf-8")

    def _sanitize_component(value: str) -> str:
        v = "".join(ch for ch in (value or "").strip() if ch.isprintable())
        v = v.replace(" ", "-")
        v = re.sub(r"[^A-Za-z0-9._-]+", "-", v)
        v = re.sub(r"-+", "-", v).strip("-")
        if v in ("", ".", ".."):
            raise ValueError("empty or invalid component")
        return v

    safe_filename = _sanitize_component(file_path.name)
    # Ensure extension stays .png for our banners.
    if not safe_filename.lower().endswith(".png"):
        safe_filename = safe_filename + ".png"

    # Sanitize path prefix into slash-separated components.
    path_prefix = ""
    if path_prefix_raw:
        prefix = path_prefix_raw.strip().strip("/")
        parts = [p for p in prefix.split("/") if p and p not in (".", "..")]
        safe_parts = []
        for part in parts:
            safe_parts.append(_sanitize_component(part))
        path_prefix = "/".join(safe_parts)
    def _payload(include_branch: bool) -> dict:
        p = {
            "message": f"Add banner {safe_filename}",
            "content": b64,
        }
        if include_branch and branch:
            p["branch"] = branch
        return p

    def _attempt(api_url: str, auth_scheme: str, include_branch: bool) -> requests.Response:
        headers = {
            "Authorization": f"{auth_scheme} {token}",
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        return requests.put(api_url, json=_payload(include_branch), headers=headers, timeout=30)

    def _try_upload(remote_path: str) -> Optional[str]:
        api_url = f"https://api.github.com/repos/{repo}/contents/{quote(remote_path, safe='/')}"

        last_resp: Optional[requests.Response] = None
        for include_branch in (True, False):
            for scheme in ("Bearer", "token"):
                resp = _attempt(api_url, scheme, include_branch=include_branch)
                last_resp = resp
                if resp.status_code in (200, 201):
                    data = resp.json()
                    download_url = ((data.get("content") or {}).get("download_url") or "").strip()
                    if not download_url:
                        raise RuntimeError("GitHub upload succeeded but download_url was missing")
                    return download_url

                # If branch name is invalid/nonexistent, retry without specifying branch.
                if include_branch and resp.status_code == 422 and "branch" in (resp.text or "").lower():
                    continue

                # Malformed path: caller will try a different remote_path.
                if resp.status_code == 422 and "malformed path component" in (resp.text or "").lower():
                    return None

                if resp.status_code == 403 and "resource not accessible by personal access token" in (resp.text or "").lower():
                    raise RuntimeError(
                        "GitHub upload failed (403): token cannot access this repo/path. "
                        "Use a fine-grained PAT with access to this repository and Contents: Read and write. "
                        "If this repo is under an org with SSO/SAML, authorize the token for that org. "
                        f"Response: {resp.text}"
                    )

        if last_resp is None:
            return None
        raise RuntimeError(f"GitHub upload failed ({last_resp.status_code}): {last_resp.text}")

    # Try user-selected prefix first, then fall back to a safe default and finally repo root.
    candidate_prefixes: list[str] = []
    if path_prefix:
        candidate_prefixes.append(path_prefix)
    if "banners" not in candidate_prefixes:
        candidate_prefixes.append("banners")
    candidate_prefixes.append("")

    last_error: Optional[str] = None
    for prefix in candidate_prefixes:
        remote_path = f"{prefix}/{safe_filename}" if prefix else safe_filename
        try:
            url = _try_upload(remote_path)
            if url:
                return url
        except Exception as exc:
            last_error = str(exc)

    raise RuntimeError(
        "GitHub upload failed: GitHub rejected the upload path as malformed. "
        "Set GITHUB_PATH_PREFIX to a simple folder name like 'banners' (no spaces/special chars), "
        "or leave it empty to upload to repo root. "
        + (f" Last error: {last_error}" if last_error else "")
    )


def _pick_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/System/Library/Fonts/SFNS.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Verdana.ttf",
    ]
    for path in candidates:
        try:
            if os.path.exists(path):
                return ImageFont.truetype(path, size=size)
        except Exception:
            continue
    return ImageFont.load_default()


def _generate_local_banner_file(text: str, caption: Optional[str] = None) -> pathlib.Path:
    """Generate a simple, readable banner locally (no external API)."""
    width, height = 1000, 420
    img = Image.new("RGB", (width, height), (15, 23, 42))
    draw = ImageDraw.Draw(img)

    # Subtle gradient
    for y in range(height):
        t = y / (height - 1)
        r = int(18 + 32 * t)
        g = int(24 + 22 * t)
        b = int(46 + 44 * t)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Accent shapes
    draw.ellipse([(width - 360, -120), (width + 40, 280)], outline=(96, 165, 250), width=6)
    draw.rounded_rectangle([(60, height - 200), (520, height - 80)], radius=24, outline=(167, 243, 208), width=6)

    # Title text
    title = (text or "").strip()
    if not title:
        title = "New Blog Post"
    title = title.replace("\n", " ")
    title = " ".join(title.split())
    if len(title) > 72:
        title = title[:69].rstrip() + "…"

    def _wrap_lines(text_value: str, font_value: ImageFont.ImageFont, max_w: int, max_lines: int) -> list[str]:
        words = (text_value or "").split()
        if not words:
            return [""]

        lines: list[str] = []
        current: list[str] = []
        for word in words:
            candidate = (" ".join(current + [word])).strip()
            bbox = draw.textbbox((0, 0), candidate, font=font_value)
            candidate_w = bbox[2] - bbox[0]
            if candidate_w <= max_w or not current:
                current.append(word)
                continue
            lines.append(" ".join(current))
            current = [word]
            if len(lines) >= max_lines:
                break
        if len(lines) < max_lines and current:
            lines.append(" ".join(current))

        # If text overflowed max_lines, ellipsize the last line.
        if len(lines) > max_lines:
            lines = lines[:max_lines]
        if len(lines) == max_lines and (len(words) > sum(len(l.split()) for l in lines)):
            last = lines[-1]
            while last:
                candidate = last.rstrip(" .") + "…"
                bbox = draw.textbbox((0, 0), candidate, font=font_value)
                if (bbox[2] - bbox[0]) <= max_w:
                    lines[-1] = candidate
                    break
                last = " ".join(last.split()[:-1])
            if not lines[-1].endswith("…"):
                lines[-1] = (lines[-1][: max(1, len(lines[-1]) - 2)]).rstrip() + "…"
        return lines

    def _fit_text(text_value: str) -> tuple[list[str], ImageFont.ImageFont]:
        max_w = int(width * 0.86)
        max_h = int(height * 0.42)
        for size in range(76, 34, -2):
            font_value = _pick_font(size)
            lines = _wrap_lines(text_value, font_value, max_w=max_w, max_lines=3)
            bbox = draw.multiline_textbbox((0, 0), "\n".join(lines), font=font_value, spacing=10, align="center")
            tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
            if tw <= max_w and th <= max_h:
                return lines, font_value
        font_value = _pick_font(36)
        return _wrap_lines(text_value, font_value, max_w=max_w, max_lines=3), font_value

    lines, font = _fit_text(title)
    text_block = "\n".join(lines)
    bbox = draw.multiline_textbbox((0, 0), text_block, font=font, spacing=10, align="center")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (width - tw) // 2
    y = (height - th) // 2

    # Outline for readability
    for ox, oy in [(-2, -2), (2, -2), (-2, 2), (2, 2), (0, -2), (0, 2), (-2, 0), (2, 0)]:
        draw.multiline_text((x + ox, y + oy), text_block, font=font, fill=(0, 0, 0), spacing=10, align="center")
    draw.multiline_text((x, y), text_block, font=font, fill=(255, 255, 255), spacing=10, align="center")

    if caption:
        cap = " ".join(caption.split())
        if len(cap) > 160:
            cap = cap[:157].rstrip() + "..."
        cap_font = _pick_font(24)
        cap_bbox = draw.textbbox((0, 0), cap, font=cap_font)
        cap_w, cap_h = cap_bbox[2] - cap_bbox[0], cap_bbox[3] - cap_bbox[1]
        pad_x, pad_y = 14, 10
        box_x, box_y = 36, height - cap_h - pad_y * 2 - 28
        draw.rectangle(
            [(box_x - pad_x, box_y - pad_y), (box_x + cap_w + pad_x, box_y + cap_h + pad_y)],
            fill=(12, 18, 32),
            outline=(255, 255, 255),
            width=2,
        )
        draw.text((box_x, box_y), cap, font=cap_font, fill=(230, 245, 255))

    STATIC_BANNERS_DIR.mkdir(parents=True, exist_ok=True)
    ts = int(time.time())
    filename = f"banner-{ts}.png"
    out_path = STATIC_BANNERS_DIR / filename
    img.save(out_path, format="PNG")
    return out_path


def _parse_size(value: str) -> tuple[int, int]:
    parts = value.lower().split("x")
    if len(parts) != 2:
        raise ValueError("size must be WxH")
    return int(parts[0]), int(parts[1])


def _center_fit(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    tw, th = target_w, target_h
    iw, ih = img.size
    target_ratio = tw / th
    image_ratio = iw / ih
    if image_ratio > target_ratio:
        # too wide -> crop width
        new_w = int(ih * target_ratio)
        left = (iw - new_w) // 2
        box = (left, 0, left + new_w, ih)
    else:
        # too tall -> crop height
        new_h = int(iw / target_ratio)
        top = (ih - new_h) // 2
        box = (0, top, iw, top + new_h)
    cropped = img.crop(box)
    return cropped.resize((tw, th), Image.LANCZOS)


def _generate_openai_banner_file(prompt: str) -> pathlib.Path:
    """Generate an image via OpenAI Images API and save to static/banners.

    Env:
      - OPENAI_API_KEY (required)
      - OPENAI_IMAGE_MODEL (default: dall-e-3)
      - OPENAI_IMAGE_SIZE (request to OpenAI, default: 1792x1024; must be one of 1024x1024, 1792x1024, 1024x1792)
      - BANNER_OUTPUT_SIZE (optional final size WxH, e.g., 1000x420; will center-crop/fit from the requested image)
    """
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY missing for OpenAI image generation.")

    model = (os.getenv("OPENAI_IMAGE_MODEL") or "dall-e-3").strip()
    requested_size = (os.getenv("OPENAI_IMAGE_SIZE") or "1024x1024").strip()
    supported_sizes = {"1024x1024", "1024x1792", "1792x1024"}
    if requested_size not in supported_sizes:
        requested_size = "1024x1024"

    target_size_str = (os.getenv("BANNER_OUTPUT_SIZE") or "").strip()
    target_w = target_h = None
    if target_size_str:
        try:
            target_w, target_h = _parse_size(target_size_str)
        except Exception:
            # Ignore invalid target size; keep None to avoid breaking banner generation
            target_w = target_h = None

    payload = {
        "model": model,
        "prompt": prompt[:2000],
        "n": 1,
        "size": requested_size,
        # Prefer base64 to save without relying on remote URLs; the API may still return url.
        # Some servers ignore response_format, so handle both cases below.
        "response_format": "b64_json",
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    resp = requests.post("https://api.openai.com/v1/images/generations", json=payload, headers=headers, timeout=120)
    try:
        resp.raise_for_status()
    except requests.HTTPError as exc:  # pragma: no cover - external API
        raise RuntimeError(f"OpenAI Images failed ({resp.status_code}): {resp.text}") from exc

    data = resp.json() or {}

    # Optional: dump full OpenAI response (includes usage) when BANNER_DUMP_JSON is set.
    dump_path = (os.getenv("BANNER_DUMP_JSON") or "").strip()
    if dump_path:
        try:
            pathlib.Path(dump_path).write_text(json.dumps(data, indent=2), encoding="utf-8")
        except Exception:
            pass

    arr = data.get("data") or []
    if not arr:
        raise RuntimeError(f"OpenAI Images returned no data: {data}")
    item = arr[0] or {}

    image_bytes: Optional[bytes] = None
    if "b64_json" in item and item["b64_json"]:
        try:
            image_bytes = base64.b64decode(item["b64_json"])
        except Exception as exc:  # pragma: no cover
            raise RuntimeError("Failed to decode base64 image from OpenAI response") from exc
    elif "url" in item and item["url"]:
        img_url = str(item["url"]).strip()
        r = requests.get(img_url, timeout=120)
        r.raise_for_status()
        image_bytes = r.content
    else:
        raise RuntimeError(f"OpenAI Images response missing image content: {item}")

    # Optional center-crop/resize to target size for platforms like Medium (e.g., 1000x420)
    if target_w and target_h:
        try:
            with Image.open(BytesIO(image_bytes)) as im:
                im = im.convert("RGB")
                fitted = _center_fit(im, target_w, target_h)
                buf = pathlib.BytesIO()
                fitted.save(buf, format="PNG")
                image_bytes = buf.getvalue()
        except Exception:
            pass

    STATIC_BANNERS_DIR.mkdir(parents=True, exist_ok=True)
    ts = int(time.time())
    filename = f"banner-openai-{ts}.png"
    out_path = STATIC_BANNERS_DIR / filename
    out_path.write_bytes(image_bytes)
    return out_path


def _local_file_to_base_url(file_path: pathlib.Path, base_url: str) -> str:
    return base_url.rstrip("/") + "/" + file_path.name


def _remove_leading_title(md: str, title: Optional[str]) -> str:
    """Strip a leading H1 or standalone title line from `md`.

    Preserves YAML front matter if present. Removes:
    - A leading Markdown H1 like `# Title`
    - A first line that exactly matches the title
    - Underline-style titles where second line is ===== or -----
    """
    if not md:
        return md
    md = md or ""
    # Separate front matter if present
    body = md
    front = ""
    stripped = md.lstrip()
    if stripped.startswith("---\n"):
        start = md.find("---\n")
        end_marker = md.find("\n---", start + 4)
        if end_marker != -1:
            end_line = md.find("\n", end_marker + 1)
            if end_line != -1:
                front = md[: end_line + 1]
                body = md[end_line + 1 :]

    # Work on body portion
    lines = body.splitlines()
    i = 0
    # skip leading blank lines
    while i < len(lines) and not lines[i].strip():
        i += 1
    if i >= len(lines):
        return md

    first = lines[i].strip()
    removed = False

    # Case 1: Markdown H1
    if first.startswith("# "):
        i += 1
        removed = True
    else:
        # Case 2: exact match to title
        if title and first.lower().strip(" #\t") == title.lower().strip():
            i += 1
            removed = True
        else:
            # Case 3: underline-style title (==== or ---- on next non-empty line)
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines):
                second = lines[j].strip()
                if re.fullmatch(r"[=\-]{3,}", second):
                    i = j + 1
                    removed = True

    if removed:
        new_body = "\n".join(lines[i:]).lstrip("\n")
        return front + new_body
    return md


def generate_banner(prompt: str, base_url: Optional[str] = None, caption: Optional[str] = None) -> str:
    """Generate a banner image.

    Provider is selected via `BANNER_PROVIDER`:
    - `local` (default): generate a local PNG (no external API)
    - `openai`: generate via OpenAI Images (DALL·E)
    - `auto`: try OpenAI Images, then fall back to local
    """
    base_url = (base_url or "").strip()

    trimmed_prompt = (prompt or "").strip()
    if not trimmed_prompt:
        raise RuntimeError("Banner prompt is empty")

    provider = (os.getenv("BANNER_PROVIDER") or "auto").strip().lower()
    # provider:
    #  - 'local'  = always local
    #  - 'openai' = only OpenAI Images (error on failure)
    #  - 'auto'   = try OpenAI, then local
    if provider == "local":
        # Extract a short title-like line from the prompt.
        title = trimmed_prompt
        if "titled '" in title:
            try:
                title = title.split("titled '", 1)[1].split("'", 1)[0]
            except Exception:
                title = trimmed_prompt
        out_path = _generate_local_banner_file(title, caption=caption)
        if base_url:
            return _local_file_to_base_url(out_path, base_url)

        # No base URL; upload somewhere public.
        upload_provider = (os.getenv("BANNER_UPLOAD_PROVIDER") or "github").strip().lower()
        if upload_provider == "github":
            return _github_upload_banner(out_path)
        raise RuntimeError(
            "BANNER_BASE_URL is empty and no supported BANNER_UPLOAD_PROVIDER is configured. "
            "Set BANNER_BASE_URL to a public URL, or set BANNER_UPLOAD_PROVIDER=github with GITHUB_TOKEN+GITHUB_REPO."
        )

    # Try OpenAI Images first (when provider is openai or auto)
    if provider in ("openai", "auto"):
        if not (os.getenv("OPENAI_API_KEY") or "").strip():
            # Surface a clear error instead of silently falling back so users know to set the key
            raise RuntimeError("OPENAI_API_KEY missing. Set it or choose BANNER_PROVIDER=local.")
        try:
            out_path = _generate_openai_banner_file(trimmed_prompt)
            if base_url:
                return _local_file_to_base_url(out_path, base_url)
            upload_provider = (os.getenv("BANNER_UPLOAD_PROVIDER") or "github").strip().lower()
            if upload_provider == "github":
                return _github_upload_banner(out_path)
            return str(out_path)
        except Exception:
            if provider == "openai":
                # In openai-only mode, surface the failure
                raise
            # In auto mode, fall through to local

    # Final fallback: local generator
    title = trimmed_prompt
    if "titled '" in title:
        try:
            title = title.split("titled '", 1)[1].split("'", 1)[0]
        except Exception:
            title = trimmed_prompt
    out_path = _generate_local_banner_file(title, caption=caption)
    if base_url:
        return _local_file_to_base_url(out_path, base_url)

    upload_provider = (os.getenv("BANNER_UPLOAD_PROVIDER") or "github").strip().lower()
    if upload_provider == "github":
        return _github_upload_banner(out_path)
    return _local_file_to_base_url(out_path, "")


def fetch_page(url: str) -> Tuple[str, str, List[Tuple[str, str]], List[str]]:
    """Return page title, readable text content, deduped (text, url) links, and primary main points.

    Main points are extracted from headings (h1-h3) and prominent list items and returned as a
    list of short strings to help ensure the summarizer covers the article's key ideas.
    """
    resp = requests.get(
        url,
        timeout=20,
        headers={
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        },
    )
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else "Untitled"

    # Extract readable text (preserve paragraphs and lists)
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    body = soup.get_text(separator="\n")
    text = "\n".join(line.strip() for line in body.splitlines() if line.strip())

    # Extract and dedupe anchor links
    seen_urls: set[str] = set()
    links: list[Tuple[str, str]] = []
    for a in soup.find_all("a", href=True):
        href = a.get("href") or ""
        abs_url = urljoin(url, href)
        if abs_url in seen_urls:
            continue
        seen_urls.add(abs_url)
        text_a = (a.get_text(strip=True) or abs_url)[:200]
        links.append((text_a, abs_url))

    # Extract main points from headings and list items (short, unique)
    points: list[str] = []
    def _add_point(s: str) -> None:
        clean = " ".join((s or "").split())
        if not clean:
            return
        # Keep points concise
        if len(clean) > 240:
            clean = clean[:237].rstrip() + "…"
        if clean not in points:
            points.append(clean)

    for h in soup.find_all(["h1", "h2", "h3"]):
        _add_point(h.get_text())
    # Pull a few prominent list items (limit to first 8)
    for li in soup.find_all("li"):
        _add_point(li.get_text())
        if len(points) >= 8:
            break

    # If no headings/lists found, fall back to first sentences from the article
    if not points:
        words = text.split()
        if words:
            snippet = " ".join(words[:60])
            _add_point(snippet)

    return title, text, links, points


def build_banner_prompt(title: str, raw_text: str, tags: Optional[List[str]] = None, caption: Optional[str] = None) -> str:
    """Create a restrained, clean banner prompt (no characters, no fantasy).
    
    Includes explicit instructions to render text clearly and correctly.
    """
    snippet_words = raw_text.split()
    snippet = " ".join(snippet_words[:24]) if snippet_words else ""
    tag_line = f" Tags: {', '.join(tags)}." if tags else ""
    style_hint = os.getenv("BANNER_PROMPT_STYLE") or (
        "Minimal, modern blog banner; 1000x420 layout; no people/creatures; no fantasy; "
        "abstract geometric accents only; soft gradients; high contrast; generous whitespace; "
        "clear focal area for title; flat illustration; professional tech aesthetic."
    )
    
    # Explicit text rendering instructions
    title_clean = " ".join((title or "").split())
    text_instructions = (
        f"IMPORTANT: Render the main title text EXACTLY as: '{title_clean}'. "
        "Use a large, bold, legible sans-serif font (like Arial or Helvetica) centered prominently. "
        "Ensure perfect spelling, high contrast, and zero OCR artifacts. "
        "Text must be crystal clear and readable even at small sizes."
    )
    
    caption_instructions = ""
    if caption:
        cap_short = " ".join(caption.split())
        cap_short = cap_short if len(cap_short) <= 200 else cap_short[:197].rstrip() + "…"
        caption_instructions = (
            f" At bottom-left, render this caption EXACTLY (plain sans-serif, correctly spelled): '{cap_short}'. "
            "Caption must be high-contrast and fully legible with no decorative fonts."
        )
    
    base = (
        f"Wide 1024x576 blog banner for '{title}'. "
        f"Context: {snippet}." + tag_line + " " + style_hint + " " + text_instructions + caption_instructions
    )
    return base.strip()


def summarize_content(
    source_title: str,
    source_url: str,
    raw_text: str,
    main_points: Optional[List[str]] = None,
    target_words: Tuple[int, int] = (800, 1000),
    model: str = "gpt-4o-mini",
    banner_url: Optional[str] = None,
    lock_title: bool = False,
) -> str:
    """Summarize raw_text to markdown with the requested publication structure."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY missing.")

    set_default_openai_key(api_key)

    lower, upper = target_words
    primary_keyword = (os.getenv("PRIMARY_KEYWORD") or source_title or "").strip()
    structure = (
        "Output must be markdown in this exact order:\n"
        "1) Subtitle / Intro Hook (40-60 words): what they'll learn + who it's for\n"
        "2) Introduction (100-130 words): define the topic plainly; include one explicit definition sentence; why it matters\n"
        "3) Concept Explanation (H2, 150-200 words): stepwise explanation; short paragraphs; define jargon\n"
        "4) How It Works / Process Breakdown (H2, 200-250 words): numbered steps for input -> processing -> output -> limitations\n"
        "5) Practical Example / Use Case (H2, 150-200 words): real-world scenario; minimal code optional + explanation\n"
        "6) Key Takeaways (H2, 3-5 bullets, 80-100 words total): each bullet is a complete sentence\n"
        "7) Conclusion (H2, 60-80 words): recap value; no new ideas; neutral forward-looking close\n"
        f"Rules: stay between {lower}-{upper} words total; use H2 headings; one idea per paragraph; avoid walls of text; "
        "neutral professional tone; active voice; no emojis; avoid fluff; do NOT include an H1 title.\n"
        "Grounding rules (mandatory):\n"
        "- Use ONLY the provided extracted content and provided links. Do not add tools/facts not present in the source.\n"
        "- If a detail is missing from the source, keep it general and explicitly avoid specifics.\n"
        "- Preserve important source links: include 2-6 of them where relevant (intro/process/example), without dumping an unrelated link list.\n"
        "- Preserve and explicitly cover the provided main points from the source. Ensure each main point appears either in the body or the Key Takeaways; if a main point cannot be verified from the provided content, state that explicitly.\n"
        f"SEO/LLM: Primary keyword is '{primary_keyword}'. Use it naturally in the Introduction and in at least one H2 heading. Avoid keyword stuffing."
    )

    agent = Agent(
        name="summarizer",
        instructions=(
            "You are a careful technical writer. Summarize the supplied article into markdown "
            f"at {lower}-{upper} words. Use crisp, scannable wording. Never add fictional tools or facts. "
            + structure
        ),
        model=model,
        model_settings=ModelSettings(temperature=0.3),
    )

    banner_line = f"Banner URL (for cover image only, do not embed as first line): {banner_url}\n" if banner_url else "Banner URL: (none)\n"
    title_line = "Title is locked; do not invent a new one.\n" if lock_title else ""
    main_points_block = ""
    if main_points:
        mp_lines = "\n".join(f"- {p}" for p in main_points[:8])
        main_points_block = f"Main points (extracted from source):\n{mp_lines}\n\n"

    input_payload = (
        f"Source title: {source_title}\n"
        f"Source URL: {source_url}\n"
        f"{banner_line}"
        f"{title_line}"
        f"{main_points_block}"
        f"Content (may be truncated):\n{raw_text[:15000]}"
    )

    result = Runner.run_sync(agent, input=input_payload)
    summary = result.final_output
    return summary.strip() if isinstance(summary, str) else str(summary).strip()


def post_devto(
    api_key: str,
    title: str,
    body_md: str,
    tags: Optional[List[str]],
    publish: bool,
    canonical_url: Optional[str],
) -> dict:
    headers = {"api-key": api_key, "Content-Type": "application/json"}

    # Append a short company blurb to the article body when publishing to Dev.to.
    # The blurb can be overridden by setting the DEVTO_COMPANY_BLURB environment variable.
    blurb = company_blurb()
    if blurb:
        # Avoid duplicating the blurb if it's already present in the markdown.
        if blurb not in body_md:
            body_md = body_md.rstrip() + "\n\n\n\n## About Infrasity\n\n" + blurb

    article = {
        "title": title,
        "body_markdown": body_md,
        "tags": tags or [],
        "published": publish,
    }
    if canonical_url:
        article["canonical_url"] = canonical_url

    payload = {"article": article}

    def _send(p: dict) -> requests.Response:
        return requests.post("https://dev.to/api/articles", json=p, headers=headers, timeout=20)

    resp = _send(payload)
    try:
        resp.raise_for_status()
    except requests.HTTPError as exc:  # pragma: no cover - network dependent
        # Dev.to enforces uniqueness for canonical_url across articles.
        if resp.status_code == 422 and canonical_url and "canonical url has already been taken" in resp.text.lower():
            raise RuntimeError(f"Dev.to publish failed ({resp.status_code}): {resp.text}") from exc
        raise RuntimeError(f"Dev.to publish failed ({resp.status_code}): {resp.text}") from exc

    return resp.json()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize and cross-post blog content.")
    parser.add_argument("--url", required=True, help="Published article URL to pull content from.")
    parser.add_argument("--tags", help="Comma-separated tags.")
    parser.add_argument("--title", help="Optional override title.")
    parser.add_argument("--banner", help="Optional banner image URL to place at top of markdown.")
    parser.add_argument("--canonical", help="Canonical URL to send to Dev.to.")
    parser.add_argument(
        "--lock-title",
        action="store_true",
        help="Force the provided title to stay fixed (recommended when --title is set).",
    )
    parser.add_argument(
        "--auto-banner",
        action="store_true",
        help="Auto-generate a banner if no --banner provided (uses BANNER_PROVIDER).",
    )
    parser.add_argument(
        "--banner-prompt",
        help="Custom prompt for banner generation (used with --auto-banner).",
    )
    parser.add_argument(
        "--banner-base-url",
        help="Base URL to serve generated banners (e.g., http://localhost:5000/static/banners).",
    )
    parser.add_argument(
        "--publish",
        action="store_true",
        help="Actually publish (otherwise dry-run only prints payloads).",
    )
    return parser.parse_args()


def main() -> None:
    load_dotenv()
    args = parse_args()

    tags = [t.strip() for t in args.tags.split(",") if t.strip()] if args.tags else []
    canonical_url = args.canonical or os.getenv("CANONICAL_URL") or args.url

    page_title, page_text, page_links, page_main_points = fetch_page(args.url)
    title = args.title or page_title
    lock_title = args.lock_title or bool(args.title)

    # Prepare company caption for banner rendering
    caption_text = banner_caption_text()

    banner_url = args.banner
    if not banner_url and args.auto_banner:
        prompt = args.banner_prompt or build_banner_prompt(title, page_text, tags, caption=caption_text)
        base_url = args.banner_base_url or os.getenv("BANNER_BASE_URL")
        banner_url = generate_banner(prompt, base_url=base_url, caption=caption_text)

    summary_md = summarize_content(
        title,
        args.url,
        page_text,
        main_points=page_main_points,
        banner_url=banner_url,
        lock_title=lock_title,
    )

    # Remove duplicated title/H1 in generated markdown when we supply title separately to Dev.to
    summary_md = _remove_leading_title(summary_md, title)

    # Ensure Dev.to uses the banner as the cover image.
    if banner_url:
        summary_md = _ensure_front_matter_cover_image(summary_md, banner_url)

    # Inline banner images can render very large on Dev.to; keep it optional.
    if banner_url and _truthy_env("INLINE_BANNER", default="0"):
        summary_md = _ensure_banner_markdown(summary_md, banner_url)

    # Append the same company blurb used for publishing to the preview so
    # the printed/dry-run markdown matches what will be posted.
    blurb = company_blurb()
    if blurb and blurb not in summary_md:
        summary_md = summary_md.rstrip() + "\n\n---\n\n## About Infrasity\n\n" + blurb

    devto_key = os.getenv("DEVTO_API_KEY")
    if not devto_key:
        raise RuntimeError("DEVTO_API_KEY missing.")
    if args.publish:
        devto_resp = post_devto(devto_key, title, summary_md, tags, publish=True, canonical_url=canonical_url)
        print("Dev.to published:", devto_resp.get("url", devto_resp))
    else:
        print("[dry-run] Dev.to payload ready (not sent).")

    print("Summary ready.\n---\n")
    print(summary_md)


if __name__ == "__main__":
    main()
