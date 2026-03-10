import os
import re

updates = {
    "Carpodacus erythrinus": "1054636",
    "Orthotomus sutorius": "950021",
    "Dendronanthus indicus": "838777",
    "Motacilla cinerea": "1083126",
    "Ocyceros birostris": "585628",
    "Pitta brachyura": "648161",
    "Vanellus vanellus": "1023873",
    "Vanellus indicus": "1073292",
    "Tadorna ferruginea": "1045752",
    "Dendrocitta vagabunda": "980123",
    "Antigone antigone": "954263",
    "Motacilla alba": "990630",
    "Amaurornis phoenicurus": "1031057"
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
    print("Updated", len(updates), "records for batch 3.")

if __name__ == "__main__":
    update_file()
