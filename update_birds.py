import pandas as pd
import re
import json

# Read CSV
df = pd.read_csv('birds_data_full.csv')

# Create a mapping of Common Name -> Data
# We want: IUCN Status, Long-term Trend, Current Status, Distribution Status
lookup = {}
for _, row in df.iterrows():
    name = str(row['Common Name (India Checklist)']).lower().strip()
    lookup[name] = {
        "iucn": row['IUCN Status'],
        "trend": row['Long Term Status'],
        "currentStatus": row['Current Status'],
        "conservationConcern": row['Status of Conservation Concern']
    }

# Read the JS file
js_path = 'frontend/src/utils/indianBirds.js'
with open(js_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the array content
# This is a bit tricky with regex, but we can try to find each object
# and inject the new data.

def update_bird(match):
    bird_str = match.group(0)
    # Extract commonName
    name_match = re.search(r'commonName:\s*"(.*?)"', bird_str)
    if name_match:
        name = name_match.group(1).lower().strip()
        if name in lookup:
            data = lookup[name]
            # Add or update iucnStatus and trend
            # We'll just append them before the closing brace if not present
            # or try to replace conservationStatus
            new_status = data['iucn']
            trend = data['trend']
            
            # Replace conservationStatus if it exists
            bird_str = re.sub(r'conservationStatus:\s*".*?"', f'conservationStatus: "{new_status}"', bird_str)
            
            # Add trend if not present
            if 'trend:' not in bird_str:
                bird_str = bird_str.rstrip().rstrip(',')
                bird_str = re.sub(r'\},$', f', trend: "{trend}" }},', bird_str)
            else:
                 bird_str = re.sub(r'trend:\s*".*?"', f'trend: "{trend}"', bird_str)
                 
    return bird_str

# Match each bird object in the list
# Pattern matches from { to }, possibly spanning multiple lines
new_content = re.sub(r'\{\s*id:.*?\s*\},', update_bird, content, flags=re.DOTALL)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Updated indianBirds.js with real data.")
