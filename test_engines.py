import os
import sys

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from core.vision_engine import VisionEngine
    from core.ml_engine import MLEngine
    
    print("--- Vision Engine Test ---")
    VisionEngine._load_resources()
    if VisionEngine._model:
        print("Vision Model Loaded successfully.")
        print(f"Classes: {len(VisionEngine._classes)}")
    else:
        print("Vision Model FAILED to load.")

    print("\n--- Acoustic Engine Test ---")
    MLEngine._load_resources()
    if MLEngine._model:
        print("Acoustic Model Loaded successfully.")
        print(f"Classes: {len(MLEngine._classes)}")
    else:
        print("Acoustic Model FAILED to load.")

except Exception as e:
    import traceback
    print(f"Error during engine test: {e}")
    traceback.print_exc()
