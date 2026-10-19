"""Parte leyenda-*-desk.svg en map (minimap) + key (rayas/textos de abajo)."""
from __future__ import annotations

import copy
import re
import sys
from pathlib import Path

from lxml import etree

IMG = Path("src/assets/images")


def local(tag: str) -> str:
    return tag.split("}")[-1] if isinstance(tag, str) else tag


def approx_y(el) -> tuple[float | None, float | None]:
    tag = local(el.tag)
    tr = el.get("transform") or ""
    translates = [
        float(m.group(2))
        for m in re.finditer(r"translate\(\s*([-\d.]+)[ ,]+([-\d.]+)", tr)
    ]
    # text: solo translate (tspan y=0 contamina)
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


def parse_vb(root) -> tuple[float, float, float, float]:
    parts = [float(x) for x in root.get("viewBox").replace(",", " ").split()]
    return parts[0], parts[1], parts[2], parts[3]


def write_svg(root, path: Path, viewbox: str) -> None:
    parts = [float(x) for x in viewbox.replace(",", " ").split()]
    root.set("viewBox", viewbox)
    root.set("width", f"{parts[2]:g}")
    root.set("height", f"{parts[3]:g}")
    # fuentes CSS de la página
    for style in root.xpath(".//*[local-name()='style']"):
        if style.text:
            style.text = re.sub(
                r"font-family:\s*Micrograph-Semibold(?:,\s*Micrograph)?\s*;",
                "font-family: 'Micrograph Semibold', sans-serif;",
                style.text,
            )
            style.text = re.sub(
                r"font-family:\s*Micrograph-Regular(?:,\s*Micrograph)?\s*;",
                "font-family: 'Micrograph Regular', sans-serif;",
                style.text,
            )
    path.write_bytes(
        etree.tostring(root, xml_declaration=True, encoding="UTF-8", pretty_print=True)
    )
    print(f"  wrote {path.name} viewBox={viewbox}")


def detect_cut(main, total_h: float) -> tuple[float, float]:
    """map_h, key_y: corta antes del bloque de rayas/textos inferiores."""
    key_tops: list[float] = []
    map_bottoms: list[float] = []
    for child in main:
        y0, y1 = approx_y(child)
        if y0 is None:
            continue
        mid = (y0 + y1) / 2
        # Clave: textos o líneas horizontales cortas en el tercio inferior
        if local(child.tag) == "text" or mid > total_h * 0.72:
            key_tops.append(y0)
        else:
            map_bottoms.append(y1)
    if not key_tops:
        # Sin clave: todo es mapa
        return total_h, total_h
    key_y = min(key_tops)
    map_h = max(map_bottoms) if map_bottoms else key_y
    # hueco entre mapa y clave
    if map_h < key_y:
        map_h = round((map_h + key_y) / 2, 3) if map_bottoms else round(key_y - 16, 3)
    else:
        map_h = round(key_y - 16, 3)
    return max(map_h, 1.0), key_y


def split_desk(prefix: str, map_h: float | None = None, key_y: float | None = None) -> None:
    src = IMG / f"{prefix}-desk.svg"
    print(f"\n{src.name}")
    root = etree.parse(str(src)).getroot()
    _, _, w, h = parse_vb(root)
    main = get_main(root)
    if main is None:
        raise SystemExit(f"no <g> root in {src}")

    auto_map_h, auto_key_y = detect_cut(main, h)
    if map_h is None:
        map_h = auto_map_h
    if key_y is None:
        key_y = auto_key_y

    # Solo mapa (sin bloque de rayas)
    if key_y >= h - 1:
        map_root = copy.deepcopy(root)
        write_svg(map_root, IMG / f"{prefix}-map.svg", f"0 0 {w:g} {h:g}")
        print("  (sin clave inferior)")
        return

    key_h = round(h - key_y, 3)
    print(f"  cut map_h={map_h} key_y={key_y} key_h={key_h}")

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

    write_svg(map_root, IMG / f"{prefix}-map.svg", f"0 0 {w:.3f} {map_h:.3f}")
    write_svg(key_root, IMG / f"{prefix}-key.svg", f"0 {key_y:.3f} {w:.3f} {key_h:.3f}")


def main() -> None:
    # Detenidos: corte fijo conocido (mapa ~304, clave desde ~320)
    if (IMG / "leyenda-detenidos-desk.svg").exists():
        split_desk("leyenda-detenidos", map_h=304.0, key_y=320.43)

    # Prófugos: el desk nuevo suele ser solo mapa
    if (IMG / "leyenda-profugos-desk.svg").exists():
        split_desk("leyenda-profugos")

    # Mobile detenidos si existe
    mob = IMG / "leyenda-detenidos-mob.svg"
    if mob.exists():
        # tratar como desk → map/key con sufijo mob
        root = etree.parse(str(mob)).getroot()
        _, _, w, h = parse_vb(root)
        main = get_main(root)
        map_h, key_y = detect_cut(main, h)
        print(f"\n{mob.name} auto cut map_h={map_h} key_y={key_y}")
        if key_y >= h - 1:
            write_svg(copy.deepcopy(root), IMG / "leyenda-detenidos-mob-map.svg", f"0 0 {w:g} {h:g}")
        else:
            key_h = round(h - key_y, 3)
            map_root = copy.deepcopy(root)
            key_root = copy.deepcopy(root)
            for child in list(get_main(map_root)):
                y0, y1 = approx_y(child)
                if y0 is not None and (y0 + y1) / 2 >= map_h:
                    get_main(map_root).remove(child)
            for child in list(get_main(key_root)):
                y0, y1 = approx_y(child)
                if y0 is not None and (y0 + y1) / 2 < key_y:
                    get_main(key_root).remove(child)
            write_svg(map_root, IMG / "leyenda-detenidos-mob-map.svg", f"0 0 {w:.3f} {map_h:.3f}")
            write_svg(key_root, IMG / "leyenda-detenidos-mob-key.svg", f"0 {key_y:.3f} {w:.3f} {key_h:.3f}")


if __name__ == "__main__":
    main()
