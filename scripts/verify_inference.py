import torch
import numpy as np
import os
import sys

# Add project root to path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

from backend.core.ml_engine import MLEngine
from backend.core.vision_engine import VisionEngine

def verify_inference():
    print("PakshiAI: Verifying Inference Engines...")
    
    # 1. Verify Acoustic Engine
    print("\n--- Acoustic Inference Test ---")
    mock_features = {
        "mel_spectrogram": np.random.rand(128, 216).tolist(),
        "spectral_centroid": [[1500] * 100]
    }
    
    try:
        results = MLEngine.predict(mock_features)
        print(f"Top prediction: {results[0]['common_name']} ({results[0]['confidence']:.2f})")
        print("Acoustic Engine OK.")
    except Exception as e:
        print(f"Acoustic Engine FAILED: {e}")

    # 2. Verify Vision Engine
    print("\n--- Visual Inference Test ---")
    # We need a dummy image file
    dummy_img = "backend/static_assets/logo.png" # Assuming this exists or using any existing image
    if not os.path.exists(dummy_img):
        # Create a tiny dummy image if logo doesn't exist
        from PIL import Image
        img = Image.new('RGB', (224, 224), color = (73, 109, 137))
        img.save('dummy_test.jpg')
        dummy_img = 'dummy_test.jpg'

    try:
        results = VisionEngine.predict(dummy_img)
        if results:
            print(f"Top prediction: {results[0]['common_name']} ({results[0]['confidence']:.2f})")
            print("Vision Engine OK.")
        else:
            print("Vision Engine returned no results (Expected if no models loaded yet).")
    except Exception as e:
        print(f"Vision Engine FAILED: {e}")
        
    if os.path.exists('dummy_test.jpg'):
        os.remove('dummy_test.jpg')

if __name__ == "__main__":
    verify_inference()
