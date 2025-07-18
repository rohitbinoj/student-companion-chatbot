from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
import json
        
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        
        prompt = f"""
        Provide a comprehensive explanation of {topic.title} in the context of Machine Learning and Artificial Intelligence.
        
        Topic description: {topic.description}
        
        Structure your explanation with:
from typing import List
from .. import models, schemas, auth

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

router = APIRouter(prefix="/gemini", tags=["gemini"])

@router.post("/query", response_model=schemas.GeminiResponse)
def query_gemini(
    query: schemas.GeminiQuery,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Updated model name for current API version - using 8b for better quotas
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        
        # Enhanced prompt for better AI/ML explanations
        enhanced_prompt = f"""
        You are an AI tutor specializing in Machine Learning and Artificial Intelligence concepts.
        Please provide a clear, educational explanation for the following question:
        
        {query.prompt}
        
        Make your response:
        - Educational and easy to understand
        - Include relevant examples if applicable
        - Structured with clear sections
        - Suitable for students learning AI/ML
        """
        
        response = model.generate_content(enhanced_prompt)
        
        # If topic_id is provided, save the content
        if query.topic_id:
            topic = db.query(models.Topic).filter(models.Topic.id == query.topic_id).first()
            if topic:
                db_content = models.Content(
                    topic_id=query.topic_id,
                    summary_text=response.text
                )
                db.add(db_content)
                db.commit()
        
        return schemas.GeminiResponse(
            response=response.text,
            topic_id=query.topic_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error querying Gemini: {str(e)}"
        )

@router.post("/generate-quiz", response_model=List[schemas.Quiz])
def generate_quiz(
    request: schemas.QuizGenerationRequest,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Get topic information
        topic = db.query(models.Topic).filter(models.Topic.id == request.topic_id).first()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found"
            )
        
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        
        prompt = f"""
        Generate {request.num_questions} multiple choice questions about {topic.title}.
        Topic description: {topic.description}
        
        For each question, provide:
        1. A clear question
        2. Exactly 4 options (A, B, C, D)
        3. The correct answer (indicate which option is correct)
        
        Format your response as a JSON array with this structure:
        [
            {{
                "question": "Question text here?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_option": 0
            }}
        ]
        
        Make sure the questions are educational and test understanding of {topic.title} concepts.
        The correct_option should be the index (0-3) of the correct answer in the options array.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                json_text = json_match.group(0)
                quiz_data = json.loads(json_text)
            else:
                raise ValueError("No valid JSON found in response")
                
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error parsing Gemini response: {str(e)}"
            )
        
        # Save quiz questions to database
        created_quizzes = []
        for quiz_item in quiz_data:
            db_quiz = models.Quiz(
                topic_id=request.topic_id,
                question=quiz_item["question"],
                options=quiz_item["options"],
                correct_option=quiz_item["correct_option"]
            )
            db.add(db_quiz)
            db.commit()
            db.refresh(db_quiz)
            created_quizzes.append(db_quiz)
        
        return created_quizzes
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating quiz: {str(e)}"
        )

@router.post("/explain-topic/{topic_id}", response_model=schemas.GeminiResponse)
def explain_topic(
    topic_id: int,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Get topic information
        topic = db.query(models.Topic).filter(models.Topic.id == topic_id).first()
        if not topic:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Topic not found"
            )
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        prompt = f"""
        Provide a comprehensive explanation of {topic.title} in the context of Machine Learning and Artificial Intelligence.
        
        Topic description: {topic.description}
        
        Structure your explanation with:
        1. Introduction and definition
        2. Key concepts and components
        3. Real-world applications
        4. Simple examples
        5. Benefits and limitations
        
        Make it educational and suitable for students learning AI/ML concepts.
        Aim for about 300-500 words.
        """
        
        response = model.generate_content(prompt)
        
        # Save the explanation as content
        db_content = models.Content(
            topic_id=topic_id,
            summary_text=response.text
        )
        db.add(db_content)
        db.commit()
        
        return schemas.GeminiResponse(
            response=response.text,
            topic_id=topic_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining topic: {str(e)}"
        )
