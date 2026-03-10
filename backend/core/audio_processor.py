import librosa
import numpy as np
import soundfile as sf
import os
import pydub
from scipy.signal import butter, lfilter

class AudioProcessor:
    TARGET_SR = 22050 # Aligned with Acoustic Neural Core training
    TARGET_CHANNELS = 1 # Mono
    
    @staticmethod
    def standardize_audio(file_path: str, output_path: str) -> dict:
        """
        Converts audio to mono, resamples to target SR, normalizes, and trims silence.
        Returns metadata about the processed file.
        """
        try:
            # Load audio (librosa handles many formats)
            y, sr = librosa.load(file_path, sr=None, mono=False)
            
            # Convert to mono if necessary
            if y.ndim > 1:
                y = librosa.to_mono(y)
            
            # Text Resample
            if sr != AudioProcessor.TARGET_SR:
                y = librosa.resample(y, orig_sr=sr, target_sr=AudioProcessor.TARGET_SR)
                
            # Normalize
            y = librosa.util.normalize(y)
            
            # Trim silence (energy based) - top_db=60 is common for clean recordings
            y_trimmed, _ = librosa.effects.trim(y, top_db=60)
            
            # Bandpass filter (optional but good for filtering out wind/rumble < 200Hz)
            # Simple butterworth filter. Prevent fs/2 crash for low sample rates:
            nyquist = AudioProcessor.TARGET_SR / 2.0
            high_cut = min(15000.0, nyquist - 1.0)
            
            b, a = butter(4, [200, high_cut], btype='band', fs=AudioProcessor.TARGET_SR)
            y_filtered = lfilter(b, a, y_trimmed)

            # Save processed file
            sf.write(output_path, y_filtered, AudioProcessor.TARGET_SR)
            
            return {
                "duration": len(y_filtered) / AudioProcessor.TARGET_SR,
                "sample_rate": AudioProcessor.TARGET_SR,
                "channels": 1,
                "processed_path": output_path
            }
        except Exception as e:
            raise ValueError(f"Error processing audio: {str(e)}")

    @staticmethod
    def extract_features(file_path: str):
        """
        Extracts spectral features for visualization and inference.
        """
        y, sr = librosa.load(file_path, sr=AudioProcessor.TARGET_SR)
        
        # Mel Spectrogram (Aligned with 5s segments and 22050Hz)
        y_5s = y[:5*sr] if len(y) > 5*sr else np.pad(y, (0, 5*sr - len(y)))
        mel_spec = librosa.feature.melspectrogram(y=y_5s, sr=sr, n_mels=128, fmax=11025)
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize to [0, 1] range as done in training
        log_mel_spec_norm = (log_mel_spec + 80) / 80
        
        # MFCC
        mfcc = librosa.feature.mfcc(S=log_mel_spec, n_mfcc=13)
        
        # Spectral Centroid
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        
        return {
            "mel_spectrogram": log_mel_spec_norm.tolist(),
            "mfcc": mfcc.tolist(),
            "spectral_centroid": cent.tolist()
        }
