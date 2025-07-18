from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth

router = APIRouter(prefix="/quiz", tags=["quiz"])

@router.get("/{topic_id}", response_model=List[schemas.QuizQuestion])
def get_quiz_questions(topic_id: int, db: Session = Depends(models.get_db)):
    # Check if topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    quizzes = db.query(models.Quiz).filter(models.Quiz.topic_id == topic_id).all()
    return [
        schemas.QuizQuestion(
            id=quiz.id,
            question=quiz.question,
            options=quiz.options
        )
        for quiz in quizzes
    ]

@router.post("/submit", response_model=schemas.UserScore)
def submit_quiz(
    submission: schemas.QuizSubmissionList,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    # Check if topic exists
    topic = db.query(models.Topic).filter(models.Topic.id == submission.topic_id).first()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    
    # Calculate score
    score = 0
    total_questions = len(submission.submissions)
    
    for sub in submission.submissions:
        quiz = db.query(models.Quiz).filter(models.Quiz.id == sub.quiz_id).first()
        if quiz and quiz.correct_option == sub.selected_option:
            score += 1
    
    # Save score
    db_score = models.UserScore(
        user_id=current_user.id,
        topic_id=submission.topic_id,
        score=score,
        total_questions=total_questions
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    
    return db_score

@router.get("/scores/{topic_id}", response_model=List[schemas.UserScore])
def get_user_scores(
    topic_id: int,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    scores = db.query(models.UserScore).filter(
        models.UserScore.user_id == current_user.id,
        models.UserScore.topic_id == topic_id
    ).all()
    return scores

@router.get("/progress/", response_model=List[schemas.UserScore])
def get_user_progress(
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    scores = db.query(models.UserScore).filter(
        models.UserScore.user_id == current_user.id
    ).all()
    return scores
