#!/usr/bin/env python3
"""Lightweight static checks for the hand-built site."""
from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = [ROOT / "index.html", *sorted((ROOT / "pages").glob("*.html"))]
URL_ATTR_RE = re.compile(r'''(?:href|src)=["']([^"']+)["']''', re.IGNORECASE)
SRCSET_RE = re.compile(r'''srcset=["']([^"']+)["']''', re.IGNORECASE)
NAV_LABEL_RE = re.compile(r'<span class="nav-label(?:-stack label-stack)?">?\s*(?:<span class="label-normal">)?([^<]+)', re.IGNORECASE)

EXTERNAL_SCHEMES = {"http", "https", "mailto", "tel"}


def is_external(value: str) -> bool:
    scheme = urlsplit(value).scheme
    return scheme in EXTERNAL_SCHEMES or value.startswith("#")


def clean_url(value: str) -> str:
    return value.split("#", 1)[0].split("?", 1)[0]


def check_local_url(html_path: Path, value: str, errors: list[str]) -> None:
    value = clean_url(value.strip())
    if not value or is_external(value):
        return
    target = (html_path.parent / value).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        errors.append(f"{html_path.relative_to(ROOT)} links outside project: {value}")
        return
    if not target.exists():
        errors.append(f"{html_path.relative_to(ROOT)} missing asset/link target: {value}")


def check_html(errors: list[str], warnings: list[str]) -> None:
    for html_path in HTML_FILES:
        html = html_path.read_text(encoding="utf-8")
        if '<html lang="en" class="no-js">' not in html:
            errors.append(f"{html_path.relative_to(ROOT)} is missing the no-js HTML class.")
        if 'document.documentElement.classList.add("js")' not in html:
            errors.append(f"{html_path.relative_to(ROOT)} is missing the early js/no-js enhancement script.")
        if re.search(r'<nav[^>]+class="mobile-nav"[^>]+hidden', html):
            errors.append(f"{html_path.relative_to(ROOT)} hides mobile navigation in source HTML.")

        for url in URL_ATTR_RE.findall(html):
            check_local_url(html_path, url, errors)
        for srcset in SRCSET_RE.findall(html):
            for candidate in srcset.split(','):
                url = candidate.strip().split()[0]
                check_local_url(html_path, url, errors)

        if (ROOT / "css" / "local-fonts.css").exists():
            if "fonts.googleapis.com" in html or "fonts.gstatic.com" in html:
                errors.append(f"{html_path.relative_to(ROOT)} still contains Google Fonts runtime links after local-fonts.css exists.")
        elif "fonts.googleapis.com" in html:
            warnings.append("Local fonts have not been generated yet; run `make fonts` before deployment.")


def check_css_js(errors: list[str]) -> None:
    css = (ROOT / "css" / "main.css").read_text(encoding="utf-8")
    if css.count("{") != css.count("}"):
        errors.append("css/main.css has unmatched braces.")
    required_css = [".js .mobile-nav", ".js .mobile-nav.is-open", ".no-js .menu-toggle"]
    for needle in required_css:
        if needle not in css:
            errors.append(f"css/main.css is missing progressive-enhancement rule: {needle}")
    if ".mobile-nav[hidden]" in css:
        errors.append("css/main.css still uses the hidden-attribute mobile-nav rule.")
    if not re.search(r"@media \(max-width: 800px\).*?\.mobile-nav \{[^}]*position: static;", css, re.S):
        errors.append("css/main.css should keep the no-JS mobile nav in normal document flow.")
    if not re.search(r"\.js \.mobile-nav \{[^}]*position: absolute;", css, re.S):
        errors.append("css/main.css should apply overlay positioning only after JS enhancement.")

    js = (ROOT / "js" / "scripts.js").read_text(encoding="utf-8")
    for needle in ["classList.toggle('is-open'", "aria-hidden", "setMenuState(false)"]:
        if needle not in js:
            errors.append(f"js/scripts.js is missing expected mobile-nav behavior: {needle}")


def check_fonts(errors: list[str]) -> None:
    local_css = ROOT / "css" / "local-fonts.css"
    manifest = ROOT / "fonts" / "lora" / "MANIFEST.json"
    if local_css.exists() != manifest.exists():
        errors.append("local font CSS and MANIFEST.json should appear together.")


def main() -> int:
    errors: list[str] = []
    warnings: list[str] = []
    check_html(errors, warnings)
    check_css_js(errors)
    check_fonts(errors)

    for warning in sorted(set(warnings)):
        print(f"Warning: {warning}")
    if errors:
        for error in errors:
            print(f"Error: {error}", file=sys.stderr)
        return 1
    print("Site checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
