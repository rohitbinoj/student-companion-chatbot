from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import google.generativeai as genai
import os
import json
import re
from typing import List
from .. import models, schemas, auth
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/gemini", tags=["gemini"])

def get_gemini_model():
    """Configure and return Gemini model with proper error handling"""
    # Load environment variables from the correct path
    import os
    from dotenv import load_dotenv
    
    # Get the correct path to .env file
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.dirname(os.path.dirname(current_dir))
    env_path = os.path.join(backend_dir, '.env')
    
    # Load environment variables
    load_dotenv(env_path)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GEMINI_API_KEY not found in environment variables"
        )
    
    try:
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-1.5-flash-8b')
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error configuring Gemini API: {str(e)}"
        )

@router.post("/query", response_model=schemas.GeminiResponse)
def query_gemini(
    query: schemas.GeminiQuery,
    db: Session = Depends(models.get_db),
    current_user: models.User = Depends(auth.get_current_user)
):
    try:
        # Get configured Gemini model
        model = get_gemini_model()
        
        # Simple prompt for better AI/ML explanations
        enhanced_prompt = f"""
        You are an AI tutor. Explain this clearly for students:
        
        {query.prompt}
        
        Provide:
        - Clear explanation
        - Practical examples
        - Key concepts
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
        
        # Get configured Gemini model
        model = get_gemini_model()
        
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
                    correct_option=correct_index
                )
                db.add(quiz_question)
                quiz_questions.append(quiz_question)
            
            db.commit()
            
            # Refresh objects to get IDs
            for question in quiz_questions:
                db.refresh(question)
            
            return quiz_questions
            
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
        
        # Get configured Gemini model
        model = get_gemini_model()
        
        prompt = f"""
        Explain {topic.title} in the context of Machine Learning and AI.
        
        Topic: {topic.description}
        
        Please provide:
        1. A clear definition
        2. Key concepts
        3. How it works
        4. Real-world applications
        5. Benefits and limitations
        
        Keep the explanation educational and suitable for students.
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
        
        return schemas.GeminiResponse(
            response=response.text,
            topic_id=topic_id
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error explaining topic: {str(e)}"
        )
