import os
from PIL import Image

def process_images(src_dir, prefix, output_dir):
    # Ensure output dir exists
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    # Get sorted files
    if not os.path.exists(src_dir):
        print(f"Directory not found: {src_dir}")
        return
        
    files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    for i, filename in enumerate(files):
        src_path = os.path.join(src_dir, filename)
        output_name = f"{prefix}-carousel-{i+1}.webp"
        output_path = os.path.join(output_dir, output_name)
        
        try:
            print(f"Processing {filename} -> {output_name}")
            with Image.open(src_path) as img:
                # Convert to RGB
                if img.mode in ("RGBA", "P"):
                    img = img.convert("RGB")
                else:
                    img = img.convert("RGB")
                
                width, height = img.size
                
                # Target Aspect Ratio 16:9
                target_ratio = 16 / 9
                current_ratio = width / height
                
                if current_ratio > target_ratio:
                    # Too wide -> crop width
                    new_width = int(height * target_ratio)
                    offset = (width - new_width) / 2
                    img = img.crop((offset, 0, width - offset, height))
                else:
                    # Too tall (vertical 9:16) -> crop height
                    new_height = int(width / target_ratio)
                    offset = (height - new_height) / 2
                    img = img.crop((0, offset, width, height - offset))
                
                # Resize to max-width 1920
                if img.width > 1920:
                    new_h = int(1920 / (img.width/img.height))
                    img = img.resize((1920, new_h), Image.LANCZOS)
                
                img.save(output_path, 'webp', quality=85)
                print(f"  Saved: {output_path} (Size: {img.size})")
        except Exception as e:
            print(f"  Error processing {filename}: {e}")

if __name__ == "__main__":
    # Source paths (Verified lowercase 'fotos')
    BASE_SRC = "/Users/luisalbertosandovalramos/Downloads/fotos"
    BRAVE_SRC = os.path.join(BASE_SRC, "brave")
    VALIENTE_SRC = os.path.join(BASE_SRC, "valiente")
    
    # Destination
    DEST = "src/assets"
    
    print("Processing BRAVE images...")
    process_images(BRAVE_SRC, "brave", DEST)
    
    print("\nProcessing VALIENTE images...")
    process_images(VALIENTE_SRC, "valiente", DEST)
