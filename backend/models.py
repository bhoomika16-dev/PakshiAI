from sqlalchemy import Column, Integer, String, Float, DateTime, Enum, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, UTC
import enum
from database import Base

class UserRole(str, enum.Enum):
    USER = "user"
    RESEARCHER = "researcher"
    ADMIN = "admin"

class RecordingType(str, enum.Enum):
    SONG = "song"
    CALL = "call"
    ALARM = "alarm"
    UNKNOWN = "unknown"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String, default=UserRole.USER.value)
    created_at = Column(DateTime, default=lambda: datetime.now(UTC))
    
    recordings = relationship("Recording", back_populates="user")
    
class Recording(Base):
    __tablename__ = "recordings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_path = Column(String)
    processed_path = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    habitat = Column(String, nullable=True)
    recording_date = Column(DateTime, nullable=True) # Actual date recorded
    uploaded_at = Column(DateTime, default=lambda: datetime.now(UTC))
    duration_seconds = Column(Float, nullable=True)
    
    # Metadata extracted
    sample_rate = Column(Integer)
    num_channels = Column(Integer)
    
    user = relationship("User", back_populates="recordings")
    predictions = relationship("Prediction", back_populates="recording")

class Species(Base):
    __tablename__ = "species"
    id = Column(Integer, primary_key=True, index=True)
    common_name = Column(String, index=True)
    scientific_name = Column(String, index=True)
    image_url = Column(String, nullable=True)
    conservation_status = Column(String) # e.g. IUCN Status
    migration_pattern = Column(String) # Resident, Winter Visitor, etc.
    preferred_habitats = Column(JSON) # List of habitat strings
    description = Column(String, nullable=True)
    
    predictions = relationship("Prediction", back_populates="species")
    
class Prediction(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    recording_id = Column(Integer, ForeignKey("recordings.id"))
    species_id = Column(Integer, ForeignKey("species.id"))
    confidence_score = Column(Float) # Raw model output
    adjusted_score = Column(Float) # After context adjustment
    context_reasoning = Column(String) # Explanation for adjustment
    start_time = Column(Float)
    end_time = Column(Float)
    call_type = Column(String, default=RecordingType.UNKNOWN.value)
    
    recording = relationship("Recording", back_populates="predictions")
    species = relationship("Species", back_populates="predictions")
