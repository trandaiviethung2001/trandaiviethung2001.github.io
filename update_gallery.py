"""
Script tự động quét thư mục assets/gallery và cập nhật file assets/gallery/gallery.json
Cách dùng: Chạy `python update_gallery.py` mỗi khi thêm hoặc xóa ảnh trong assets/gallery
"""
import os
import json
import re

GALLERY_DIR = os.path.join("assets", "gallery")
JSON_PATH = os.path.join(GALLERY_DIR, "gallery.json")
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp"}

def clean_name(filename):
    name_without_ext = os.path.splitext(filename)[0]
    # Thay dấu gạch dưới, gạch ngang thành khoảng trắng
    clean = re.sub(r"[-_]+", " ", name_without_ext)
    # Viết hoa chữ cái đầu mỗi từ
    return clean.strip().title()

def main():
    if not os.path.exists(GALLERY_DIR):
        os.makedirs(GALLERY_DIR)

    existing_data = []
    existing_map = {}
    if os.path.exists(JSON_PATH):
        try:
            with open(JSON_PATH, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
                for item in existing_data:
                    if isinstance(item, dict) and "file" in item:
                        existing_map[item["file"]] = item.get("name")
                    elif isinstance(item, str):
                        existing_map[item] = clean_name(item)
        except Exception as e:
            print(f"Lỗi đọc {JSON_PATH}: {e}")

    files = [f for f in sorted(os.listdir(GALLERY_DIR)) if os.path.splitext(f)[1].lower() in IMAGE_EXTS]

    result = []
    added = 0
    for filename in files:
        name = existing_map.get(filename, clean_name(filename))
        if filename not in existing_map:
            added += 1
        result.append({
            "file": filename,
            "name": name
        })

    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Updated {JSON_PATH} successfully!")
    print(f"Total: {len(result)} images (New: {added}).")

if __name__ == "__main__":
    main()
