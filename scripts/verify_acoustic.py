"""
PakshiAI - Acoustic Model Verification Script
Tests the /api/predict endpoint with multiple downloaded species samples
to confirm the model returns diverse, species-specific predictions.
"""
import os
import sys
import requests

BASE_URL = "http://localhost:8000"
AUDIO_DIR = os.path.join(os.path.dirname(__file__), '..', 'backend', 'static_assets', 'catalog', 'audio')

# Species to test, in order
TEST_SPECIES = [
    "Asian Koel",
    "Indian Peacock",
    "Common Myna",
    "Red-vented Bulbul",
    "Hoopoe",
]

def test_acoustic(species_name):
    species_audio_dir = os.path.join(AUDIO_DIR, species_name)
    if not os.path.isdir(species_audio_dir):
        print(f"  [SKIP] No folder for: {species_name}")
        return

    audio_files = [f for f in os.listdir(species_audio_dir) if f.endswith('.mp3') or f.endswith('.wav')]
    if not audio_files:
        print(f"  [SKIP] No audio file in folder: {species_name}")
        return

    audio_path = os.path.join(species_audio_dir, audio_files[0])
    print(f"\nTesting: {species_name}")
    print(f"  File: {audio_files[0]}")

    try:
        with open(audio_path, 'rb') as f:
            response = requests.post(
                f"{BASE_URL}/api/predict",
                files={"file": (audio_files[0], f, "audio/mpeg")},
                timeout=30
            )

        if response.status_code == 200:
            data = response.json()
            predictions = data.get('predictions', [])
            print(f"  Status: OK")
            print(f"  Top Predictions:")
            for p in predictions[:3]:
                conf = p.get('confidence', 0) or p.get('adjusted_score', 0)
                print(f"    - {p.get('common_name', 'N/A')}: {conf*100:.1f}%")
        else:
            print(f"  Status: {response.status_code}")
            print(f"  Error: {response.text[:200]}")
    except Exception as e:
        print(f"  ERROR: {e}")

if __name__ == "__main__":
    print("=" * 55)
    print("PakshiAI — Acoustic Identification Verification")
    print("=" * 55)

    # Check server is up
    try:
        r = requests.get(BASE_URL + "/", timeout=5)
        print(f"Backend status: {r.status_code} OK")
    except Exception as e:
        print(f"Backend unreachable: {e}")
        sys.exit(1)

    for species in TEST_SPECIES:
        test_acoustic(species)

    print("\n" + "=" * 55)
    print("Verification complete.")
