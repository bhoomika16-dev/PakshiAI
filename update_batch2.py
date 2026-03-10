import os
import re

updates = {
    "Copsychus saularis": "1073327",
    "Acridotheres tristis": "942408",
    "Psittacula krameri": "1078743",
    "Merops orientalis": "881011",
    "Halcyon smyrnensis": "991849",
    "Bubulcus ibis": "1036890",
    "Upupa epops": "1083857",
    "Coracias benghalensis": "1059689",
    "Argya striata": "979545",
    "Psilopogon zeylanicus": "808586"
}

def update_file():
    path = r'../frontend/src/utils/indianBirds.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for sci, xcid in updates.items():
        pattern = r'(scientificName:\s*"' + sci + r'",.*?soundUrl:\s*)"([^"]+)"'
        new_url = f"https://xeno-canto.org/{xcid}/download"
        content = re.sub(pattern, r'\1"' + new_url + r'"', content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated", len(updates), "records for batch 2.")

if __name__ == "__main__":
    update_file()
