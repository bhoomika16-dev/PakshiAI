import os
import json

# Load the frontend birds data (simplified for this check)
# In reality, I'll just check the folders on disk vs the labels

BASE_DIR = r"c:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\backend\static_assets\catalog\images"
folders = os.listdir(BASE_DIR)

# Species labels from acoustic_classes.json
classes = [
  "Asian Koel", "Brown-Headed Barbet", "Cattle Egret", "Common Myna", 
  "Common Rosefinch", "Common Tailorbird", "Coppersmith Barbet", 
  "Forest Wagtail", "Gray Wagtail", "Green Bee-eater", "Hoopoe", 
  "House Crow", "Indian Grey Hornbill", "Indian Peacock", "Indian Pitta", 
  "Indian Robin", "Indian Roller", "Jungle Babbler", "Northern Lapwing", 
  "Oriental Magpie-Robin", "Purple Sunbird", "Red-Wattled Lapwing", 
  "Red-vented Bulbul", "Rose-ringed Parakeet", "Ruddy Shelduck", 
  "Rufous Treepie", "Sarus Crane", "White Wagtail", 
  "White-Breasted Waterhen", "White-throated Kingfisher"
]

print(f"Checking {len(classes)} classes against folders...")
for c in classes:
    # Most folders match the class name, but some might differ
    # We need to know which ones differ to ensure indianBirds.js is correct
    found = False
    for f in folders:
        if f.lower() == c.lower():
            if f != c:
                print(f"CASE MISMATCH: Class '{c}' vs Folder '{f}'")
            found = True
            break
    if not found:
        print(f"MISSING FOLDER for class: '{c}'")

print("\nAll folders in directory:")
for f in folders:
    print(f"- {f}")
