import requests

def test_pattern():
    # Spectrogram was: sounds/uploaded/OOECIWCSWV/ffts/XC1030506-large.png
    # Predicted MP3: sounds/uploaded/OOECIWCSWV/XC1030506.mp3
    url = 'https://xeno-canto.org/sounds/uploaded/OOECIWCSWV/XC1030506.mp3'
    print(f"Testing: {url}")
    try:
        r = requests.get(url, stream=True, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('Content-Type')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_pattern()
