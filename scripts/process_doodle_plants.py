import os
from PIL import Image

def process_image(src_path, dest_path):
    print(f"Propulsando: {src_path} -> {dest_path}")
    img = Image.open(src_path).convert("RGBA")
    
    # Obtener datos de píxeles
    datas = img.getdata()

    newData = []
    for item in datas:
        # Misión Alpha: Detectar grises (RGB similares) y claros (> 180)
        # Esto elimina las franjas de fondo que no son blanco puro
        r, g, b = item[0], item[1], item[2]
        is_grey = abs(r - g) < 15 and abs(g - b) < 15
        if is_grey and r > 180:
            newData.append((0, 0, 0, 0))
        else:
            # Mantener el píxel original pero asegurar que sea RGBA
            newData.append(item)

    img.putdata(newData)
    
    # Asegurar directorio de destino
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    # Exportación WebP Ultra-Optimista (Quality 80, Method 6)
    img.save(dest_path, "WEBP", quality=80, method=6)
    print(f"Completado: {dest_path}")

if __name__ == "__main__":
    # Ubicación absoluta de origen proporcionada por el usuario (Corregida)
    base_src = "/Users/luisalbertosandovalramos/Downloads/Plantas"
    # Ubicación de destino en el proyecto Astro
    base_dest = os.path.join(os.getcwd(), "public", "plantas")
    
    files_processed = 0
    for i in range(1, 4):
        # Intentamos con .jpeg (que es lo que encontramos en el sistema)
        src = os.path.join(base_src, f"version{i}.jpeg")
        dest = os.path.join(base_dest, f"version{i}.webp")
        
        if os.path.exists(src):
            process_image(src, dest)
            files_processed += 1
        else:
            # Fallback a .jpg por si acaso
            src_alt = os.path.join(base_src, f"version{i}.jpg")
            if os.path.exists(src_alt):
                process_image(src_alt, dest)
                files_processed += 1
            else:
                print(f"Advertencia: No se encontró la imagen version{i} en {base_src}")

    if files_processed == 0:
        print("ERROR: No se procesó ninguna imagen. Verifica las rutas.")
