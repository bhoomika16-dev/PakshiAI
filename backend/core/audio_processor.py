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
        Optimized audio standardization using pydub/ffmpeg and soundfile.
        Dramatically faster than librosa.load on limited CPUs.
        """
        try:
            # 1. Use pydub to load and convert to target format (FAST using ffmpeg)
            # This handles MP3, AAC, WAV, etc.
            audio = pydub.AudioSegment.from_file(file_path)
            
            # 2. Trim/Slice using pydub (very fast)
            start_ms = int(offset * 1000)
            end_ms = start_ms + int(duration * 1000)
            audio = audio[start_ms:end_ms]
            
            # 3. Resample and Mono in one step (FAST)
            audio = audio.set_frame_rate(AudioProcessor.TARGET_SR).set_channels(1)
            
            # 4. Export to a temporary wav for soundfile reading
            temp_wav = output_path + ".temp.wav"
            audio.export(temp_wav, format="wav")
            
            # 5. Load with soundfile (ULTRA FAST)
            data, sr = sf.read(temp_wav)
            
            # Clean up temp file
            if os.path.exists(temp_wav):
                os.remove(temp_wav)
                
            # Normalize
            data = data.astype(np.float32)
            if np.max(np.abs(data)) > 0:
                data = data / np.max(np.abs(data))
            
            # Save final processed file
            sf.write(output_path, data, AudioProcessor.TARGET_SR)
            
            return {
                "duration": len(data) / AudioProcessor.TARGET_SR,
                "sample_rate": AudioProcessor.TARGET_SR,
                "channels": 1,
                "processed_path": output_path,
                "data": data
            }
        except Exception as e:
            print(f"PakshiAI: [Optimization Warning] Accelerated processing failed, falling back. Error: {e}")
            # Fallback to librosa if something goes wrong with pydub
            y, sr = librosa.load(file_path, sr=AudioProcessor.TARGET_SR, mono=True, offset=offset, duration=duration)
            y = librosa.util.normalize(y)
            sf.write(output_path, y, AudioProcessor.TARGET_SR)
            return {
                "duration": len(y) / AudioProcessor.TARGET_SR,
                "sample_rate": AudioProcessor.TARGET_SR,
                "channels": 1,
                "processed_path": output_path,
                "data": y
            }

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
