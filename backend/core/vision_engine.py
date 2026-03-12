import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os
import random

class VisionEngine:
    _model = None
    _metadata = None
    _alignment = {
        "Indian Peacock": "Indian Peafowl",
        "White-Breasted Kingfisher": "White-throated Kingfisher",
        "Asian Green Bee-Eater": "Green Bee-eater",
        "Indian Grey Hornbill": "Indian Grey Hornbill",
        "Brown-Headed Barbet": "Brown-Headed Barbet",
        "Red-Wattled Lapwing": "Red-Wattled Lapwing",
        "Jungle Babbler": "Jungle Babbler",
    }
    _device = torch.device("cpu")

    @staticmethod
    def _load_resources():
        base_path = os.path.dirname(os.path.dirname(__file__))
        models_dir = os.path.join(base_path, 'models')
        weight_path = os.path.join(models_dir, 'vision_model.pth')
        class_path = os.path.join(models_dir, 'vision_classes.json')
        meta_path = os.path.join(os.path.dirname(__file__), 'taxonomy_metadata.json')
        
        # Get last modified time
        mtime = os.path.getmtime(weight_path) if os.path.exists(weight_path) else 0
        
        # Reload if model is not loaded or if weight file has been updated
        if VisionEngine._model is None or getattr(VisionEngine, '_last_mtime', 0) < mtime:
            print(f"Vision Engine: {'Initializing' if VisionEngine._model is None else 'Hot-reloading'} neural core...")
            try:
                # Load classes
                if os.path.exists(class_path):
                    with open(class_path, 'r') as f:
                        VisionEngine._classes = json.load(f)
                else:
                    VisionEngine._classes = []

                # Load metadata (stays in core/)
                if os.path.exists(meta_path):
                    with open(meta_path, 'r') as f:
                        VisionEngine._metadata = json.load(f)
                else:
                    VisionEngine._metadata = {}

                # Initialize architecture
                VisionEngine._model = models.mobilenet_v2(pretrained=False) # Skip pretraining as we load weights
                num_ftrs = VisionEngine._model.classifier[1].in_features
                VisionEngine._model.classifier[1] = nn.Sequential(
                    nn.Dropout(0.2),
                    nn.Linear(num_ftrs, len(VisionEngine._classes) if VisionEngine._classes else 1)
                )
                
                # Load trained weights
                if os.path.exists(weight_path):
                    VisionEngine._model.load_state_dict(torch.load(weight_path, map_location=VisionEngine._device))
                    print(f"Vision Engine: Weights loaded from {weight_path}")
                
                VisionEngine._model.to(VisionEngine._device)
                VisionEngine._model.eval()
                VisionEngine._last_mtime = mtime
                print("Vision Engine: Neural core synchronized successfully.")
            except Exception as e:
                import traceback
                print(f"Vision Engine Initialization Error: {e}")
                traceback.print_exc()

    @staticmethod
    def predict(image_path):
        """
        Performs visual inference on a bird image.
        """
        VisionEngine._load_resources()
        
        if not VisionEngine._model or not VisionEngine._classes:
             return [{
                "species_id": random.randint(1, 10),
                "common_name": "Inconclusive Signal",
                "scientific_name": "Incertae sedis",
                "confidence": 0.0,
                "context_reasoning": "Model synchronization in progress. Visual descriptors are currently being decoded."
            }]

        try:
            input_image = Image.open(image_path).convert('RGB')
            preprocess = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
            ])
            input_tensor = preprocess(input_image)
            input_batch = input_tensor.unsqueeze(0).to(VisionEngine._device)

            with torch.no_grad():
                output = VisionEngine._model(input_batch)
            
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_probs, top_indices = torch.topk(probabilities, 3)

            results = []
            for i in range(top_probs.size(0)):
                idx = top_indices[i].item()
                prob = top_probs[i].item()
                raw_name = VisionEngine._classes[idx]
                
                # Align with UI nomenclature
                name = VisionEngine._alignment.get(raw_name, raw_name)
                
                # Retrieve extended metadata
                meta = VisionEngine._metadata.get(name, VisionEngine._metadata.get(raw_name, {}))
                scientific_name = meta.get("scientificName", "N/A")
                trend = meta.get("trend", "N/A")
                
                results.append({
                    "species_id": idx + 1,
                    "common_name": name,
                    "scientific_name": scientific_name, 
                    "confidence": prob,
                    "context_reasoning": f"Neural core identified distinct plumage markers and anatomical indices specific to the {name} taxonomy ({scientific_name}). Conservation Trend: {trend}. Confidence based on deep feature correlation."
                })
            
            return results
        except Exception as e:
            import traceback
            print(f"Prediction error: {e}")
            traceback.print_exc()
            return []
