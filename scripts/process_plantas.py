import os
from pathlib import Path
from rembg import remove
from PIL import Image
import io

INPUT_DIR = Path("/Users/luisalbertosandovalramos/Downloads/plantas")
OUTPUT_DIR = Path("public/plantas")

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    for file_path in INPUT_DIR.glob("*.jpeg"):
        print(f"▶ Procesando: {file_path.name}")
        img_bytes = file_path.read_bytes()

        print("  Eliminando fondo con rembg (IA)…")
        try:
            result_bytes = remove(img_bytes)
            img = Image.open(io.BytesIO(result_bytes)).convert("RGBA")
            print(f"  Tamaño original: {img.size}")

            # Escalar si es muy grande (máx 1000px ancho)
            max_w = 1000
            if img.width > max_w:
                ratio = max_w / img.width
                new_size = (max_w, int(img.height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
                print(f"  Redimensionado a: {new_size}")

            # Guardar en WebP
            output_path = OUTPUT_DIR / f"{file_path.stem}.webp"
            img.save(output_path, "webp", quality=85, method=6)
            size_kb = output_path.stat().st_size // 1024
            print(f"✅ Guardado: {output_path}  ({size_kb} KB)")
        except Exception as e:
            print(f"❌ Error al procesar {file_path.name}: {e}")

if __name__ == "__main__":
    main()
