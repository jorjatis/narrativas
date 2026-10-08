from pathlib import Path
from lxml import etree

NS = {"svg": "http://www.w3.org/2000/svg"}


def local(tag):
    return tag.split("}")[-1] if isinstance(tag, str) else tag


def analyze(path):
    tree = etree.parse(str(path))
    root = tree.getroot()
    print("===", path.name, "viewBox=", root.get("viewBox"), "===")
    for child in list(root):
        print(
            "ROOT",
            local(child.tag),
            "id=",
            child.get("id"),
            "kids=",
            len(list(child)),
        )
        if local(child.tag) != "g":
            continue
        for i, g in enumerate(list(child)[:40]):
            tag = local(g.tag)
            imgs = len(g.xpath(".//svg:image", namespaces=NS))
            paths = len(g.xpath(".//svg:path", namespaces=NS))
            lines = len(g.xpath(".//svg:line", namespaces=NS))
            circ = len(g.xpath(".//svg:circle", namespaces=NS))
            print(
                f"  [{i}] {tag} id={g.get('id')} class={g.get('class')} "
                f"imgs={imgs} paths={paths} lines={lines} circ={circ}"
            )


for name in [
    "crono-detenidos-desk.svg",
    "crono-profugos-desk.svg",
    "crono-detenidos-mov.svg",
    "crono-profugos-mov.svg",
]:
    analyze(Path("src/assets/images") / name)
    print()
