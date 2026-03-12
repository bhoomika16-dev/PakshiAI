import streamlit as st
import os
import sys
import torch
import numpy as np
from PIL import Image
import tempfile
import json

# Force-inject backend directory into system path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(current_dir, 'backend')
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Standard imports from the injected core/utils modules
from core.ml_engine import MLEngine
from core.vision_engine import VisionEngine
from core.audio_processor import AudioProcessor
from core.context_engine import ContextEngine
from utils.indian_birds import indian_birds

# --- Page Configuration ---
st.set_page_config(
    page_title="PakshiAI | Avian Intelligence",
    page_icon="🐦",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Custom Styling ---
st.markdown("""
<style>
    .main {
        background-color: #020817;
        color: white;
    }
    .stButton>button {
        width: 100%;
        border-radius: 12px;
        background-color: #3b82f6;
        color: white;
        font-weight: bold;
        padding: 0.75rem;
        border: none;
    }
    .stButton>button:hover {
        background-color: #2563eb;
    }
    .species-card {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 20px;
        padding: 20px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        margin-bottom: 20px;
    }
    .confidence-badge {
        background-color: #3b82f6;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
    }
</style>
""", unsafe_allow_html=True)

# --- Sidebar ---
with st.sidebar:
    st.title("🐦 PakshiAI")
    st.markdown("---")
    app_mode = st.radio("Choose Intelligence Hub", ["Acoustic Hub", "Visual ID", "Species Catalog"])
    st.markdown("---")
    st.info("Operating in Lightweight Inference Mode optimized for Cloud environments.")

# --- Utility Functions ---
def get_species_info(common_name):
    for bird in indian_birds:
        if bird['name'] == common_name:
            return bird
    return None

# --- Main Logic ---
if app_mode == "Acoustic Hub":
    st.header("🎵 Acoustic Intelligence")
    st.write("Identify bird species from audio recordings.")
    
    uploaded_file = st.file_uploader("Upload Audio (WAV, MP3, OGG)", type=["wav", "mp3", "ogg"])
    
    if uploaded_file:
        st.audio(uploaded_file)
        
        col1, col2 = st.columns(2)
        with col1:
            habitat = st.selectbox("Habitat (Optional)", ["", "Forest", "Urban", "Wetland", "Agricultural", "Scrub"])
        with col2:
            st.write("") # Spacer
            if st.button("Initialize Neural Analysis"):
                with st.spinner("Decoding spectral signatures..."):
                    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{uploaded_file.name.split('.')[-1]}") as tmp_file:
                        tmp_file.write(uploaded_file.getvalue())
                        tmp_path = tmp_file.name
                    
                    try:
                        # Standardize and extract features
                        processed_path = tmp_path + "_proc.wav"
                        AudioProcessor.standardize_audio(tmp_path, processed_path)
                        features = AudioProcessor.extract_features(processed_path)
                        
                        # Predict
                        raw_preds = MLEngine.predict(features)
                        
                        # Contextual adjustment
                        context = {"habitat": habitat}
                        results = ContextEngine.adjust_probabilities(raw_preds, context)
                        
                        st.success("Neural Analysis Complete!")
                        
                        for i, res in enumerate(results[:3]):
                            with st.container():
                                st.markdown(f"""
                                <div class="species-card">
                                    <div style="display: flex; justify-content: space-between; align-items: center;">
                                        <h3 style="margin:0;">{res['common_name']}</h3>
                                        <span class="confidence-badge">{int(res['adjusted_score']*100)}% Match</span>
                                    </div>
                                    <p style="color: rgba(255,255,255,0.4); font-style: italic; margin-bottom: 10px;">{res['scientific_name']}</p>
                                    <p style="font-size: 0.9rem;">{res['context_reasoning']}</p>
                                </div>
                                """, unsafe_allow_html=True)
                                
                                bird_info = get_species_info(res['common_name'])
                                if bird_info:
                                    with st.expander("View Ecological Context"):
                                        st.write(f"**Conservation Status:** {bird_info['conservationStatus']}")
                                        st.write(f"**Description:** {bird_info['description']}")
                        
                    except Exception as e:
                        st.error(f"Analysis Failed: {str(e)}")
                    finally:
                        if os.path.exists(tmp_path): os.remove(tmp_path)
                        if 'processed_path' in locals() and os.path.exists(processed_path): os.remove(processed_path)

elif app_mode == "Visual ID":
    st.header("📷 Visual Intelligence")
    st.write("Identify bird species from photographs.")
    
    uploaded_image = st.file_uploader("Upload Photograph (JPG, PNG)", type=["jpg", "png", "jpeg"])
    
    if uploaded_image:
        image = Image.open(uploaded_image)
        st.image(image, use_column_width=True)
        
        if st.button("Initiate Neural Scan"):
            with st.spinner("Decoding anatomical markers..."):
                with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
                    image.save(tmp_file.name)
                    tmp_path = tmp_file.name
                
                try:
                    results = VisionEngine.predict(tmp_path)
                    
                    st.success("Visual Scan Complete!")
                    
                    for res in results[:3]:
                        with st.container():
                            st.markdown(f"""
                            <div class="species-card">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <h3 style="margin:0;">{res['common_name']}</h3>
                                    <span class="confidence-badge">{int(res['confidence']*100)}% Confidence</span>
                                </div>
                                <p style="color: rgba(255,255,255,0.4); font-style: italic; margin-bottom: 10px;">{res['scientific_name']}</p>
                                <p style="font-size: 0.9rem;">{res['context_reasoning']}</p>
                            </div>
                            """, unsafe_allow_html=True)

                except Exception as e:
                    st.error(f"Analysis Failed: {str(e)}")
                finally:
                    if os.path.exists(tmp_path): os.remove(tmp_path)

elif app_mode == "Species Catalog":
    st.header("📚 Species Repository")
    st.write("Explore the Indian avifauna catalog.")
    
    search_query = st.text_input("Search catalog...", "")
    
    filtered_birds = [b for b in indian_birds if search_query.lower() in b['name'].lower() or search_query.lower() in b['scientificName'].lower()]
    
    for bird in filtered_birds[:10]:
        with st.container():
            st.markdown(f"""
            <div class="species-card">
                <h3>{bird['name']}</h3>
                <p style="color: rgba(255,255,255,0.4); italic;">{bird['scientificName']}</p>
                <p>{bird['description'][:200]}...</p>
            </div>
            """, unsafe_allow_html=True)

st.markdown("---")
st.caption("PakshiAI v1.0.0-alpha | Powered by Deep Learning CNNs")
