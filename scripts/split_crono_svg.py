"""
Parte crono-*-desk.svg / crono-*-mov.svg en capas para el scroll sticky.

Desk: names + faces + body
Mov:  names + body
"""
from __future__ import annotations

import copy
import re
from pathlib import Path

from lxml import etree

NSMAP = {
    None: "http://www.w3.org/2000/svg",
    "xlink": "http://www.w3.org/1999/xlink",
}
NS = {"svg": "http://www.w3.org/2000/svg", "xlink": "http://www.w3.org/1999/xlink"}
XLINK = "{http://www.w3.org/1999/xlink}"


def local(tag: str) -> str:
    return tag.split("}")[-1] if isinstance(tag, str) else tag


def parse_viewbox(root) -> tuple[float, float, float, float]:
    parts = [float(x) for x in root.get("viewBox").replace(",", " ").split()]
    return parts[0], parts[1], parts[2], parts[3]


def element_y_hints(el) -> list[float]:
    ys: list[float] = []
    for attr in ("y", "y1", "y2", "cy"):
        v = el.get(attr)
        if v is not None:
            try:
                ys.append(float(v))
            except ValueError:
                pass
    tr = el.get("transform") or ""
    for m in re.finditer(r"translate\(\s*([-\d.]+)[ ,]+([-\d.]+)\s*\)", tr):
        ys.append(float(m.group(2)))
    for m in re.finditer(r"matrix\(\s*([^)]+)\)", tr):
        nums = re.findall(r"[-\d.]+", m.group(1))
        if len(nums) >= 6:
            ys.append(float(nums[5]))
    return ys


def collect_ys(el) -> list[float]:
    ys = element_y_hints(el)
    for child in el:
        ys.extend(collect_ys(child))
    return ys


def approx_y_range(el) -> tuple[float | None, float | None]:
    ys = collect_ys(el)
    if not ys:
        return None, None
    return min(ys), max(ys)


def strip_images_and_face_clips(root) -> None:
    for img in root.xpath(".//svg:image", namespaces=NS):
        parent = img.getparent()
        if parent is not None:
            parent.remove(img)
    # clipPaths only used by faces
    defs = root.find("svg:defs", namespaces=NS)
    if defs is not None:
        for clip in list(defs.xpath("./svg:clipPath", namespaces=NS)):
            defs.remove(clip)
    # remove empty use of clip-path classes? keep styles
    for circ in root.xpath(".//svg:circle", namespaces=NS):
        parent = circ.getparent()
        if parent is not None:
            parent.remove(circ)


def keep_only_faces(root) -> None:
    """Deja images, clipPaths, circles y sus wrappers mínimos."""
    main = None
    for child in list(root):
        if local(child.tag) == "g":
            main = child
            break
    if main is None:
        return

    # Recolectar nodos a preservar: image ancestors + circles
    keep_nodes = set()
    for img in main.xpath(".//svg:image", namespaces=NS):
        node = img
        while node is not None:
            keep_nodes.add(node)
            node = node.getparent()
    for circ in main.xpath(".//svg:circle", namespaces=NS):
        node = circ
        while node is not None:
            keep_nodes.add(node)
            node = node.getparent()

    def prune(el) -> None:
        for child in list(el):
            if child not in keep_nodes and local(child.tag) not in ("defs",):
                # keep if descendant has keep
                if not any(d in keep_nodes for d in child.iter()):
                    el.remove(child)
                else:
                    prune(child)

    prune(main)

    # defs: keep only clipPaths referenced
    defs = root.find("svg:defs", namespaces=NS)
    if defs is None:
        return
    refs = set()
    for el in root.iter():
        cp = el.get("clip-path") or ""
        m = re.search(r"url\(#([^)]+)\)", cp)
        if m:
            refs.add(m.group(1))
        cls = el.get("class") or ""
        # also style clip-path in CSS referencing clippath ids via class
    # Keep all clipPaths (faces use them) and style block
    for child in list(defs):
        if local(child.tag) == "clipPath":
            cid = child.get("id")
            if refs and cid not in refs:
                # still keep if any clip-path class in style uses it — keep all
                pass
        elif local(child.tag) == "style":
            continue
        elif local(child.tag) != "clipPath":
            # drop non-style non-clip extras
            if local(child.tag) not in ("style", "clipPath"):
                defs.remove(child)


def hide_cartela_markers(root) -> list[tuple[str, float]]:
    """Oculta líneas marcadoras bloqueN-cartela y devuelve (id, y1)."""
    markers: list[tuple[str, float]] = []
    for line in root.xpath(".//svg:line", namespaces=NS):
        lid = line.get("id") or ""
        if "cartela" not in lid:
            continue
        y1 = float(line.get("y1") or 0)
        markers.append((lid, y1))
        # Solo señalización: no deben verse
        line.set("display", "none")
        style = line.get("style") or ""
        if "display" not in style:
            line.set("style", (style + ";display:none").strip(";"))
    markers.sort(key=lambda m: m[1])
    return markers


def write_svg(root, out: Path, viewbox: str) -> None:
    root = copy.deepcopy(root)
    hide_cartela_markers(root)
    root.set("viewBox", viewbox)
    out.write_bytes(
        etree.tostring(
            root,
            xml_declaration=True,
            encoding="UTF-8",
            pretty_print=False,
        )
    )
    print(f"  wrote {out.name} ({out.stat().st_size:,} bytes) viewBox={viewbox}")


