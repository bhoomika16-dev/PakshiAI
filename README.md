# PakshiAI - Ecological Intelligence Platform 🦜

PakshiAI is a research-grade platform for the acoustic and visual monitoring of Indian avifauna. It uses a high-performance **Machine Learning Architecture** where training and inference are strictly separated, allowing for efficient deployment and real-time identification.

## 🚀 Optimized Workflow

The project is designed to run efficiently without needing the original 11GB dataset at runtime.

### 1. Training (Development Only)
If you have access to the full dataset (`archive` folders), you can train the models:
```bash
# Train Acoustic Model
python training/train_acoustic_model.py
# Train Visual Model
python training/train_visual_model.py
```
This generates `.pth` weights and `.json` class maps in `backend/models/`.

### 2. Asset Preparation
Extract a minimal subset of assets for the Bird Catalog:
```bash
python scripts/prepare_deployment.py
```

### 3. Setup & Run (Localhost)

For the best experience, use the automated start script:

1. **Launch Automated Environment**:
   Double-click `start_local.bat` in the project root. This will:
   - Start the FastAPI Backend on [http://localhost:8000](http://localhost:8000)
   - Install Frontend dependencies and start the Vite server on [http://localhost:5173](http://localhost:5173)

2. **Manual Startup**:
   If you prefer manual control:
   - **Backend**: `cd backend && uvicorn app:app --reload`
   - **Frontend**: `cd frontend && npm install && npm run dev`

- **Visual ID**: http://localhost:5173/visual-id
- **Acoustic Hub**: http://localhost:5173/acoustic-hub
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

- `/training`: Offline training pipeline for Neural Cores.
- `/backend/core`: Production inference engines (Acoustic & Vision).
- `/backend/models`: Serialized model weights and taxonomy mappings.
- `/backend/static_assets/catalog`: High-performance subset of media for the Species Catalog.

## ⚠️ Data & Privacy
The 11.3GB raw dataset is **excluded from Git** to maintain performance. The backend operates purely as an **Inference Service** using pre-trained models. For production deployments, ensure the `backend/models` folder is included in your build.

---
**License**: MIT - Conservation Technology Initiative
