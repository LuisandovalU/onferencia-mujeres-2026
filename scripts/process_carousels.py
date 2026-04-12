import os
from PIL import Image, ImageFilter, ImageEnhance

def process_images_cinematic(src_dir, prefix, output_dir):
    """
    Processes portrait images for a landscape space using a cinematic letterbox-blur effect.
    The original image is centered, and a zoomed, blurred, and darkened version fills the background.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    if not os.path.exists(src_dir):
        print(f"Directory not found: {src_dir}")
        return
        
    files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    
    # Target size: 16:9 (using 1920x1080 as standard)
    target_w, target_h = 1920, 1080
    
    for i, filename in enumerate(files):
        src_path = os.path.join(src_dir, filename)
        output_name = f"{prefix}-carousel-{i+1}.webp"
        output_path = os.path.join(output_dir, output_name)
        
        try:
            print(f"Processing Cinematic: {filename} -> {output_name}")
            with Image.open(src_path) as img:
                img = img.convert("RGB")
                orig_w, orig_h = img.size
                
                # 1. Create the blurred background
                # We want the background to be a zoomed version that fills the 1920x1080 area
                # Calculate scale to fill width
                bg_scale = target_w / orig_w
                bg_w = target_w
                bg_h = int(orig_h * bg_scale)
                
                # If bg_h is still less than target_h, scale to height instead
                if bg_h < target_h:
                    bg_scale = target_h / orig_h
                    bg_h = target_h
                    bg_w = int(orig_w * bg_scale)
                
                background = img.resize((bg_w, bg_h), Image.LANCZOS)
                # Crop to target size from center
                bg_left = (bg_w - target_w) / 2
                bg_top = (bg_h - target_h) / 2
                background = background.crop((bg_left, bg_top, bg_left + target_w, bg_top + target_h))
                
                # Apply heavy blur
                background = background.filter(ImageFilter.GaussianBlur(radius=50))
                
                # Darken the background slightly for focus
                enhancer = ImageEnhance.Brightness(background)
                background = enhancer.enhance(0.6)
                
                # 2. Prepare the foreground image (the vertical original)
                # Scale foreground so it fits the height perfectly
                fg_scale = target_h / orig_h
                fg_h = target_h
                fg_w = int(orig_w * fg_scale)
                
                # If the foreground is still too wide (not likely for portrait, but for safety), scale to width
                if fg_w > target_w:
                    fg_scale = target_w / orig_w
                    fg_w = target_w
                    fg_h = int(orig_h * fg_scale)
                
                foreground = img.resize((fg_w, fg_h), Image.LANCZOS)
                
                # 3. Combine
                # Calculate paste position (centered)
                paste_x = (target_w - fg_w) // 2
                paste_y = (target_h - fg_h) // 2
                
                background.paste(foreground, (paste_x, paste_y))
                
                # Final save
                background.save(output_path, 'webp', quality=90)
                print(f"  Saved Cinematic: {output_path}")
                
        except Exception as e:
            print(f"  Error processing {filename}: {e}")

if __name__ == "__main__":
    BASE_SRC = "/Users/luisalbertosandovalramos/Downloads/fotos"
    BRAVE_SRC = os.path.join(BASE_SRC, "brave")
    VALIENTE_SRC = os.path.join(BASE_SRC, "valiente")
    DEST = "src/assets"
    
    print("🎬 Processing BRAVE images with Cinematic Effect...")
    process_images_cinematic(BRAVE_SRC, "brave", DEST)
    
    print("\n🎬 Processing VALIENTE images with Cinematic Effect...")
    process_images_cinematic(VALIENTE_SRC, "valiente", DEST)
