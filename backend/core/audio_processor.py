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
    def standardize_audio(file_path: str, output_path: str, offset: float = 0, duration: float = 30) -> dict:
        """
        Converts audio to mono, resamples to target SR, normalizes, and trims silence.
        Limited to first 30s by default to prevent timeouts on long files.
        Returns metadata about the processed file.
        """
        try:
            # Load audio with limit to prevent OOM/Timeout on massive files
            # librosa.load is slow; using offset and duration helps
            y, sr = librosa.load(file_path, sr=None, mono=True, offset=offset, duration=duration)
            
            # Text Resample
            if sr != AudioProcessor.TARGET_SR:
                y = librosa.resample(y, orig_sr=sr, target_sr=AudioProcessor.TARGET_SR)
                
            # Normalize
            y = librosa.util.normalize(y)
            
            # Trim silence (energy based) - top_db=60 is common for clean recordings
            y_trimmed, _ = librosa.effects.trim(y, top_db=60)
            
            # Bandpass filter (optional but good for filtering out wind/rumble < 200Hz)
            nyquist = AudioProcessor.TARGET_SR / 2.0
            low_cut = 200.0
            high_cut = min(10000.0, nyquist - 50.0) 
            
            b, a = butter(4, [low_cut, high_cut], btype='band', fs=AudioProcessor.TARGET_SR)
            y_filtered = lfilter(b, a, y_trimmed)

            # Save processed file
            sf.write(output_path, y_filtered, AudioProcessor.TARGET_SR)
            
            return {
                "duration": len(y_filtered) / AudioProcessor.TARGET_SR,
                "sample_rate": AudioProcessor.TARGET_SR,
                "channels": 1,
                "processed_path": output_path,
                "data": y_filtered # Return data to avoid re-loading in next step
            }
        except Exception as e:
            raise ValueError(f"Error processing audio: {str(e)}")

    @staticmethod
    def extract_features(audio_data: np.ndarray):
        """
        Extracts spectral features for visualization and inference from memory.
        """
        sr = AudioProcessor.TARGET_SR
        y = audio_data
        
        # Mel Spectrogram (Aligned with 5s segments and 22050Hz)
        y_5s = y[:5*sr] if len(y) > 5*sr else np.pad(y, (0, 5*sr - len(y)))
        mel_spec = librosa.feature.melspectrogram(y=y_5s, sr=sr, n_mels=128, fmax=11025)
        log_mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize to [0, 1] range as done in training
        log_mel_spec_norm = (log_mel_spec + 80) / 80
        
        # MFCC
        mfcc = librosa.feature.mfcc(S=log_mel_spec, n_mfcc=13)
        
        # Spectral Centroid (Using the full audio_data segment provided)
        cent = librosa.feature.spectral_centroid(y=y, sr=sr)
        
        return {
            "mel_spectrogram": log_mel_spec_norm.tolist(),
            "mfcc": mfcc.tolist(),
            "spectral_centroid": cent.tolist()
        }
