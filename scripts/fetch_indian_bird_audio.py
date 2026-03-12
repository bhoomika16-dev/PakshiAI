import os
import requests
import json
import re
from urllib.parse import unquote

def fetch_audio():
    print("PakshiAI: Initiating high-fidelity audio acquisition for 31 Indian bird species...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    birds_js_path = os.path.join(base_dir, 'frontend', 'src', 'utils', 'indianBirds.js')
    audio_dest_root = os.path.join(base_dir, 'backend', 'static_assets', 'catalog', 'audio')
    os.makedirs(audio_dest_root, exist_ok=True)
    
    if not os.path.exists(birds_js_path):
        print(f"ERROR: Catalog not found at {birds_js_path}")
        return

    # Extract commonName and soundUrl from JS file using regex
    with open(birds_js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # regex for commonName: "commonName": "..."
    # regex for soundUrl: "soundUrl": "..."
    # Using a simple state-based logic or regex to pair them
    
    species_data = []
    # Find all objects in the array
    # Very basic parsing since it's a fixed-format JS file
    common_names = re.findall(r'commonName:\s*"([^"]+)"', content)
    sound_urls = re.findall(r'soundUrl:\s*"([^"]+)"', content)
    
    if len(common_names) != len(sound_urls):
        print(f"WARNING: Mismatch in counts. Names: {len(common_names)}, URLs: {len(sound_urls)}")
        # Try a more robust regex if names/URLs count mismatch
    
    limit = min(len(common_names), len(sound_urls))
    for i in range(limit):
        species_data.append({
            "name": common_names[i],
            "url": sound_urls[i]
        })

    print(f"Targeting {len(species_data)} species for download.")

    for bird in species_data:
        name = bird["name"]
        url = bird["url"]
        
        # Create species-specific folder
        bird_dir = os.path.join(audio_dest_root, name)
        os.makedirs(bird_dir, exist_ok=True)
        
        # Check if already exists
        dest_filename = f"{name.replace(' ', '_')}_sample.mp3"
        dest_path = os.path.join(bird_dir, dest_filename)
        
        if os.path.exists(dest_path):
            print(f"Skipping {name} (already exists).")
            continue
            
        print(f"Downloading {name} from {url}...")
        try:
            # Add User-Agent to avoid blocking
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
            response = requests.get(url, headers=headers, timeout=30)
            if response.status_code == 200:
                with open(dest_path, 'wb') as f:
                    f.write(response.content)
                print(f"Successfully acquired {name}.")
            else:
                print(f"FAILED to acquire {name} (Status: {response.status_code})")
        except Exception as e:
            print(f"ERROR downloading {name}: {e}")

    print("\nAudio acquisition complete. Dataset ready for specialized training.")

if __name__ == "__main__":
    fetch_audio()
