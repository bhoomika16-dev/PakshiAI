# PakshiAI - API Reference

## Base URL
`http://localhost:8000`

## Endpoints

### 1. Ingest Recording (POST `/api/predict`)

**Purpose**: Submit an audio file for bird species identification.

**Headers**:
- `Content-Type`: `multipart/form-data`

**Body**:
- `file` (File, required): Audio file (WAV, MP3, OGG).
- `latitude` (Float, optional): -90 to 90.
- `longitude` (Float, optional): -180 to 180.
- `habitat` (String, optional): "forest", "wetland", "urban", "coastal".

**Response (Success)**:
```json
{
  "status": "success",
  "recording_id": 12,
  "predictions": [
    {
      "species_id": 1,
      "common_name": "Indian Peafowl",
      "scientific_name": "Pavo cristatus",
      "confidence": 0.85,
      "adjusted_score": 0.92,
      "context_reasoning": "Context Boost: Forest habitat strongly associated with Peafowl.",
      "call_type": "call"
    },
    ...
  ],
  "visualization": {
    "spectrogram": [[-70.5, ...], ...],
    "spectral_centroid": [1200.5, ...]
  },
  "metadata": {
    "duration": 5.4,
    "sample_rate": 32000,
    "channels": 1,
    "processed_path": "uploads/UUID_proc.wav"
  }
}
```

**Errors**:
- `400 Bad Request`: Invalid file format or missing required data.
- `500 Internal Server Error`: Processing failure.

---

### 2. Get Biodiversity Statistics (GET `/api/stats`)

**Purpose**: Retrieve aggregated data for the dashboard.

**Response**:
```json
{
  "species_distribution": [
    {"name": "Indian Peafowl", "count": 145},
    ...
  ],
  "activity_trend": [
    {"time": "06:00", "detections": 45},
    ...
  ],
  "top_regions": [
    {"region": "Western Ghats", "species_count": 450},
    ...
  ]
}
```

---

### 3. Check System Status (GET `/`)

**Response**:
```json
{
  "message": "PakshiAI Intelligence Engine Operational",
  "status": "active"
}
```
