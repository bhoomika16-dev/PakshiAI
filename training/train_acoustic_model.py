import os
import numpy as np
import librosa
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import json
import random

# The 31 Indian bird species exactly as defined in the frontend catalog
INDIAN_BIRD_CLASSES = [
    "Asian Koel",
    "Brown-Headed Barbet",
    "Cattle Egret",
    "Common Kingfisher",
    "Common Myna",
    "Common Rosefinch",
    "Common Tailorbird",
    "Coppersmith Barbet",
    "Forest Wagtail",
    "Gray Wagtail",
    "Green Bee-eater",
    "Hoopoe",
    "House Crow",
    "Indian Grey Hornbill",
    "Indian Peacock",
    "Indian Pitta",
    "Indian Robin",
    "Indian Roller",
    "Jungle Babbler",
    "Northern Lapwing",
    "Oriental Magpie-Robin",
    "Purple Sunbird",
    "Red-Wattled Lapwing",
    "Red-vented Bulbul",
    "Rose-ringed Parakeet",
    "Ruddy Shelduck",
    "Rufous Treepie",
    "Sarus Crane",
    "White Wagtail",
    "White-Breasted Waterhen",
    "White-throated Kingfisher",
]

SAMPLE_RATE = 22050
DURATION = 5  # seconds


def augment_audio(y, sr):
    """Generate augmented variations of a single audio clip."""
    samples = [y]  # include original

    # Time stretch
    try:
        rate = random.uniform(0.85, 1.15)
        stretched = librosa.effects.time_stretch(y, rate=rate)
        samples.append(stretched)
    except Exception:
        pass

    # Pitch shift
    try:
        steps = random.uniform(-2, 2)
        pitched = librosa.effects.pitch_shift(y, sr=sr, n_steps=steps)
        samples.append(pitched)
    except Exception:
        pass

    # Add Gaussian noise
    noise_strength = random.uniform(0.001, 0.005)
    noisy = y + noise_strength * np.random.randn(len(y))
    samples.append(noisy.astype(np.float32))

    # Reverse short clip (simulates different call direction)
    samples.append(y[::-1].copy())

    return samples


def load_and_preprocess(file_path, sr=SAMPLE_RATE, duration=DURATION):
    """Load audio, pad/truncate, and extract mel spectrogram."""
    y, _ = librosa.load(file_path, duration=duration, sr=sr)
    target_len = duration * sr
    if len(y) < target_len:
        y = np.pad(y, (0, target_len - len(y)))
    else:
        y = y[:target_len]
    spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
    spec_db = librosa.power_to_db(spec, ref=np.max)
    spec_db = (spec_db + 80) / 80  # normalize to [0, 1]
    return spec_db.astype(np.float32)


class AugmentedBirdDataset(Dataset):
    def __init__(self, data_dir, classes, augment=True):
        self.data_dir = data_dir
        self.classes = classes
        self.items = []  # (spectrogram, label)

        valid_classes = []
        for idx, cls in enumerate(classes):
            cls_dir = os.path.join(data_dir, cls)
            if not os.path.isdir(cls_dir):
                print(f"  [SKIP] No directory for: {cls}")
                continue

            audio_files = [
                f for f in os.listdir(cls_dir)
                if f.lower().endswith(('.mp3', '.wav', '.ogg', '.flac'))
            ]

            if not audio_files:
                print(f"  [SKIP] No audio files for: {cls}")
                continue

            valid_classes.append(cls)
            for fname in audio_files:
                fpath = os.path.join(cls_dir, fname)
                try:
                    y, sr = librosa.load(fpath, duration=DURATION, sr=SAMPLE_RATE)
                    target_len = DURATION * SAMPLE_RATE
                    if len(y) < target_len:
                        y = np.pad(y, (0, target_len - len(y)))
                    else:
                        y = y[:target_len]

                    variants = augment_audio(y, SAMPLE_RATE) if augment else [y]

                    for variant in variants:
                        try:
                            if len(variant) < target_len:
                                variant = np.pad(variant, (0, target_len - len(variant)))
                            variant = variant[:target_len]
                            spec = librosa.feature.melspectrogram(y=variant, sr=SAMPLE_RATE, n_mels=128)
                            spec_db = librosa.power_to_db(spec, ref=np.max)
                            spec_db = (spec_db + 80) / 80
                            self.items.append((spec_db.astype(np.float32), idx))
                        except Exception as e:
                            print(f"  Warning augmenting {fname}: {e}")

                except Exception as e:
                    print(f"  Error loading {fpath}: {e}")

        # Rebuild label indices based on valid classes only
        # Map class name -> final index
        valid_idx_map = {cls: i for i, cls in enumerate(valid_classes)}
        print(f"\nFounding dataset: {len(valid_classes)}/{len(classes)} species loaded, {len(self.items)} total samples (with augmentation).")
        
        # Re-index labels
        remapped = []
        for spec, orig_idx in self.items:
            cls_name = classes[orig_idx]
            if cls_name in valid_idx_map:
                remapped.append((spec, valid_idx_map[cls_name]))
        self.items = remapped
        self.valid_classes = valid_classes

    def __len__(self):
        return len(self.items)

    def __getitem__(self, idx):
        spec, label = self.items[idx]
        return torch.FloatTensor(spec).unsqueeze(0), label


