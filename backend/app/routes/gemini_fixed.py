from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
import json
import re
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
        - Relevant to AI/ML concepts
        - Include practical examples where helpful
        - Structured with clear headings if needed
        """
        
        response = model.generate_content(enhanced_prompt)
        
        return schemas.GeminiResponse(
            response=response.text,
            prompt=query.prompt
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}"
        )

@router.post("/generate-quiz", response_model=schemas.GeneratedQuiz)
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
        2. Four answer options (A, B, C, D)
        3. The correct answer (A, B, C, or D)
        4. A brief explanation of why the answer is correct
        
        Format your response as a JSON array with this structure:
        [
            {{
                "question": "What is...",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "A",
                "explanation": "This is correct because..."
            }}
        ]
        
        Make sure the questions are educational and test understanding of key concepts.
        """
        
        response = model.generate_content(prompt)
        
        # Parse the JSON response
        try:
            # Extract JSON from response
            json_match = re.search(r'\[.*\]', response.text, re.DOTALL)
            if json_match:
                json_str = json_match.group()
                questions_data = json.loads(json_str)
            else:
                raise ValueError("No valid JSON found in response")
                
            # Create quiz questions in database
            quiz_questions = []
            for q_data in questions_data:
                # Validate required fields
                if not all(key in q_data for key in ['question', 'options', 'correct_answer']):
                    continue
                    
                # Convert correct_answer letter to index
                correct_index = ord(q_data['correct_answer'].upper()) - ord('A')
                if correct_index < 0 or correct_index >= len(q_data['options']):
                    correct_index = 0
                
                quiz_question = models.Quiz(
                    topic_id=request.topic_id,
                    question=q_data['question'],
                    options=q_data['options'],
                    correct_answer=correct_index
                )
                db.add(quiz_question)
                quiz_questions.append(quiz_question)
            
            db.commit()
            
            # Refresh objects to get IDs
            for question in quiz_questions:
                db.refresh(question)
            
            return schemas.GeneratedQuiz(
                topic_id=request.topic_id,
                questions=[
                    schemas.QuizQuestion(
                        id=q.id,
                        question=q.question,
                        options=q.options,
                        correct_answer=q.correct_answer
                    ) for q in quiz_questions
                ]
            )
            
        except (json.JSONDecodeError, ValueError) as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error parsing generated quiz: {str(e)}"
            )
            
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating quiz: {str(e)}"
        )

@router.post("/explain-topic/{topic_id}", response_model=schemas.TopicExplanation)
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
        
        model = genai.GenerativeModel('gemini-1.5-flash-8b')
        
        prompt = f"""
        Provide a comprehensive explanation of {topic.title} in the context of Machine Learning and Artificial Intelligence.
        
        Topic description: {topic.description}
        
        Structure your explanation with:
        1. Introduction and definition
        2. Key concepts and components
        3. How it works (algorithms, processes)
        4. Real-world applications and examples
        5. Advantages and limitations
        6. Related concepts and further learning
        
        Make the explanation educational, clear, and suitable for students learning AI/ML.
        Use examples and analogies where helpful.
        """
        
        response = model.generate_content(prompt)
        
        # Store the explanation in the database
        content = models.Content(
            topic_id=topic_id,
            summary_text=response.text
        )
        db.add(content)
        db.commit()
        db.refresh(content)
        
        return schemas.TopicExplanation(
            topic_id=topic_id,
            topic_title=topic.title,
            explanation=response.text
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining topic: {str(e)}"
        )
