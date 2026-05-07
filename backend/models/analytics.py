from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(50), nullable=False, index=True)  # 'upload', 'verification', 'encryption', 'login', 'register'
    user_id = Column(String(255), nullable=False, index=True)
    metadata = Column(JSON, nullable=True)  # Store additional event data
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    
    def __repr__(self):
        return f"<Analytics(event_type={self.event_type}, user_id={self.user_id}, timestamp={self.timestamp})>"
