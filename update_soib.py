import pandas as pd
import json
import os

def process_soib():
    try:
        # Read the Excel file (named .csv)
        df = pd.read_excel('State of Indias Birds - Essentials.csv')
        
        # Select key columns for the UI
        # 'English Name', 'Scientific Name', 'IUCN Category', 'Long-term Trend', 'Current Annual Trend', 'SoIB 2023 Priority History'
        # Note: some columns might have slightly different names if I misread the sample
        
        # Let's clean up column names just in case
        df.columns = [c.strip() for c in df.columns]
        
        essential_data = []
        for _, row in df.iterrows():
            item = {
                "name": str(row.get('English Name', row.get('Common Name (India Checklist)', 'Unknown'))),
                "scientific": str(row.get('Scientific Name', 'N/A')),
                "iucn": str(row.get('IUCN Category', row.get('IUCN Status History', 'N/A'))),
                "priority": str(row.get('High Conservation Priority', 'N/A')),
                "longTrend": str(row.get('Long-term Trend', 'N/A')),
                "currentTrend": str(row.get('Current Annual Trend', 'N/A')),
                "diet": str(row.get('Dietary Guild', 'N/A')),
                "endemic": str(row.get('Indian Endemic', 'No'))
            }
            essential_data.append(item)
            
        # Save to frontend public folder so it can be fetched or imported
        output_path = 'frontend/src/utils/soib_essentials.json'
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(essential_data, f, indent=4)
            
        print(f"Successfully processed {len(essential_data)} records to {output_path}")
        
        # Also update indianBirds.js
        update_indian_birds(essential_data)

    except Exception as e:
        print(f"Error processing SOIB: {e}")

def update_indian_birds(essential_data):
    js_path = 'frontend/src/utils/indianBirds.js'
    if not os.path.exists(js_path):
        return
        
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Map by name
    lookup = {d['name'].lower().strip(): d for d in essential_data}
    
    import re
    
    def bird_replacer(match):
        bird_block = match.group(0)
        # Extract name
        name_match = re.search(r'commonName:\s*"(.*?)"', bird_block)
        if name_match:
            name = name_match.group(1).lower().strip()
            if name in lookup:
                data = lookup[name]
                # Add/Update fields
                # Remove existing ones if they exist to avoid duplicates
                bird_block = re.sub(r'conservationStatus:\s*".*?"', f'conservationStatus: "{data["iucn"]}"', bird_block)
                
                # Add new fields if not present
                new_fields = []
                if 'soibPriority:' not in bird_block:
                    new_fields.append(f'soibPriority: "{data["priority"]}"')
                if 'longTermTrend:' not in bird_block:
                    new_fields.append(f'longTermTrend: "{data["longTrend"]}"')
                
                if new_fields:
                    # Insert before the last closing brace
                    bird_block = bird_block.rstrip().rstrip(',')
                    # Find last index of }
                    last_brace = bird_block.rfind('}')
                    bird_block = bird_block[:last_brace] + ", " + ", ".join(new_fields) + " " + bird_block[last_brace:]
                    
        return bird_block

    # Improved pattern to match full bird objects
    new_content = re.sub(r'\{\s*id:.*?\n\s*\},', bird_replacer, content, flags=re.DOTALL)
    
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Updated indianBirds.js with SOIB metrics.")

if __name__ == "__main__":
    process_soib()
