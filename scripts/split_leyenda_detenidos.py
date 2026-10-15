"""Parte leyenda-detenidos-desk.svg en map + key (sin solapar textos)."""
from __future__ import annotations

import copy
import re
from pathlib import Path

from lxml import etree

NS = {"svg": "http://www.w3.org/2000/svg"}


def local(tag: str) -> str:
    return tag.split("}")[-1] if isinstance(tag, str) else tag


def approx_y(el) -> tuple[float | None, float | None]:
    tag = local(el.tag)
    tr = el.get("transform") or ""
    translates = [
        float(m.group(2))
        for m in re.finditer(r"translate\(\s*([-\d.]+)[ ,]+([-\d.]+)", tr)
    ]
    # text: solo translate (los tspan y=0 contaminan el rango)
    if tag == "text":
        if translates:
            y = translates[0]
            return y, y
        return None, None
    ys: list[float] = []
    for a in ("y", "y1", "y2", "cy"):
        v = el.get(a)
        if v is not None:
            try:
                ys.append(float(v))
            except ValueError:
                pass
    ys.extend(translates)
    if tag == "g":
        for c in el:
            a, b = approx_y(c)
            if a is not None:
                ys.extend([a, b])
    if not ys:
        return None, None
    return min(ys), max(ys)


def get_main(root):
    for child in root:
        if local(child.tag) == "g":
            return child
    return None


def write_svg(root, path: Path, viewbox: str) -> None:
    parts = [float(x) for x in viewbox.split()]
    root.set("viewBox", viewbox)
    root.set("width", f"{parts[2]:g}")
    root.set("height", f"{parts[3]:g}")
    path.write_bytes(
        etree.tostring(root, xml_declaration=True, encoding="UTF-8", pretty_print=True)
    )
    print(f"  wrote {path.name} viewBox={viewbox}")


def main() -> None:
    img = Path("src/assets/images")
    src = img / "leyenda-detenidos-desk.svg"
    root = etree.parse(str(src)).getroot()
    w, h = 202.15, 416.068
    map_h, key_y = 304.0, 320.43
    key_h = round(h - key_y, 3)

    map_root = copy.deepcopy(root)
    key_root = copy.deepcopy(root)
    map_main = get_main(map_root)
    key_main = get_main(key_root)

    for child in list(map_main):
        y0, y1 = approx_y(child)
        if y0 is not None and (y0 + y1) / 2 >= map_h:
            map_main.remove(child)

    for child in list(key_main):
        y0, y1 = approx_y(child)
        if y0 is not None and (y0 + y1) / 2 < key_y:
            key_main.remove(child)

    write_svg(map_root, img / "leyenda-detenidos-map.svg", f"0 0 {w:.3f} {map_h:.3f}")
    write_svg(key_root, img / "leyenda-detenidos-key.svg", f"0 {key_y:.3f} {w:.3f} {key_h:.3f}")


if __name__ == "__main__":
    main()
