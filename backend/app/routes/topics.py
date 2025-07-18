from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth

router = APIRouter(prefix="/topics", tags=["topics"])

@router.get("/", response_model=List[schemas.Topic])
def get_topics(db: Session = Depends(models.get_db)):
    topics = db.query(models.Topic).all()
    return topics

@router.post("/", response_model=schemas.Topic)
def create_topic(
    topic: schemas.TopicCreate, 
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    db_topic = models.Topic(**topic.dict())
    db.add(db_topic)
    db.commit()
    db.refresh(db_topic)
    return db_topic

@router.get("/{topic_id}", response_model=schemas.Topic)
def get_topic(topic_id: int, db: Session = Depends(models.get_db)):
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic

@router.get("/{topic_id}/content", response_model=List[schemas.Content])
def get_topic_content(topic_id: int, db: Session = Depends(models.get_db)):
    # Check if topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    content = db.query(models.Content).filter(models.Content.topic_id == topic_id).all()
    return content

@router.post("/{topic_id}/content", response_model=schemas.Content)
def create_content(
    topic_id: int,
    content: schemas.ContentBase,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    db_content = models.Content(
        topic_id=topic_id,
        summary_text=content.summary_text
    )
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content