def split_desk(src: Path, prefix: str, names_h: float, faces_h: float) -> None:
    print(f"\nDESK {src.name}")
    tree = etree.parse(str(src))
    root = tree.getroot()
    _, _, w, h = parse_viewbox(root)
    face_end = names_h + faces_h
    body_h = h - face_end
    out_dir = src.parent

    # names
    names_root = copy.deepcopy(root)
    strip_images_and_face_clips(names_root)
    write_svg(names_root, out_dir / f"{prefix}-names.svg", f"0 0 {w} {names_h}")

    # faces
    faces_root = copy.deepcopy(root)
    keep_only_faces(faces_root)
    write_svg(
        faces_root,
        out_dir / f"{prefix}-faces.svg",
        f"0 {names_h} {w} {faces_h}",
    )

    # body
    body_root = copy.deepcopy(root)
    strip_images_and_face_clips(body_root)
    write_svg(
        body_root, out_dir / f"{prefix}-body.svg", f"0 {face_end} {w} {body_h}"
    )


def split_mov(src: Path, prefix: str, names_h: float) -> None:
    print(f"\nMOV {src.name}")
    tree = etree.parse(str(src))
    root = tree.getroot()
    _, _, w, h = parse_viewbox(root)
    body_h = h - names_h
    out_dir = src.parent

    names_root = copy.deepcopy(root)
    write_svg(names_root, out_dir / f"{prefix}-mov-names.svg", f"0 0 {w} {names_h}")

    body_root = copy.deepcopy(root)
    write_svg(
        body_root, out_dir / f"{prefix}-mov-body.svg", f"0 {names_h} {w} {body_h}"
    )


def detect_desk_bands(src: Path) -> tuple[float, float]:
    """names_h, faces_h from image translates + circle radius."""
    tree = etree.parse(str(src))
    root = tree.getroot()
    img_ys = []
    for img in root.xpath(".//svg:image", namespaces=NS):
        ys = element_y_hints(img)
        if ys:
            img_ys.append(min(ys))
    circ_ys = []
    circ_rs = []
    for c in root.xpath(".//svg:circle", namespaces=NS):
        if c.get("cy"):
            circ_ys.append(float(c.get("cy")))
        if c.get("r"):
            circ_rs.append(float(c.get("r")))
    names_h = min(img_ys) if img_ys else 130.0
    # round to nice value like previous exports
    names_h = round(names_h, 0) if abs(names_h - round(names_h)) < 0.2 else round(names_h, 2)
    face_bottom = max(circ_ys) + max(circ_rs) if circ_ys and circ_rs else names_h + 52
    # include a little padding under faces like old 182 vs 177
    faces_h = max(52.0, round(face_bottom - names_h + 4.5, 2))
    return names_h, faces_h


def detect_mov_names_h(src: Path) -> float:
    """Hasta justo antes de la primera línea horizontal del timeline."""
    tree = etree.parse(str(src))
    root = tree.getroot()
    line_ys = []
    for line in root.xpath(".//svg:line", namespaces=NS):
        y1 = line.get("y1")
        y2 = line.get("y2")
        if y1 and y2 and abs(float(y1) - float(y2)) < 0.5:
            y = float(y1)
            if y < 400:
                line_ys.append(y)
    if not line_ys:
        return 145.0
    first = min(line_ys)
    # names terminan un poco antes del timeline; padding ~0
    # usar el primer hueco: text baseline o valor redondo
    text_ys = []
    for t in root.xpath(".//svg:text", namespaces=NS):
        text_ys.extend(element_y_hints(t))
    if text_ys:
        # incluir textos + margen hasta timeline
        return round(first, 2)  # crop just at first timeline line
    return round(first, 2)


def print_cartela_ats(src: Path) -> None:
    tree = etree.parse(str(src))
    root = tree.getroot()
    _, _, _, h = parse_viewbox(root)
    markers = hide_cartela_markers(copy.deepcopy(root))
    # re-read without mutating
    markers = []
    for line in root.xpath(".//svg:line", namespaces=NS):
        lid = line.get("id") or ""
        if "cartela" not in lid:
            continue
        markers.append((lid, float(line.get("y1") or 0)))
    markers.sort(key=lambda m: m[1])
    print(f"  cartela data-at ({src.name}, H={h}):")
    for lid, y in markers:
        at = round(y / h, 3)
        print(f'    {lid}: y={y} -> data-at="{at}"')


def main() -> None:
    img = Path("src/assets/images")

    d_names, d_faces = detect_desk_bands(img / "crono-detenidos-desk.svg")
    print(f"detenidos desk bands: names_h={d_names}, faces_h={d_faces}")
    if abs(d_names - 130) < 1:
        d_names = 130.0
    if abs(d_faces - 52) < 6:
        d_faces = 52.0
    print_cartela_ats(img / "crono-detenidos-desk.svg")
    split_desk(img / "crono-detenidos-desk.svg", "crono-detenidos", d_names, d_faces)

    p_names, p_faces = detect_desk_bands(img / "crono-profugos-desk.svg")
    print(f"profugos desk bands: names_h={p_names}, faces_h={p_faces}")
    # No forzar 152: el arte nuevo empieza ~149
    if abs(p_faces - 52) < 8:
        p_faces = 52.0
    print_cartela_ats(img / "crono-profugos-desk.svg")
    split_desk(img / "crono-profugos-desk.svg", "crono-profugos", p_names, p_faces)

    dm = detect_mov_names_h(img / "crono-detenidos-mov.svg")
    print(f"detenidos mov names_h={dm}")
    split_mov(img / "crono-detenidos-mov.svg", "crono-detenidos", dm)

    pm = detect_mov_names_h(img / "crono-profugos-mov.svg")
    print(f"profugos mov names_h={pm}")
    split_mov(img / "crono-profugos-mov.svg", "crono-profugos", pm)


if __name__ == "__main__":
    main()
