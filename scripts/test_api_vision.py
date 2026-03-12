import requests
import os
import json

def test_api():
    url = 'http://localhost:8000/api/predict-image'
    img_path = r'C:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\archive (1)\training_set\training_set\Indian Peacock\1.jpg'
    
    if not os.path.exists(img_path):
        print(f"File not found: {img_path}")
        # Try to find another one
        base = r'C:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\archive (1)\training_set\training_set'
        dirs = os.listdir(base)
        for d in dirs:
            subdir = os.path.join(base, d)
            if os.path.isdir(subdir):
                files = os.listdir(subdir)
                if files:
                    img_path = os.path.join(subdir, files[0])
                    print(f"Using alternate: {img_path}")
                    break

    try:
        with open(img_path, 'rb') as f:
            files = {'file': (os.path.basename(img_path), f, 'image/jpeg')}
            r = requests.post(url, files=files)
            print(f"Status: {r.status_code}")
            print(f"Response Body: {json.dumps(r.json(), indent=2)}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_api()
