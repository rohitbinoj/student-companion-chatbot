# 🚀 Quick Setup Guide

## Prerequisites Check

### 1. Python 3.10+

```bash
python --version
# Should show Python 3.10.x or higher
```

### 2. Node.js 18+

```bash
node --version
# Should show v18.x.x or higher
```

### 3. PostgreSQL

```bash
psql --version
# Should show PostgreSQL 12.x or higher
```

## 🔧 Setup Steps

### Step 1: Database Setup

```bash
# Create database
createdb student_companion

# Or using SQL:
psql -U postgres
CREATE DATABASE student_companion;
\q
```

### Step 2: Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment (update with your values)
cp .env.example .env
# Edit .env with your database credentials and Gemini API key
```

### Step 3: Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### Step 4: Initialize Database

```bash
cd backend/app
python init_db.py
```

### Step 5: Start Applications

#### Terminal 1 (Backend):

```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload
```

#### Terminal 2 (Frontend):

```bash
cd frontend
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Test the Application

1. Open http://localhost:3000
2. Register a new account
3. Browse topics
4. Generate AI explanations
5. Take quizzes
6. Chat with AI tutor

## 🛠️ Development Commands

### Backend:

```bash
# Start development server
uvicorn app.main:app --reload

# Run database initialization
python app/init_db.py
```

### Frontend:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔑 Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/student_companion
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=AIzaSyCYPNpYNqAQKoy4YgwyuuMKCENFzIS4Uzc
```

## 📚 Sample Topics Available

1. Machine Learning Fundamentals
2. Neural Networks
3. Decision Trees
4. Supervised Learning
5. Unsupervised Learning
6. Natural Language Processing
7. Computer Vision
8. Reinforcement Learning

## 🎉 Ready to Learn!

Your AI Learning Companion is now ready. Start exploring AI and ML concepts with personalized AI tutoring!
