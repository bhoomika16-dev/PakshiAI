import os
import re

updates = {
    "Cinnyris asiaticus": "1054123",
    "Pycnonotus cafer": "876447",
    "Eudynamys scolopaceus": "1071405",
    "Psilopogon haemacephalus": "964127",
    "Copsychus fulicatus": "979917"
}

def update_file():
    path = r'../frontend/src/utils/indianBirds.js'
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for sci, xcid in updates.items():
        # find the block with this scientific name and update its soundUrl
        pattern = r'(scientificName:\s*"' + sci + r'",.*?soundUrl:\s*)"([^"]+)"'
        new_url = f"https://xeno-canto.org/{xcid}/download"
        content = re.sub(pattern, r'\1"' + new_url + r'"', content, flags=re.DOTALL)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Updated", len(updates), "records.")

if __name__ == "__main__":
    update_file()