class AcousticNet(nn.Module):
    def __init__(self, num_classes):
        super(AcousticNet, self).__init__()
        self.conv = nn.Sequential(
            nn.Conv2d(1, 16, kernel_size=3, padding=1),
            nn.BatchNorm2d(16),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, kernel_size=3, padding=1),
            nn.BatchNorm2d(32),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(32, 64, kernel_size=3, padding=1),
            nn.BatchNorm2d(64),
            nn.ReLU(),
            nn.AdaptiveMaxPool2d((8, 8))
        )
        self.fc = nn.Sequential(
            nn.Linear(64 * 8 * 8, 256),
            nn.ReLU(),
            nn.Dropout(0.4),
            nn.Linear(256, num_classes)
        )

    def forward(self, x):
        x = self.conv(x)
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        return x


def train_acoustic():
    print("=" * 60)
    print("PakshiAI — Indian Bird Species Acoustic Training Pipeline")
    print("=" * 60)

    # Data directory: catalog audio with 1 sample per species
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'static_assets', 'catalog', 'audio')
    data_dir = os.path.normpath(data_dir)
    save_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), '..', 'backend', 'models'))
    os.makedirs(save_dir, exist_ok=True)

    if not os.path.exists(data_dir):
        print(f"CRITICAL ERROR: Audio dataset not found at {data_dir}")
        return

    print(f"Data directory  : {data_dir}")
    print(f"Save directory  : {save_dir}")
    print(f"Target classes  : {len(INDIAN_BIRD_CLASSES)}")
    print()

    dataset = AugmentedBirdDataset(data_dir, INDIAN_BIRD_CLASSES, augment=True)

    if len(dataset) == 0:
        print("CRITICAL ERROR: No training samples found. Aborting.")
        return

    valid_classes = dataset.valid_classes
    print(f"\nFinal classes for training ({len(valid_classes)}): {valid_classes}")

    # Save class mapping
    with open(os.path.join(save_dir, 'acoustic_classes.json'), 'w') as f:
        json.dump(valid_classes, f, indent=2)
    print(f"Class mapping saved: {len(valid_classes)} species.")

    loader = DataLoader(dataset, batch_size=8, shuffle=True, num_workers=0)

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training device : {device}")

    model = AcousticNet(len(valid_classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=10, gamma=0.5)

    NUM_EPOCHS = 30
    print(f"\nTraining for {NUM_EPOCHS} epochs...")
    print("-" * 40)

    best_loss = float('inf')
    for epoch in range(NUM_EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0

        for inputs, labels in loader:
            inputs = inputs.to(device)
            labels = torch.tensor(labels, dtype=torch.long).to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()

        scheduler.step()
        epoch_loss = running_loss / len(loader)
        accuracy = 100 * correct / total if total > 0 else 0
        print(f"Epoch {epoch+1:3d}/{NUM_EPOCHS} | Loss: {epoch_loss:.4f} | Accuracy: {accuracy:.1f}%")

        if epoch_loss < best_loss:
            best_loss = epoch_loss
            torch.save(model.state_dict(), os.path.join(save_dir, 'acoustic_model.pth'))

    print(f"\nBest model saved to {os.path.join(save_dir, 'acoustic_model.pth')}")
    print(f"Acoustic classes saved to {os.path.join(save_dir, 'acoustic_classes.json')}")
    print("\nTraining complete!")


if __name__ == "__main__":
    train_acoustic()
