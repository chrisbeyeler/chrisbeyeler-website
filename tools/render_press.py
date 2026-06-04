#!/usr/bin/env python3
"""
Render Pressespiegel-Section in index.html aus content/press.json.

Ersetzt den Bereich zwischen den Markern
    <!-- PRESS-LIST-START -->
    <!-- PRESS-LIST-END -->
im File index.html durch eine gruppierte Card-Liste (Jahres-Header,
Cards). Idempotent: mehrfaches Ausfuehren erzeugt identischen Output.

Akzeptanzkriterium aus BEY-1956:
  - Sortierung: year desc, dann month desc
  - Gruppierung nach Jahr mit subtilem Year-Header
  - Erste N=6 Cards des juengsten Jahres sichtbar, Rest mit
    `articles__hidden` (bestehende Show-More-Logik bleibt)
  - PR-Review-Modus: --dry-run zeigt Diff ohne Schreiben

Usage:
    python3 tools/render_press.py                  # in-place rewrite
    python3 tools/render_press.py --dry-run        # Diff zu stdout
    python3 tools/render_press.py --check          # Exit 1 wenn Diff
"""
from __future__ import annotations

import argparse
import difflib
import html
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
INDEX_HTML = REPO_ROOT / "index.html"
PRESS_JSON = REPO_ROOT / "content" / "press.json"

MARKER_START = "<!-- PRESS-LIST-START -->"
MARKER_END = "<!-- PRESS-LIST-END -->"

# Anzahl initial sichtbarer Cards (Rest wird hidden, Show-More entfaltet).
VISIBLE_INITIAL = 6

# Anzahl Cards mit Featured-Modifier (visuelles Highlight am Anfang der Liste).
# Matched bestehende media-redesign-Struktur (Commit 982cdcd).
FEATURED_COUNT = 4

MONTHS_DE = {
    1: "Jan", 2: "Feb", 3: "Mär", 4: "Apr", 5: "Mai", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Okt", 11: "Nov", 12: "Dez",
}


def load_items() -> list[dict]:
    with PRESS_JSON.open("r", encoding="utf-8") as fh:
        data = json.load(fh)
    items = data.get("items", [])
    for item in items:
        if "year" not in item or not isinstance(item["year"], int):
            raise ValueError(f"Eintrag ohne valides year: {item.get('id')}")
    items.sort(key=lambda i: (i["year"], i.get("month") or 0), reverse=True)
    return items


def fmt_date(item: dict) -> str:
    month = item.get("month")
    year = item["year"]
    if isinstance(month, int) and 1 <= month <= 12:
        return f"{MONTHS_DE[month]} {year}"
    return str(year)


def render_card(item: dict, hidden: bool, featured: bool) -> str:
    classes = "article-card"
    if featured:
        classes += " article-card--featured"
    classes += " glass-card"
    if hidden:
        classes += " articles__hidden"
    title_html = html.escape(item["title"], quote=True)
    source_html = html.escape(item["source"], quote=True)
    date_html = html.escape(fmt_date(item), quote=True)
    url = html.escape(item["url"], quote=True)
    image = html.escape(item["image"], quote=True)
    alt = html.escape(item.get("alt") or item["title"], quote=True)
    return (
        f'                    <a href="{url}" target="_blank" rel="noopener" class="{classes}">\n'
        f'                        <div class="article-card__img">\n'
        f'                            <img src="{image}" alt="{alt}" class="article-card__thumb" loading="lazy">\n'
        f'                        </div>\n'
        f'                        <div class="article-card__body">\n'
        f'                            <span class="article-card__source">{source_html}</span>\n'
        f'                            <span class="article-card__title">{title_html}</span>\n'
        f'                            <span class="article-card__date">{date_html}</span>\n'
        f'                        </div>\n'
        f'                    </a>\n'
    )


def render_year_header(year: int, hidden: bool) -> str:
    classes = "articles__year"
    if hidden:
        classes += " articles__hidden"
    return (
        f'                    <h4 class="{classes}" style="grid-column: 1 / -1;">{year}</h4>\n'
    )


def render_grid(items: list[dict]) -> str:
    """Erzeugt den HTML-Block zwischen den Markern (exklusive Marker selbst)."""
    out: list[str] = []
    out.append('                <div class="articles__grid">\n')

    rendered = 0
    last_year: int | None = None
    for item in items:
        # Year-Header bei Wechsel. Erster Header sichtbar, danach hidden, sobald
        # die initiale Sichtbarkeitsgrenze ueberschritten wurde.
        if item["year"] != last_year:
            header_hidden = rendered >= VISIBLE_INITIAL
            out.append(render_year_header(item["year"], hidden=header_hidden))
            last_year = item["year"]
        card_hidden = rendered >= VISIBLE_INITIAL
        card_featured = rendered < FEATURED_COUNT
        out.append(render_card(item, hidden=card_hidden, featured=card_featured))
        rendered += 1

    out.append('                </div>\n')
    return "".join(out)


def apply_replacement(text: str, new_block: str) -> str:
    pattern = re.compile(
        re.escape(MARKER_START) + r".*?" + re.escape(MARKER_END),
        re.DOTALL,
    )
    replacement = f"{MARKER_START}\n{new_block}                {MARKER_END}"
    new_text, count = pattern.subn(replacement, text)
    if count != 1:
        raise RuntimeError(
            f"Marker {MARKER_START} / {MARKER_END} nicht (oder mehrfach) "
            f"in {INDEX_HTML} gefunden (count={count})."
        )
    return new_text


def main() -> int:
    parser = argparse.ArgumentParser(description="Render Pressespiegel in index.html")
    parser.add_argument("--dry-run", action="store_true",
                        help="Diff auf stdout, kein File-Write")
    parser.add_argument("--check", action="store_true",
                        help="Exit 1 wenn Re-Render Diff produzieren wuerde")
    args = parser.parse_args()

    items = load_items()
    new_block = render_grid(items)
    original = INDEX_HTML.read_text(encoding="utf-8")
    updated = apply_replacement(original, new_block)

    if original == updated:
        print(f"[render_press] {INDEX_HTML.name}: bereits aktuell "
              f"({len(items)} Eintraege).", file=sys.stderr)
        return 0

    if args.check:
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            updated.splitlines(keepends=True),
            fromfile="index.html (current)",
            tofile="index.html (rendered)",
        )
        sys.stdout.writelines(diff)
        print("[render_press] Diff vorhanden (--check Exit 1).", file=sys.stderr)
        return 1

    if args.dry_run:
        diff = difflib.unified_diff(
            original.splitlines(keepends=True),
            updated.splitlines(keepends=True),
            fromfile="index.html (current)",
            tofile="index.html (rendered)",
        )
        sys.stdout.writelines(diff)
        return 0

    INDEX_HTML.write_text(updated, encoding="utf-8")
    print(f"[render_press] {INDEX_HTML.name} aktualisiert: "
          f"{len(items)} Eintraege.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
