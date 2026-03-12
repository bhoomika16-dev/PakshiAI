import requests
import io

# Download a small test MP3
try:
    r = requests.get(
        'https://xeno-canto.org/sounds/uploaded/NXHTMHMNSS/XC991526-250403_2781-House-Crow-20250403-6.56am-Andaman-Zone-Hotel-area-xeno.mp3',
        timeout=15,
        allow_redirects=True
    )
    audio_data = r.content
    print(f'Downloaded audio: {len(audio_data)} bytes')
    
    # POST to the analysis endpoint
    files = {'file': ('crow.mp3', io.BytesIO(audio_data), 'audio/mpeg')}
    data = {'habitat': 'urban', 'latitude': '28.6', 'longitude': '77.2'}
    
    result = requests.post('http://127.0.0.1:8000/api/predict', files=files, data=data, timeout=60)
    print('Status Code:', result.status_code)
    if result.status_code == 200:
        d = result.json()
        print('TOP PREDICTIONS:')
        preds = d.get('predictions', [])
        for p in preds[:3]:
            name = p.get('common_name', 'Unknown')
            conf = round(p.get('confidence', 0) * 100, 1)
            print(f'  {name} - {conf}%')
    else:
        print('Error response:', result.text[:500])
except Exception as e:
    print(f'Test failed: {e}')
