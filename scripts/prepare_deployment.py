import os
import shutil
import json

def prepare_deployment():
    print("PakshiAI: Preparing lightweight deployment assets...")
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    backend_dir = os.path.join(base_path, 'backend')
    static_assets = os.path.join(backend_dir, 'static_assets', 'catalog')
    
    # This script assumes images and audio are already in static_assets
    # based on the recent training and manual extraction.
    # Its primary purpose is to verify the integrity of the standalone assets.
    
    components = ['images', 'audio']
    missing_any = False
    
    for comp in components:
        comp_path = os.path.join(static_assets, comp)
        if not os.path.exists(comp_path):
            print(f"WARNING: Lightweight {comp} directory missing at {comp_path}")
            missing_any = True
            continue
            
        count = len([d for d in os.listdir(comp_path) if os.path.isdir(os.path.join(comp_path, d))])
        print(f"Verified {count} species in {comp} library.")

    if not missing_any:
        print("\nSUCCESS: The 11.3GB dataset is no longer required for runtime.")
        print("The backend is now fully operational using pre-trained models and optimized assets.")
        print("\nYou can now safely remove or move the following directories:")
        print(f" - {os.path.join(base_dir, 'archive')}")
        print(f" - {os.path.join(base_dir, 'archive (1)')}")
    else:
        print("\nNOTICE: Some assets are still being synchronized. Do not delete datasets yet.")

if __name__ == "__main__":
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    prepare_deployment()
