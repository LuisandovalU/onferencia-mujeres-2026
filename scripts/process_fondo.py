"""
process_fondo.py
1. Quita el fondo de fondo.jpeg con rembg (IA)
2. Optimiza y convierte a WebP
3. Guarda el resultado en src/assets/fondo.webp
"""
import sys
from pathlib import Path
from rembg import remove
from PIL import Image
import io

INPUT  = Path("/Users/luisalbertosandovalramos/Downloads/fondo.jpeg")
OUTPUT = Path("src/assets/fondo.webp")

def main():
    print(f"▶ Cargando: {INPUT}")
    img_bytes = INPUT.read_bytes()

    print("▶ Eliminando fondo con rembg (IA)…")
    result_bytes = remove(img_bytes)

    img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
    print(f"  Tamaño original: {img.size}")

    # Escalar si es muy grande (máx 1400px ancho)
    max_w = 1400
    if img.width > max_w:
        ratio = max_w / img.width
        new_size = (max_w, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        print(f"  Redimensionado a: {new_size}")

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUTPUT, "webp", quality=85, method=6)
    size_kb = OUTPUT.stat().st_size // 1024
    print(f"✅ Guardado: {OUTPUT}  ({size_kb} KB)")

if __name__ == "__main__":
    main()
