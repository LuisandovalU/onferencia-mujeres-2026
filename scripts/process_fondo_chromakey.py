"""
process_fondo_chromakey.py
Elimina el fondo verde oscuro sólido y deja las hojas con transparencia.
"""
from pathlib import Path
from PIL import Image
import numpy as np

INPUT  = Path("/Users/luisalbertosandovalramos/Downloads/fondo.jpeg")
OUTPUT = Path("src/assets/fondo.webp")

def hex_to_rgb(h: str):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

# Color del fondo a eliminar (verde oscuro dominante)
BG_COLOR = np.array([38, 80, 34], dtype=np.float32)   # aprox #265022
TOLERANCE = 52   # mayor = más agresivo

def main():
    print(f"▶ Cargando: {INPUT}")
    img = Image.open(INPUT).convert("RGBA")
    data = np.array(img, dtype=np.float32)

    rgb   = data[:, :, :3]
    alpha = data[:, :, 3]

    # Distancia euclidiana de cada píxel al color de fondo
    diff = np.linalg.norm(rgb - BG_COLOR, axis=2)

    # Máscara: píxeles cercanos al fondo → transparentes
    mask_bg  = diff < TOLERANCE
    # Zona de transición suave (anti-alias)
    mask_soft = (diff >= TOLERANCE) & (diff < TOLERANCE + 30)

    alpha[mask_bg] = 0
    # Degradado suave en bordes
    alpha[mask_soft] = ((diff[mask_soft] - TOLERANCE) / 30 * 255).clip(0, 255)

    data[:, :, 3] = alpha
    result = Image.fromarray(data.astype(np.uint8), "RGBA")

    # Escalar (máx 1400px)
    max_w = 1400
    if result.width > max_w:
        ratio = max_w / result.width
        result = result.resize((max_w, int(result.height * ratio)), Image.LANCZOS)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    result.save(OUTPUT, "webp", quality=88, method=6)
    kb = OUTPUT.stat().st_size // 1024
    print(f"✅ Guardado: {OUTPUT}  ({kb} KB)  tamaño: {result.size}")

if __name__ == "__main__":
    main()
