# PakshiAI - Ecological Intelligence Platform 🦜

PakshiAI is a research-grade platform for the acoustic and visual monitoring of Indian avifauna. It uses a high-performance **Machine Learning Architecture** where training and inference are strictly separated, allowing for efficient local deployment and real-time identification.

## 💻 Local Setup & Execution

Follow these steps to get PakshiAI running on your local machine.

### 1. Prerequisites
- **Python 3.10+**: For the Neural Inference API.
- **Node.js 18+**: For the React/Vite Frontend.
- **FFmpeg**: (Required for Audio Hub) To process spectral signatures.
  - *Windows*: `choco install ffmpeg` or download from [ffmpeg.org](https://ffmpeg.org).

### 2. Initial Configuration
One-time setup for the frontend environment:
```bash
cd frontend
cp .env.example .env
```

### 3. Start the Application (Recommended)
We provide an automated launcher for Windows users:  
👉 **Double-click `start_local.bat`** in the project root.

This will automatically:
- Install any missing Python dependencies.
- Install Node.js dependencies.
- Launch the **Backend API** (FastAPI) on [http://localhost:8000](http://localhost:8000).
- Launch the **Frontend UI** (Vite) on [http://localhost:5173](http://localhost:5173).

### 4. Manual Startup
If you prefer manual control:
- **Backend**: `cd backend && pip install -r ../requirements.txt && uvicorn app:app --reload`
- **Frontend**: `cd frontend && npm install && npm run dev`

---

## 📁 Project Features
- **Acoustic Hub**: Neural spectral analysis for bird call identification.
- **Visual ID**: Computer vision engine for plumage and anatomical marker decoding.
- **Species Catalog**: A consolidated database of 31 Indian bird species with ecological context.
- **Stand-alone Inference**: No need for the original 11GB dataset; uses optimized `.pth` weights.

## 🛠 Project Structure
- `/backend/core`: Production inference engines (Acoustic & Vision).
- `/backend/models`: Serialized model weights and taxonomy mappings.
- `/frontend/src`: React application with TailwindCSS and Framer Motion.
- `/scripts`: Utility scripts for data fetching and deployment prep.

---
**License**: MIT - Conservation Technology Initiative
