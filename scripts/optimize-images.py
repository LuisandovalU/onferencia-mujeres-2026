import os
from PIL import Image

def optimize_images(directory):
    for filename in os.listdir(directory):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            file_path = os.path.join(directory, filename)
            name, _ = os.path.splitext(filename)
            output_path = os.path.join(directory, f"{name}.webp")
            
            try:
                print(f"Processing: {filename}")
                with Image.open(file_path) as img:
                    # Convert to RGBA for transparency support
                    img = img.convert('RGBA')
                    
                    # If it's one of the lettering files or has a 'letters' hint, remove white background
                    # We also apply this to PNGs with 'brave' or 'valiente' in the name
                    if any(x in name.lower() for x in ['brave', 'valiente', 'letters']):
                        print(f"Special processing: Removing white background from {filename}")
                        pixdata = img.load()
                        width, height = img.size
                        for y in range(height):
                            for x in range(width):
                                r, g, b, a = pixdata[x, y]
                                # If pixel is close to white, make it transparent
                                if r > 240 and g > 240 and b > 240:
                                    pixdata[x, y] = (r, g, b, 0)
                    
                    # Higher quality for typography assets
                    quality = 95 if any(x in name.lower() for x in ['brave', 'valiente']) else 80
                    
                    img.save(output_path, 'webp', quality=quality)
                    print(f"Optimized: {filename} -> {name}.webp")
                
                # Verify WebP exists before deleting original
                if os.path.exists(output_path):
                    os.remove(file_path)
                    print(f"Deleted original: {filename}")
            except Exception as e:
                print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    assets_dir = "src/assets"
    if os.path.exists(assets_dir):
        optimize_images(assets_dir)
    else:
        print(f"Directory not found: {assets_dir}")
