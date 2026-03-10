import os
import numpy as np
import librosa
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
import json

class BirdAudioDataset(Dataset):
    def __init__(self, data_dir, classes, max_files_per_class=10):
        self.data_dir = data_dir
        self.classes = classes
        self.files = []
        self.labels = []
        
        for idx, cls in enumerate(classes):
            cls_dir = os.path.join(data_dir, cls)
            if not os.path.isdir(cls_dir):
                continue
            
            all_files = [f for f in os.listdir(cls_dir) if f.endswith('.mp3')]
            all_files = all_files[:max_files_per_class]
            
            for f in all_files:
                self.files.append(os.path.join(cls_dir, f))
                self.labels.append(idx)
        
        print(f"Acoustic Dataset: {len(self.files)} files across {len(classes)} classes.")

    def __len__(self):
        return len(self.files)

    def __getitem__(self, idx):
        file_path = self.files[idx]
        label = self.labels[idx]
        
        try:
            # Load audio (first 5 seconds)
            y, sr = librosa.load(file_path, duration=5, sr=22050)
            if len(y) < 5 * 22050:
                y = np.pad(y, (0, 5 * 22050 - len(y)))
            
            # Extract Mel Spectrogram
            spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
            spec_db = librosa.power_to_db(spec, ref=np.max)
            
            # Normalize
            spec_db = (spec_db + 80) / 80
            
            # Add channel dimension
            spec_tensor = torch.FloatTensor(spec_db).unsqueeze(0)
            return spec_tensor, label
        except Exception as e:
            print(f"Error loading {file_path}: {e}")
            # Return a zero tensor if error
            return torch.zeros((1, 128, 216)), label

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

def train_acoustic():
    print("Initiating Acoustic Intelligence Training Pipeline...")
    data_dir = r"c:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\archive\Voice of Birds\Voice of Birds"
    
    if not os.path.exists(data_dir):
        print(f"CRITICAL ERROR: Acoustic dataset not found at {data_dir}")
        return

    classes = sorted([d for d in os.listdir(data_dir) if os.path.isdir(os.path.join(data_dir, d))])
    # Limit to top 20 classes for quick demonstration/training
    classes = classes[:50]
    
    os.makedirs('backend/core', exist_ok=True)
    with open('backend/core/acoustic_classes.json', 'w') as f:
        json.dump(classes, f)

    dataset = BirdAudioDataset(data_dir, classes, max_files_per_class=5)
    loader = DataLoader(dataset, batch_size=16, shuffle=True)

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = AcousticNet(len(classes)).to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print("Commencing Sonar Feature Learning...")
    num_epochs = 5
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        for inputs, labels in loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        print(f"Epoch {epoch+1} | Loss: {running_loss/len(loader):.4f}")

    torch.save(model.state_dict(), 'backend/core/acoustic_model.pth')
    print("Acoustic Model Weights Synchronized to backend/core/acoustic_model.pth")

if __name__ == "__main__":
    train_acoustic()
