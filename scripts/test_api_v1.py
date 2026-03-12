import requests

def test_sourcing():
    # Test Purple Sunbird (Cinnyris asiaticus)
    query = "Cinnyris%20asiaticus"
    url = f"https://xeno-canto.org/api/2/recordings?query={query}"
    print(f"Querying: {url}")
    r = requests.get(url, timeout=10)
    data = r.json()
    recs = data.get('recordings', [])
    print(f"Found {len(recs)} recordings.")
    if recs:
        for rec in recs[:5]:
            f_url = rec.get('file')
            if f_url.startswith('//'): f_url = 'https:' + f_url
            print(f"  ID {rec.get('id')}: {f_url}")
            try:
                chk = requests.get(f_url, stream=True, timeout=5, headers={'User-Agent': 'Mozilla/5.0'})
                print(f"    Status: {chk.status_code}, Type: {chk.headers.get('Content-Type')}")
            except Exception as e:
                print(f"    Error: {e}")

if __name__ == "__main__":
    test_sourcing()
