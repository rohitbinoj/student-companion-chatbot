from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Topic schemas
class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Content schemas
class ContentBase(BaseModel):
    summary_text: str

class ContentCreate(ContentBase):
    topic_id: int

class Content(ContentBase):
    id: int
    topic_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Quiz schemas
class QuizBase(BaseModel):
    question: str
    options: List[str]
    correct_option: int

class QuizCreate(QuizBase):
    topic_id: int

class Quiz(QuizBase):
    id: int
    topic_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]

class QuizSubmission(BaseModel):
    quiz_id: int
    selected_option: int

class QuizSubmissionList(BaseModel):
    topic_id: int
    submissions: List[QuizSubmission]

# Score schemas
class UserScoreBase(BaseModel):
    score: int
    total_questions: int

class UserScoreCreate(UserScoreBase):
    user_id: int
    topic_id: int

class UserScore(UserScoreBase):
    id: int
    user_id: int
    topic_id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Gemini schemas
class GeminiQuery(BaseModel):
    prompt: str
    topic_id: Optional[int] = None

class GeminiResponse(BaseModel):
    response: str
    topic_id: Optional[int] = None

class QuizGenerationRequest(BaseModel):
    topic_id: int
    num_questions: int = 5

class GeneratedQuiz(BaseModel):
    topic_id: int
    questions: List[QuizQuestion]

class TopicExplanation(BaseModel):
    topic_id: int
    topic_title: str
    explanation: str
