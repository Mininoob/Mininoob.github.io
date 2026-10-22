#!/usr/bin/env python3
"""Render resume.html into a one page US Letter PDF.

    python3 _resume/build_resume.py                  # writes Joshua_M_Le_Resume.pdf at the repo root
    python3 _resume/build_resume.py -o draft.pdf --preview draft.png

Needs PyMuPDF (pip install pymupdf).

Two things MuPDF's HTML layout can't do on its own are handled here:
  * Overflow. insert_htmlbox can clip without saying so, so the content is
    first laid out on a very tall scratch page and measured. If it runs
    past one page the build stops and says by how much.
  * Right-aligned dates. Table widths and floats are ignored, so each
    <p class="role" data-date="..."> gets its date drawn flush right on
    the same baseline after layout. data-href turns that text into a link.
"""
import argparse
import html
import pathlib
import re
import sys

import fitz

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parent
PAGE_W, PAGE_H = 612, 792      # US Letter in points
MARGIN_X, MARGIN_Y = 38, 32
# The base14 "helv" encoding has no en dash and swaps in a middle dot, so
# the dates use MuPDF's built-in Helvetica as a real embedded font instead.
SANS = fitz.Font("helv")
DATE_COLOR = (0x3a / 255, 0x42 / 255, 0x47 / 255)
LINK_COLOR = (0x1b / 255, 0x1f / 255, 0x22 / 255)


def load_source():
    src = (HERE / "resume.html").read_text(encoding="utf-8")
    src = re.sub(r"<!--.*?-->", "", src, flags=re.S)
    m = re.search(r"<style>(.*?)</style>", src, re.S)
    css = m.group(1) if m else ""
    body = (src[:m.start()] + src[m.end():]).strip() if m else src.strip()
    dated = []
    for attrs, inner in re.findall(r'<p class="role"([^>]*)>(.*?)</p>', body, re.S):
        date = re.search(r'data-date="([^"]+)"', attrs)
        href = re.search(r'data-href="([^"]+)"', attrs)
        text = html.unescape(re.sub(r"<[^>]+>", "", inner))
        text = re.sub(r"\s+", " ", text).strip()
        dated.append((text, date.group(1) if date else None, href.group(1) if href else None))
    return body, css, dated


def no_ligatures(body):
    """Stop MuPDF forming fi, fl and ff ligatures.

    Its HTML engine ignores font-variant-ligatures, and a ligature glyph ends up
    in the text layer as one character ("\ufb01ve" instead of "five"), which can
    trip the keyword matching in applicant tracking systems. Shaping runs per
    text span, so giving each such f its own span keeps the letters separate
    without adding any character. Only text between tags is touched.
    """
    parts = re.split(r"(<[^>]+>)", body)
    return "".join(p if p.startswith("<") else re.sub(r"f(?=[fil])", "<span>f</span>", p)
                   for p in parts)


def content_height(body, css, width):
    """Lay the content out on a tall page and return how far down it reaches."""
    tmp = fitz.open()
    page = tmp.new_page(width=PAGE_W, height=5000)
    page.insert_htmlbox(fitz.Rect(MARGIN_X, 0, MARGIN_X + width, 5000), body, css=css)
    bottom = max(b[3] for b in page.get_text("blocks"))
    return bottom


def place_dates(page, dated):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            spans = line["spans"]
            if spans:
                text = re.sub(r"\s+", " ", "".join(s["text"] for s in spans)).strip()
                lines.append((text, spans))
    right = PAGE_W - MARGIN_X
    page.insert_font(fontname="ResSans", fontbuffer=SANS.buffer)
    for text, date, href in dated:
        if not date:
            continue
        match = next((sp for t, sp in lines if t.startswith(text[:36])), None)
        if match is None:
            sys.exit(f"Could not find the header line for date {date!r}: {text!r}")
        first = match[0]
        size, baseline = first["size"], first["origin"][1]
        width = SANS.text_length(date, fontsize=size)
        x = right - width
        last_x = max(s["bbox"][2] for s in match)
        if x < last_x + 8:
            sys.exit(f"Date {date!r} would collide with its line: {text!r}")
        page.insert_text((x, baseline), date, fontname="ResSans", fontsize=size,
                         color=LINK_COLOR if href else DATE_COLOR)
        if href:
            page.insert_link({"kind": fitz.LINK_URI, "uri": href,
                              "from": fitz.Rect(x, baseline - size, right, baseline + 2)})


def build(out, preview=None):
    body, css, dated = load_source()
    body = no_ligatures(body)
    usable_w = PAGE_W - 2 * MARGIN_X
    usable_h = PAGE_H - 2 * MARGIN_Y
    needed = content_height(body, css, usable_w)
    if needed > usable_h:
        sys.exit(f"Does not fit on one page: content is {needed:.0f}pt tall, "
                 f"the page holds {usable_h:.0f}pt. Trim about {needed - usable_h:.0f}pt "
                 f"(roughly {int((needed - usable_h) / 11.3) + 1} lines) from resume.html.")

    doc = fitz.open()
    page = doc.new_page(width=PAGE_W, height=PAGE_H)
    page.insert_htmlbox(fitz.Rect(MARGIN_X, MARGIN_Y, PAGE_W - MARGIN_X, PAGE_H - MARGIN_Y),
                        body, css=css)
    place_dates(page, dated)
    doc.set_metadata({"title": "Joshua M Le Resume", "author": "Joshua M Le",
                      "subject": "Resume", "keywords": "", "creator": "", "producer": ""})
    doc.save(out, garbage=4, deflate=True)
    if preview:
        page.get_pixmap(dpi=120).save(preview)
    return needed, usable_h


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("-o", "--out", default=str(ROOT / "Joshua_M_Le_Resume.pdf"))
    ap.add_argument("--preview", help="also write a PNG of the page")
    a = ap.parse_args()
    needed, room = build(a.out, a.preview)
    print(f"wrote {a.out}  content {needed:.0f}pt of {room:.0f}pt  ({room - needed:.0f}pt spare)")
