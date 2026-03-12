from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Form, Query, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import uvicorn
import shutil
import os
import uuid
import json
import random
import requests
from datetime import datetime

from database import engine, Base, get_db
import models
from core.audio_processor import AudioProcessor
from core.context_engine import ContextEngine
from core.ml_engine import MLEngine
from core.vision_engine import VisionEngine
from PIL import Image

# Initialize Database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="PakshiAI Backend", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    print("PakshiAI: Initializing Neural Engines...")
    try:
        MLEngine._load_resources()
        VisionEngine._load_resources()
    except Exception as e:
        print(f"PakshiAI: Startup model loading failed: {e}")

# Configure CORS for Cloud Deployment
# Allow the frontend domain and localhost for dev
origins = [
    "https://pakshiai-frontend.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Keeping * for simplicity but ensuring it works
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
PROCESSED_DIR = "processed"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(PROCESSED_DIR, exist_ok=True)

# Mount Research Assets for Species Catalog (Optimized Inference Mode)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# New lightweight catalog assets
CATALOG_ASSETS_PATH = os.path.join(BASE_DIR, "static_assets", "catalog")
FALLBACK_IMAGES_PATH = os.path.join(BASE_DIR, "static_assets")

# Mount Images
if os.path.exists(os.path.join(CATALOG_ASSETS_PATH, "images")):
    app.mount("/api/assets/images", StaticFiles(directory=os.path.join(CATALOG_ASSETS_PATH, "images")), name="images")
    print(f"Mounted Optimized Catalog Images from: {os.path.join(CATALOG_ASSETS_PATH, 'images')}")
elif os.path.exists(FALLBACK_IMAGES_PATH):
    app.mount("/api/assets/images", StaticFiles(directory=FALLBACK_IMAGES_PATH), name="images")
    print(f"Mounted Fallback Images from: {FALLBACK_IMAGES_PATH}")

# Mount Audio
if os.path.exists(os.path.join(CATALOG_ASSETS_PATH, "audio")):
    app.mount("/api/assets/audio", StaticFiles(directory=os.path.join(CATALOG_ASSETS_PATH, "audio")), name="audio")
    print(f"Mounted Optimized Catalog Audio from: {os.path.join(CATALOG_ASSETS_PATH, 'audio')}")

@app.get("/")
def read_root():
    return {"message": "PakshiAI Intelligence Engine Operational", "status": "active"}

@app.post("/api/predict")
async def analyze_recording(
    file: UploadFile = File(...),
    latitude: float = Form(None),
    longitude: float = Form(None),
    habitat: str = Form(None),
    segment_start: float = Form(None),
    segment_end: float = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # 1. Validate File
        if file.content_type and not file.content_type.startswith("audio/"):
             raise HTTPException(status_code=400, detail="Invalid file type. Only audio files are allowed.")
        
        # 2. Save Raw File
        file_id = str(uuid.uuid4())
        ext = file.filename.split(".")[-1]
        raw_path = os.path.join(UPLOAD_DIR, f"{file_id}.{ext}")
        
        with open(raw_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 3. Audio Standardization (Preprocessing)
        processed_path = os.path.join(PROCESSED_DIR, f"{file_id}_proc.wav")
        audio_meta = AudioProcessor.standardize_audio(raw_path, processed_path)
        
        # 4. Feature Extraction
        features = AudioProcessor.extract_features(processed_path)
        
        # 5. ML Inference
        print(f"ML Core: Initiating acoustic inference for {file_id}...")
        raw_predictions = MLEngine.predict(features)
        print(f"ML Core: Inference complete. Extracted {len(raw_predictions)} candidates.")
        
        # 6. Contextual Adjustment
        adjusted_predictions = []
        for pred in raw_predictions:
            score = pred.get('confidence', 0)
            reason = pred.get('context_reasoning', "No major context shift.")
            
            # Skip adjustment for Inconclusive results
            if pred.get('species_id') != 0:
                # Simple simulation: boost if habitat matches
                if habitat and habitat.lower() in str(pred.get('scientific_name', '')).lower():
                     score = min(0.99, score * 1.1)
                     reason = f"Context Correlation: Habitat matches documented avian range."
            
            pred['adjusted_score'] = score
            pred['context_reasoning'] = reason
            adjusted_predictions.append(pred)
            
        final_predictions = sorted(adjusted_predictions, key=lambda x: x['adjusted_score'], reverse=True)
        
        # 7. Save to DB
        db_recording = models.Recording(
            user_id=1, 
            file_path=raw_path,
            processed_path=processed_path,
            latitude=latitude,
            longitude=longitude,
            habitat=habitat,
            duration_seconds=audio_meta.get('duration'),
            sample_rate=audio_meta.get('sample_rate'),
            num_channels=audio_meta.get('channels')
        )
        db.add(db_recording)
        db.commit()
        db.refresh(db_recording)
        
        # Add segment info to metadata if provided
        if segment_start is not None:
            audio_meta['segment_start'] = segment_start
            audio_meta['segment_end'] = segment_end

        return {
            "status": "success",
            "recording_id": db_recording.id,
            "predictions": final_predictions,
            "visualization": {
                "spectrogram": features.get('mel_spectrogram'),
                "spectral_centroid": features.get('spectral_centroid')
            },
            "metadata": audio_meta
        }
    except Exception as e:
        print(f"Error processing recording: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict-image")
async def analyze_image(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    print(f"Vision API: Received request for file {file.filename}, type {file.content_type}")
    try:
        if file.content_type and not file.content_type.startswith("image/"):
             raise HTTPException(status_code=400, detail="Invalid file type. Only image files are allowed.")
        
        file_id = str(uuid.uuid4())
        ext = file.filename.split(".")[-1]
        img_path = os.path.join(UPLOAD_DIR, f"img_{file_id}.{ext}")
        
        with open(img_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Neural Vision Inference
        print(f"Vision Core: Initiating neural scan for {file_id}...")
        predictions = VisionEngine.predict(img_path)
        print(f"Vision Core: Scan complete. Confidence mapping successful.")
        
        # Metadata Extraction
        with Image.open(img_path) as img:
            resolution = f"{img.width}x{img.height}"
            format_name = img.format
            
        # Enforce the same format as acoustic for AnalysisResult compatibility
        for pred in predictions:
            pred['adjusted_score'] = pred['confidence']
            
        return {
            "status": "success",
            "recording_id": f"VIS-{file_id[:8]}", # Shared UI expects an ID
            "predictions": predictions,
            "metadata": {
                "type": "visual",
                "resolution": resolution,
                "format": format_name
            }
        }

    except Exception as e:
        print(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import StreamingResponse, RedirectResponse

@app.get("/api/proxy/audio")
async def proxy_audio(request: Request, url: str = Query(...)):
    """
    Resolves Xeno-canto download redirects and forwards the browser to the exact MP3 link.
    This avoids chunked transfer-encoding issues and allows native 206 Partial Range playing.
    """
    try:
        if not url.startswith("https://xeno-canto.org/") and not url.startswith("http://xeno-canto.org/"):
            raise HTTPException(status_code=400, detail="Only Xeno-canto URLs are allowed.")
            
        try:
            response = requests.head(url, allow_redirects=True, timeout=10)
            final_url = response.url
            if final_url == url:
                # If head didn't redirect, try get (some systems require GET for redirect)
                response = requests.get(url, stream=True, allow_redirects=True, timeout=10)
                final_url = response.url
                response.close()
                
            return RedirectResponse(url=final_url, status_code=302)
        except requests.exceptions.HTTPError as he:
            raise HTTPException(status_code=he.response.status_code, detail="Audio file not found at source.")
        except Exception as e:
            raise HTTPException(status_code=502, detail="Failed to reach audio source.")
            
    except HTTPException:
        raise
    except Exception as e:
        print(f"Proxy internal error: {e}")
        raise HTTPException(status_code=500, detail="Internal proxy failure")

@app.get("/api/stats")
def get_biodiversity_stats(db: Session = Depends(get_db)):
    # Simulate dynamic data based on current day
    seed = datetime.now().day
    random.seed(seed)
    
    return {
        "species_distribution": [
            {"name": "Indian Peafowl", "count": random.randint(140, 200)},
            {"name": "House Crow", "count": random.randint(110, 150)},
            {"name": "Purple Sunbird", "count": random.randint(80, 120)},
            {"name": "Asian Koel", "count": random.randint(60, 100)},
            {"name": "Red-vented Bulbul", "count": random.randint(50, 90)},
        ],
        "activity_trend": [
            {"time": f"{h:02d}:00", "detections": int(random.randint(10, 150) * (1.5 if 5 <= h <= 9 or 17 <= h <= 19 else 0.5))}
            for h in range(0, 24, 2)
        ],
        "top_regions": [
            {"region": "Western Ghats", "species_count": random.randint(400, 500)},
            {"region": "Himalayan Foothills", "species_count": random.randint(300, 400)},
            {"region": "Sundarbans", "species_count": random.randint(150, 250)},
            {"region": "Western Desert", "species_count": random.randint(80, 150)},
            {"region": "Northeast Hills", "species_count": random.randint(200, 350)},
        ]
    }

@app.get("/api/health")
async def health_check():
    """
    Diagnostic endpoint to verify ML model readiness and system health.
    """
    base_path = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(base_path, 'models')
    
    diagnostic_models = {}
    for model_file in ["acoustic_model.pth", "acoustic_classes.json", "vision_model.pth", "vision_classes.json"]:
        p = os.path.join(models_dir, model_file)
        exists = os.path.exists(p)
        size = os.path.getsize(p) if exists else 0
        diagnostic_models[model_file] = {
            "exists": exists,
            "size_kb": size // 1024,
            "is_lfs_pointer": size < 1000 and exists # Pointers are usually < 1KB
        }

    acoustic_status = "Loaded" if MLEngine._model is not None else "Not Loaded"
    vision_status = "Loaded" if VisionEngine._model is not None else "Not Loaded"
    
    # Check if we have write access to uploads
    try:
        test_file = os.path.join(UPLOAD_DIR, "health_test.txt")
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        storage_status = "Writable"
    except Exception as e:
        storage_status = f"Error: {str(e)}"

    return {
        "status": "online",
        "engines": {
            "acoustic": acoustic_status,
            "vision": vision_status
        },
        "model_files": diagnostic_models,
        "storage": storage_status,
        "environment": {
            "upload_dir": os.path.abspath(UPLOAD_DIR),
            "catalog_assets": os.path.join(BASE_DIR, "static_assets", "catalog"),
            "models_dir": os.path.abspath(models_dir)
        }
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)

