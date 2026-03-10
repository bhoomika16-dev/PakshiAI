import os

def update_indian_birds():
    file_path = r"c:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\frontend\src\utils\indianBirds.js"
    with open(file_path, "r") as f:
        content = f.read()

    # Mapping: (Common Name in JS, Folder Name, Sample Image)
    mappings = [
        ("Indian Peafowl", "Indian Peacock", "ML100366891.jpg"),
        ("House Crow", "House Crow", "ML100356141.jpg"),
        ("Coppersmith Barbet", "Coppersmith Barbet", "ML100312651.jpg"),
        ("Oriental Magpie-Robin", "Oriental Magpie-Robin", "ML102615511.jpg"),
        ("Common Myna", "Common Myna", "ML101876201.jpg"),
        ("Green Bee-eater", "Asian Green Bee-Eater", "ML100845971.jpg"),
        ("White-throated Kingfisher", "White-Breasted Kingfisher", "ML100151041.jpg"),
        ("Cattle Egret", "Cattle Egret", "ML102615511.jpg"),
        ("Hoopoe", "Hoopoe", "ML100106251.jpg"),
        ("Indian Roller", "Indian Roller", "ML101880891.jpg"),
        ("Jungle Babbler", "Jungle Babbler", "ML101450601.jpg"),
        ("Brown-Headed Barbet", "Brown-Headed Barbet", "ML101410271.jpg"),
        ("Common Kingfisher", "Common Kingfisher", "ML102292211.jpg"),
        ("Common Rosefinch", "Common Rosefinch", "ML101683671.jpg"),
        ("Common Tailorbird", "Common Tailorbird", "ML100767561.jpg"),
        ("Forest Wagtail", "Forest Wagtail", "ML100072911.jpg"),
        ("Gray Wagtail", "Gray Wagtail", "ML100275401.jpg"),
        ("Indian Grey Hornbill", "Indian Grey Hornbill", "ML100607991.jpg"),
        ("Indian Pitta", "Indian Pitta", "ML100080251.jpg"),
        ("Northern Lapwing", "Northern Lapwing", "ML102222881.jpg"),
        ("Red-Wattled Lapwing", "Red-Wattled Lapwing", "ML101449691.jpg"),
        ("Ruddy Shelduck", "Ruddy Shelduck", "ML102015981.jpg"),
        ("Rufous Treepie", "Rufous Treepie", "ML103677381.jpg"),
        ("Sarus Crane", "Sarus Crane", "ML103190291.jpg"),
        ("White Wagtail", "White Wagtail", "ML103013411.jpg"),
        ("White-Breasted Waterhen", "White-Breasted Waterhen", "ML100908141.jpg"),
    ]

    # First, restore the Indian Robin image if I messed it up
    content = content.replace('image: "http://localhost:8000/api/assets/images/Indian%20Grey%20Hornbill/ML100607991.jpg",', 'image: "https://cdn.pixabay.com/photo/2017/07/24/07/09/indian-robin-2533680_640.jpg",')
    
    # Process mappings
    for common_name, folder, sample in mappings:
        # Construct the local URL
        local_url = f'http://localhost:8000/api/assets/images/{folder.replace(" ", "%20")}/{sample}'
        
        # Look for the species block
        # We find commonName: "Name" and then find the NEXT image: "..."
        search_str = f'commonName: "{common_name}"'
        name_idx = content.find(search_str)
        if name_idx != -1:
            img_idx = content.find('image: "', name_idx)
            if img_idx != -1 and img_idx < content.find('}', name_idx):
                end_quote = content.find('"', img_idx + 8)
                old_img = content[img_idx:end_quote+1]
                new_img = f'image: "{local_url}"'
                content = content[:img_idx] + new_img + content[end_quote+1:]
                print(f"Updated {common_name}")

    with open(file_path, "w") as f:
        f.write(content)

if __name__ == "__main__":
    update_indian_birds()
