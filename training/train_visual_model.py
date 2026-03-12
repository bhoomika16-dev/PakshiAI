import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, random_split
from torchvision import datasets, models, transforms
import os
import time
import json

def train_model():
    print("Initiating Production-Grade Visual Intelligence Training...")
    # Data directory (dataset should be here for training)
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'archive (1)', 'training_set', 'training_set')
    
    if not os.path.exists(data_dir):
        # Fallback to absolute path provided in original script
        data_dir = r"C:\Users\Bhoomikha\.gemini\antigravity\scratch\PakshiAI\archive (1)\training_set\training_set"

    if not os.path.exists(data_dir):
        print(f"CRITICAL ERROR: High-resolution dataset not found at {data_dir}")
        return

    # Advanced Data Augmentation for robust field identification
    train_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    val_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    # Loading and splitting the dataset
    full_dataset = datasets.ImageFolder(data_dir)
    train_size = int(0.8 * len(full_dataset))
    val_size = len(full_dataset) - train_size
    train_data, val_data = random_split(full_dataset, [train_size, val_size])
    
    # Apply transforms
    train_data.dataset.transform = train_transforms
    val_data.dataset.transform = val_transforms

    class_names = full_dataset.classes
    print(f"Neural Map Synchronized: {len(class_names)} avian classes identified.")
    print(f"Dataset Split: {train_size} training samples, {val_size} validation samples.")

    # Data Loaders
    batch_size = 32
    train_loader = DataLoader(train_data, batch_size=batch_size, shuffle=True, num_workers=2)
    val_loader = DataLoader(val_data, batch_size=batch_size, shuffle=False, num_workers=2)

    # Save class names for inference layer
    save_dir = os.path.join(os.path.dirname(__file__), '..', 'backend', 'models')
    os.makedirs(save_dir, exist_ok=True)
    
    with open(os.path.join(save_dir, 'vision_classes.json'), 'w') as f:
        json.dump(class_names, f)

    # High-Performance MobileNetV2 Architecture
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training Environment: {device}")
    
    model = models.mobilenet_v2(pretrained=True)
    
    # Deep Fine-Tuning: Unfreeze the last convolutional blocks (Stage 4)
    # Stage 4 starts around layer 14 in MobileNetV2.features
    for param in model.parameters():
        param.requires_grad = False
    
    # Unfreeze block 14 to 18
    for layer in model.features[14:]:
        for param in layer.parameters():
            param.requires_grad = True
        
    # Reconstruct classification head
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Sequential(
        nn.Dropout(0.2),
        nn.Linear(num_ftrs, len(class_names))
    )
    
    model = model.to(device)
    
    # Optimization Parameters
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam([
        {'params': model.features[14:].parameters(), 'lr': 1e-4},
        {'params': model.classifier.parameters(), 'lr': 1e-3}
    ])
    
    num_epochs = 10
    best_acc = 0.0

    print("Commencing Deep Learning fine-tuning sequence...")
    for epoch in range(num_epochs):
        # Training Phase
        model.train()
        running_loss = 0.0
        running_corrects = 0
        
        # Limit batches to avoid excessive local execution time while ensuring convergence
        max_train_batches = 100 
        
        for batch_idx, (inputs, labels) in enumerate(train_loader):
            if batch_idx >= max_train_batches:
                break
                
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            with torch.set_grad_enabled(True):
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()
                
            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)
            
            if (batch_idx + 1) % 20 == 0:
                print(f"Epoch {epoch+1} | Batch {batch_idx+1}/{max_train_batches} | Loss: {loss.item():.4f}")

        epoch_loss = running_loss / (max_train_batches * batch_size)
        epoch_acc = running_corrects.double() / (max_train_batches * batch_size)
        
        # Validation Phase
        model.eval()
        val_corrects = 0
        max_val_batches = 30
        
        with torch.no_grad():
            for v_idx, (inputs, labels) in enumerate(val_loader):
                if v_idx >= max_val_batches:
                    break
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                _, preds = torch.max(outputs, 1)
                val_corrects += torch.sum(preds == labels.data)

        val_acc = val_corrects.double() / (max_val_batches * batch_size)
        print(f'Epoch {epoch+1}/{num_epochs} | Train Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f} | Val Acc: {val_acc:.4f}')
        
        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), os.path.join(save_dir, 'vision_model.pth'))
            print(f"--> Improved Accuracy. Checkpoint saved.")

    print(f"Training Complete. Best Validation Accuracy: {best_acc:.4f}")
    print(f"Final Neural weights synchronized to {os.path.join(save_dir, 'vision_model.pth')}")

if __name__ == "__main__":
    train_model()
