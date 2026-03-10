# PakshiAI - Ecological Intelligence Platform 🦜

PakshiAI is a research-grade platform for the acoustic and visual monitoring of Indian avifauna. It combines deep learning models with contextual ecological data (habitat, seasonality) to provide highly accurate species identification.

## 🚀 Unified Local Startup (Best Experience)

The project is now configured for a **single-command startup** on Windows. This will launch both the FastAPI backend and the React frontend simultaneously.

### Prerequisites
- **Node.js**: [Download here](https://nodejs.org/)
- **Python 3.10+**: Ensure it's in your PATH.
- **FFmpeg**: Required for audio processing (standardize recordings).

### Setup & Run
1. **Initialize Dependencies** (Run once in the root folder):
   ```powershell
   npm install
   ```

2. **Start the Application**:
   ```powershell
   npm run dev
   ```
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Backend API**: [http://localhost:8000](http://localhost:8000)

---

## 📁 Project Structure & Assets

### Folder Breakdown
- `/frontend`: React + Vite application (UI, Charts, Species Catalog).
- `/backend`: FastAPI server (Neural processing, Database, Asset mounting).
- `/archive` & `/archive (1)`: **Local-only** high-resolution audio and image libraries (11.3GB total).

### ⚠️ Important Note on Large Assets
GitHub has a **100MB file limit** and a **2GB repository limit**. Because your `archive` folders contain over 11.3GB of data, they are **excluded from Git** (`.gitignore`) to prevent your account from being flagged or the push from failing.

**To use the full catalog locally:**
1. Keep your `archive` and `archive (1)` folders in the root directory.
2. The backend is programmed to automatically detect and mount these folders to serve images/audio to the frontend.

---

## ☁️ Deployment Reference

This project is optimized for Split-Deployment:
- **Frontend**: Deploy the `frontend` folder to **Vercel**.
- **Backend**: Deploy the `backend` folder to **Render**.

*Note: In production, the app uses a lightweight fallback for images since the 11.3GB dataset is too large for free-tier hosting.*

## 🛠️ Diagnostics
If you encounter connection issues, check the browser console. The app will log `[PakshiAI] Initializing API client` with the current `baseURL` (linked to `VITE_API_BASE_URL` in production).

---
**License**: MIT - Conservation Technology Initiative
