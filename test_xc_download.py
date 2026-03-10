import requests

def test_download():
    url = "https://xeno-canto.org/1054123/download"
    try:
        r = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, stream=True, timeout=10)
        print("Status:", r.status_code)
        print("Type:", r.headers.get('Content-Type'))
        print("URL:", r.url)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test_download()
