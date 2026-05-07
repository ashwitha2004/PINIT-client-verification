from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from ..models import Analytics, User
from ..db import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/api/analytics", tags=["analytics"])

class AnalyticsEvent(BaseModel):
    event_type: str  # 'upload', 'verification', 'encryption', 'login', 'register'
    user_id: str
    metadata: Dict[str, Any] = {}

class AnalyticsResponse(BaseModel):
    total_uploads: int
    total_verifications: int
    total_encryptions: int
    total_users: int
    active_users_today: int
    detection_types: Dict[str, int]
    suspicious_files: int
    fake_files: int
    authentic_files: int
    recent_activity: List[Dict[str, Any]]

@router.post("/log-event")
async def log_analytics_event(
    event: AnalyticsEvent,
    db: Session = Depends(get_db)
):
    """Log an analytics event"""
    try:
        analytics_entry = Analytics(
            event_type=event.event_type,
            user_id=event.user_id,
            metadata=event.metadata,
            timestamp=datetime.utcnow()
        )
        db.add(analytics_entry)
        db.commit()
        
        return {"status": "success", "message": "Event logged successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to log event: {str(e)}")

@router.get("/dashboard-stats", response_model=AnalyticsResponse)
async def get_dashboard_stats(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for admin analytics"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Total counts
        total_uploads = db.query(Analytics).filter(
            Analytics.event_type == "upload",
            Analytics.timestamp >= cutoff_date
        ).count() or 0
        
        total_verifications = db.query(Analytics).filter(
            Analytics.event_type == "verification",
            Analytics.timestamp >= cutoff_date
        ).count() or 0
        
        total_encryptions = db.query(Analytics).filter(
            Analytics.event_type == "encryption",
            Analytics.timestamp >= cutoff_date
        ).count() or 0
        
        # User statistics
        total_users = db.query(User).count()
        active_users_today = db.query(Analytics).filter(
            Analytics.timestamp >= datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        ).distinct(Analytics.user_id).count()
        
        # Detection types from verification metadata
        verification_records = db.query(Analytics).filter(
            Analytics.event_type == "verification",
            Analytics.timestamp >= cutoff_date
        ).all()
        
        detection_types = {}
        suspicious_files = 0
        fake_files = 0
        authentic_files = 0
        
        for record in verification_records:
            metadata = record.metadata or {}
            detection_type = metadata.get("detection_type", "Unknown")
            status = metadata.get("status", "unknown")
            
            detection_types[detection_type] = detection_types.get(detection_type, 0) + 1
            
            if status == "suspicious":
                suspicious_files += 1
            elif status == "fake":
                fake_files += 1
            elif status == "authentic":
                authentic_files += 1
        
        # Recent activity
        recent_activity = db.query(Analytics).filter(
            Analytics.timestamp >= datetime.utcnow() - timedelta(hours=24)
        ).order_by(desc(Analytics.timestamp)).limit(10).all()
        
        recent_activity_list = []
        for activity in recent_activity:
            recent_activity_list.append({
                "event_type": activity.event_type,
                "user_id": activity.user_id,
                "timestamp": activity.timestamp.isoformat(),
                "metadata": activity.metadata
            })
        
        return AnalyticsResponse(
            total_uploads=total_uploads,
            total_verifications=total_verifications,
            total_encryptions=total_encryptions,
            total_users=total_users,
            active_users_today=active_users_today,
            detection_types=detection_types,
            suspicious_files=suspicious_files,
            fake_files=fake_files,
            authentic_files=authentic_files,
            recent_activity=recent_activity_list
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get analytics: {str(e)}")

@router.get("/user-activity/{user_id}")
async def get_user_activity(
    user_id: str,
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get activity for a specific user"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        activities = db.query(Analytics).filter(
            Analytics.user_id == user_id,
            Analytics.timestamp >= cutoff_date
        ).order_by(desc(Analytics.timestamp)).all()
        
        activity_list = []
        for activity in activities:
            activity_list.append({
                "event_type": activity.event_type,
                "timestamp": activity.timestamp.isoformat(),
                "metadata": activity.metadata
            })
        
        return {
            "user_id": user_id,
            "total_activities": len(activity_list),
            "activities": activity_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get user activity: {str(e)}")

@router.get("/detection-trends")
async def get_detection_trends(
    days: int = 30,
    db: Session = Depends(get_db)
):
    """Get detection trends over time"""
    try:
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        
        # Group by date and detection status
        daily_stats = db.query(
            func.date(Analytics.timestamp).label('date'),
            Analytics.event_type,
            func.count(Analytics.id).label('count')
        ).filter(
            Analytics.timestamp >= cutoff_date,
            Analytics.event_type.in_(['verification', 'encryption'])
        ).group_by(
            func.date(Analytics.timestamp),
            Analytics.event_type
        ).order_by(func.date(Analytics.timestamp)).all()
        
        trends = []
        for stat in daily_stats:
            trends.append({
                "date": stat.date.isoformat(),
                "event_type": stat.event_type,
                "count": stat.count
            })
        
        return {"trends": trends}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get trends: {str(e)}")
