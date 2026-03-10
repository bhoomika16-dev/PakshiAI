# PakshiAI - Ecological Intelligence Platform

## Overview
PakshiAI is a research-grade, production-ready web application designed for the acoustic monitoring and classification of Indian avifauna. It leverages hybrid deep learning models, context-aware reasoning (seasonality, habitat), and interactive visualizations to provide a robust tool for researchers, conservationists, and bird enthusiasts.

## Key Capabilities
- **Acoustic Intelligence**: Standardizes audio, extracts Mel Spectrograms/MFCCs, and identifies species with confidence scores.
- **Context Awareness**: Adjusts predictions based on geographic location, date (migration patterns), and habitat type.
- **Interactive Visualization**: Real-time spectrogram rendering and detailed analysis reports.
- **Biodiversity Analytics**: Aggregated dashboards showing species distribution and activity trends.
- **Secure & Scalable**: REST API built with FastAPI, PostgreSQL/SQLite support, and React frontend.

## Technology Stack
- **Frontend**: React, main, TailwindCSS, Recharts, Lucide Icons
- **Backend**: FastAPI, Uvicorn, SQLAlchemy
- **AI/ML Core**: Librosa (Audio Processing), Scikit-learn (Context logic), PyTorch (Inference - Mocked for demo)
- **Database**: SQLite (Dev) / PostgreSQL (Prod)

## Quick Start

### Prerequisites
- Node.js v18+
- Python 3.10+
- FFmpeg (for audio processing)

### Installation

1. **Clone & Setup Backend**
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app:app --reload
```

2. **Setup Frontend**
```bash
cd frontend
npm install
npm run dev
```

3. **Access Application**
Navigate to `http://localhost:5173`.

## Documentation
- [System Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API_TO_BE_GENERATED.md)

## License
MIT License - Conservation Technology Initiative
