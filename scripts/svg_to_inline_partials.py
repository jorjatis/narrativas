"""Generate Handlebars SVG partials with unique IDs/classes for inline use."""
from __future__ import annotations

import re
from pathlib import Path

IMG = Path("src/assets/images")
OUT = Path("src/views/partials/includes/svg")

ITEMS = [
    ("crono-detenidos-names.svg", "crono-detenidos-names", "cd-names", "v-n-chrono__names"),
    ("crono-detenidos-body.svg", "crono-detenidos-body", "cd-body", "v-n-chrono__body"),
    ("crono-detenidos-mov-names.svg", "crono-detenidos-mov-names", "cd-mov-names", "v-n-chrono__names"),
    ("crono-detenidos-mov-body.svg", "crono-detenidos-mov-body", "cd-mov-body", "v-n-chrono__body"),
    ("crono-profugos-names.svg", "crono-profugos-names", "cp-names", "v-n-chrono__names"),
    ("crono-profugos-body.svg", "crono-profugos-body", "cp-body", "v-n-chrono__body"),
    ("crono-profugos-mov-names.svg", "crono-profugos-mov-names", "cp-mov-names", "v-n-chrono__names"),
    ("crono-profugos-mov-body.svg", "crono-profugos-mov-body", "cp-mov-body", "v-n-chrono__body"),
    ("leyenda-detenidos-map.svg", "leyenda-detenidos-map", "ld-map", "v-n-chrono__legend-img"),
    ("leyenda-detenidos-key.svg", "leyenda-detenidos-key", "ld-key", "v-n-chrono__legend-img"),
    ("leyenda-profugos-map.svg", "leyenda-profugos-map", "lp-map", "v-n-chrono__legend-img"),
    ("leyenda-profugos-key.svg", "leyenda-profugos-key", "lp-key", "v-n-chrono__legend-img"),
]


def prepare(src: Path, prefix: str, css_class: str) -> str:
    raw = src.read_text(encoding="utf-8")
    raw = re.sub(r"<\?xml[^?]*\?>\s*", "", raw)

    ids = set(re.findall(r'\bid="([^"]+)"', raw)) | set(re.findall(r"\bid='([^']+)'", raw))
    for i in sorted(ids, key=len, reverse=True):
        safe = re.sub(r"[^A-Za-z0-9_-]", "-", i)
        new = f"{prefix}-{safe}"
        raw = raw.replace(f'id="{i}"', f'id="{new}"')
        raw = raw.replace(f"id='{i}'", f"id='{new}'")
        raw = raw.replace(f"url(#{i})", f"url(#{new})")
        raw = raw.replace(f'href="#{i}"', f'href="#{new}"')
        raw = raw.replace(f"href='#{i}'", f"href='#{new}'")
        raw = raw.replace(f'xlink:href="#{i}"', f'xlink:href="#{new}"')

    classes = sorted(set(re.findall(r"\bcls-(\d+)\b", raw)), key=lambda n: int(n), reverse=True)
    for n in classes:
        old = f"cls-{n}"
        new = f"{prefix}-cls-{n}"
        raw = re.sub(rf"(?<![A-Za-z0-9_-]){re.escape(old)}(?![A-Za-z0-9_-])", new, raw)

    def fix_svg(m):
        tag = m.group(0)
        vb = re.search(r'viewBox="([^"]+)"', tag)
        if vb:
            parts = [float(x) for x in vb.group(1).replace(",", " ").split()]
            w, h = parts[2], parts[3]
            if re.search(r'\bwidth="', tag):
                tag = re.sub(r'\bwidth="[^"]*"', f'width="{w:g}"', tag)
            else:
                tag = tag[:-1] + f' width="{w:g}"' + ">"
            if re.search(r'\bheight="', tag):
                tag = re.sub(r'\bheight="[^"]*"', f'height="{h:g}"', tag)
            else:
                tag = tag[:-1] + f' height="{h:g}"' + ">"
        if 'class="' in tag:
            tag = re.sub(
                r'class="([^"]*)"',
                lambda mm: f'class="{mm.group(1)} {css_class}"'.strip(),
                tag,
                count=1,
            )
        else:
            tag = tag[:-1] + f' class="{css_class}"' + ">"
        if "role=" not in tag:
            tag = tag[:-1] + ' role="img"' + ">"
        if "aria-hidden=" not in tag:
            tag = tag[:-1] + ' aria-hidden="true"' + ">"
        return tag

    raw = re.sub(r"<svg\b[^>]*>", fix_svg, raw, count=1)
    return raw.strip() + "\n"


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    for src_name, partial, prefix, css_class in ITEMS:
        src = IMG / src_name
        if not src.exists():
            print("MISSING", src_name)
            continue
        out = OUT / f"{partial}.hbs"
        out.write_text(prepare(src, prefix, css_class), encoding="utf-8")
        print(f"wrote {out} ({out.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
