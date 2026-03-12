import requests
import re

def test_scrape():
    url = "https://xeno-canto.org/explore?query=Cinnyris+asiaticus+q:A"
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}, timeout=10)
        print("Status:", r.status_code)
        
        # Look for the data-xc-id attribute or links to recorded IDs
        ids = list(set(re.findall(r'data-xc-id="(\d+)"', r.text)))
        print("Found data-xc-id:", ids)
        
        if not ids:
            ids2 = list(set(re.findall(r'/(\d+)/download', r.text)))
            print("Found /download IDs:", ids2)
            
        if not ids and not ids2:
            print("Response start:")
            print(r.text[:500])
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_scrape()
