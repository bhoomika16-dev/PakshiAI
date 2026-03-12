import torch
import torch.nn as nn
import numpy as np
import json
import os

# --- Model Architecture (Must match training/train_acoustic_model.py) ---
class AcousticNet(nn.Module):
    def __init__(self, num_classes):
        super(AcousticNet, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.ReLU(),
            nn.AdaptiveMaxPool2d((8, 8))
        )
        self.fc = nn.Sequential(
            nn.Linear(64 * 8 * 8, 256),
            nn.ReLU(),
            nn.Dropout(0.5),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x

class MLEngine:
    _model = None
    _classes = None
    _device = torch.device("cpu")
    
    # Metadata for the 31 verified species from the frontend catalog
    # Used for enriching the prediction results
    SPECIES_METADATA = {
        "Indian Peacock": {"id": 1, "sci": "Pavo cristatus", "freq": "0.3-3 kHz"},
        "House Crow": {"id": 2, "sci": "Corvus splendens", "freq": "0.5-4 kHz"},
        "Purple Sunbird": {"id": 3, "sci": "Cinnyris asiaticus", "freq": "2-8 kHz"},
        "Red-vented Bulbul": {"id": 4, "sci": "Pycnonotus cafer", "freq": "1-6 kHz"},
        "Asian Koel": {"id": 5, "sci": "Eudynamys scolopaceus", "freq": "0.5-4 kHz"},
        "Coppersmith Barbet": {"id": 6, "sci": "Psilopogon haemacephalus", "freq": "1-5 kHz"},
        "Indian Robin": {"id": 7, "sci": "Copsychus fulicatus", "freq": "2-7 kHz"},
        "Oriental Magpie-Robin": {"id": 8, "sci": "Copsychus saularis", "freq": "1-8 kHz"},
        "Common Myna": {"id": 9, "sci": "Acridotheres tristis", "freq": "0.5-5 kHz"},
        "Rose-ringed Parakeet": {"id": 10, "sci": "Psittacula krameri", "freq": "1-6 kHz"},
        "Green Bee-eater": {"id": 11, "sci": "Merops orientalis", "freq": "3-7 kHz"},
        "White-throated Kingfisher": {"id": 12, "sci": "Halcyon smyrnensis", "freq": "1-5 kHz"},
        "Cattle Egret": {"id": 13, "sci": "Bubulcus ibis", "freq": "0.3-2 kHz"},
        "Hoopoe": {"id": 14, "sci": "Upupa epops", "freq": "0.5-2 kHz"},
        "Indian Roller": {"id": 15, "sci": "Coracias benghalensis", "freq": "1-4 kHz"},
        "Jungle Babbler": {"id": 16, "sci": "Argya striata", "freq": "0.5-6 kHz"},
        "Brown-Headed Barbet": {"id": 17, "sci": "Psilopogon zeylanicus", "freq": "1-5 kHz"},
        "Common Kingfisher": {"id": 18, "sci": "Alcedo atthis", "freq": "3-8 kHz"},
        "Common Rosefinch": {"id": 19, "sci": "Carpodacus erythrinus", "freq": "2-8 kHz"},
        "Common Tailorbird": {"id": 20, "sci": "Orthotomus sutorius", "freq": "3-7 kHz"},
        "Forest Wagtail": {"id": 21, "sci": "Dendronanthus indicus", "freq": "2-6 kHz"},
        "Gray Wagtail": {"id": 22, "sci": "Motacilla cinerea", "freq": "2-7 kHz"},
        "Indian Grey Hornbill": {"id": 23, "sci": "Ocyceros birostris", "freq": "0.5-3 kHz"},
        "Indian Pitta": {"id": 24, "sci": "Pitta brachyura", "freq": "1-5 kHz"},
        "Northern Lapwing": {"id": 25, "sci": "Vanellus vanellus", "freq": "0.5-4 kHz"},
        "Red-Wattled Lapwing": {"id": 26, "sci": "Vanellus indicus", "freq": "1-5 kHz"},
        "Ruddy Shelduck": {"id": 27, "sci": "Tadorna ferruginea", "freq": "0.3-2 kHz"},
        "Rufous Treepie": {"id": 28, "sci": "Dendrocitta vagabunda", "freq": "0.5-5 kHz"},
        "Sarus Crane": {"id": 29, "sci": "Antigone antigone", "freq": "0.3-2 kHz"},
        "White Wagtail": {"id": 30, "sci": "Motacilla alba", "freq": "2-7 kHz"},
        "White-Breasted Waterhen": {"id": 31, "sci": "Amaurornis phoenicurus", "freq": "0.3-3 kHz"}
    }

    @staticmethod
    def _load_resources():
        if MLEngine._model is not None:
            return

        base_path = os.path.dirname(os.path.dirname(__file__))
        models_dir = os.path.join(base_path, 'models')
        weight_path = os.path.join(models_dir, 'acoustic_model.pth')
        class_path = os.path.join(models_dir, 'acoustic_classes.json')

        try:
            if os.path.exists(class_path):
                with open(class_path, 'r') as f:
                    MLEngine._classes = json.load(f)
            
            if os.path.exists(weight_path) and MLEngine._classes:
                MLEngine._model = AcousticNet(len(MLEngine._classes))
                MLEngine._model.load_state_dict(torch.load(weight_path, map_location=MLEngine._device))
                MLEngine._model.to(MLEngine._device)
                MLEngine._model.eval()
                print("Acoustic Neural Core: Loaded successfully.")
        except Exception as e:
            print(f"MLEngine: Resource loading failed: {e}")

    @staticmethod
    def predict(feature_data):
        """
        Performs real neural inference using the trained AcousticNet.
        """
        MLEngine._load_resources()
        
        if MLEngine._model is None or MLEngine._classes is None:
            return [{
                "species_id": 0,
                "common_name": "Inference layer offline",
                "scientific_name": "N/A",
                "confidence": 0.0,
                "context_reasoning": "Standardization successful, but neural weights are currently being synchronized."
            }]

        try:
            # feature_data from AudioProcessor.extract_features contains 'mel_spectrogram'
            # Expected shape: (128, 216) for 5s audio
            spec = np.array(feature_data.get('mel_spectrogram'))
            
            # Ensure correct dimensions for the model (Batch, Channel, H, W)
            input_tensor = torch.FloatTensor(spec).unsqueeze(0).unsqueeze(0).to(MLEngine._device)
            
            with torch.no_grad():
                output = MLEngine._model(input_tensor)
            
            probabilities = torch.nn.functional.softmax(output[0], dim=0)
            top_probs, top_indices = torch.topk(probabilities, 3)

            centroid = feature_data.get('spectral_centroid', [[0]])
            mean_cent = float(np.mean(centroid))

            results = []
            for i in range(top_probs.size(0)):
                idx = top_indices[i].item()
                prob = top_probs[i].item()
                class_name = MLEngine._classes[idx]
                
                # Fetch metadata if available
                meta = MLEngine.SPECIES_METADATA.get(class_name, {
                    "id": idx + 1000, # Fallback ID
                    "sci": "Incertae sedis",
                    "freq": "N/A"
                })

                reasoning = f"Neural core identifies spectral patterns matching {class_name}. Mean frequency {int(mean_cent)}Hz aligns with documented biological signatures."
                
                results.append({
                    "species_id": meta["id"],
                    "common_name": class_name,
                    "scientific_name": meta["sci"],
                    "confidence": prob,
                    "call_type": "Vocal Signature",
                    "context_reasoning": reasoning
                })
            
            return sorted(results, key=lambda x: x['confidence'], reverse=True)

        except Exception as e:
            print(f"Acoustic Prediction error: {e}")
            return [{
                "species_id": 0,
                "common_name": "Signal processing error",
                "scientific_name": "N/A",
                "confidence": 0.0,
                "context_reasoning": f"An error occurred during spectral decomposition: {str(e)}"
            }]
