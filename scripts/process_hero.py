"""
process_hero.py
1. Quita el fondo de Hero.png con rembg (IA)
2. Optimiza y convierte a WebP
3. Guarda el resultado en src/assets/hero.webp
"""
import sys
from pathlib import Path

from PIL import Image
import io

# Ajustar rutas
BASE_DIR = Path(__file__).parent.parent
INPUT    = Path("/Users/luisalbertosandovalramos/Desktop/H.jpeg")
OUTPUT   = BASE_DIR / "src/assets/hero.webp"

def main():
    if not INPUT.exists():
        print(f"❌ Error: No se encontró el archivo en {INPUT}")
        return

    print(f"▶ Cargando: {INPUT}")
    img_bytes = INPUT.read_bytes()

    print("▶ Procesando imagen (manteniendo el fondo)...")
    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
    print(f"  Tamaño original: {img.size}")

    # Optimización: Redimensionar si es masivo (máx 2000px ancho para Hero)
    max_w = 2000
    if img.width > max_w:
        ratio = max_w / img.width
        new_size = (max_w, int(img.height * ratio))
        img = img.resize(new_size, Image.LANCZOS)
        print(f"  Redimensionado a: {new_size}")

    # Asegurar que el directorio existe
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    
    print(f"▶ Guardando en formato WebP optimizado...")
    img.save(OUTPUT, "webp", quality=85, method=6)
    
    size_kb = OUTPUT.stat().st_size // 1024
    print(f"✅ ¡Listo! Guardado en: {OUTPUT} ({size_kb} KB)")

if __name__ == "__main__":
    main()
