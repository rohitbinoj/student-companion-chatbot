# 📘 AI Learning Companion Chatbot

A full-stack AI-powered learning companion that helps students learn AI/ML concepts through interactive explanations, quizzes, and chat powered by **Gemini Pro**.

## 🎯 Features

- 🔐 **User Authentication**: JWT-based registration and login
- 🧠 **AI Chat Interface**: Ask questions about AI/ML topics
- 📚 **Topic-based Learning**: Structured learning materials
- 🤖 **Gemini-powered Explanations**: AI-generated content explanations
- 🧪 **Dynamic Quiz Generation**: AI-generated quiz questions
- 📈 **Progress Tracking**: Monitor learning progress and scores
- 🎨 **Modern UI**: Clean, responsive interface with Tailwind CSS

## 🚀 Tech Stack

### Backend

- **FastAPI** (Python 3.10+)
- **SQLite** (Database)
- **SQLAlchemy** (ORM)
- **JWT Authentication** (python-jose)
- **Gemini Pro API** (AI integration)

### Frontend

- **React 18** (TypeScript)
- **Vite** (Build tool)
- **React Router** (Navigation)
- **Axios** (HTTP client)
- **Tailwind CSS** (Styling)

## 📋 Prerequisites

1. **Python 3.10+**
2. **Node.js 18+**
3. **Gemini API Key** (Google AI Studio)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Student-Companion-chatbot
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env file with your Gemini API key
```

### 3. Database Setup

```bash
# Database tables will be created automatically using SQLite
# Initialize database with sample data
python -c "from app.models import create_tables; create_tables()"
python -c "from app.init_db import init_db; init_db()"
```

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 5. Start the Application

```bash
# Terminal 1: Start backend server
cd backend
python run_server.py

# Terminal 2: Start frontend (if not already running)
cd frontend
npm run dev
```

## 🔧 Configuration

### Environment Variables (.env)

```env
# Database (SQLite - automatically created)
DATABASE_URL=sqlite:///./student_companion.db

# JWT
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API
GEMINI_API_KEY=your-gemini-api-key-here
```

## 🌐 API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Topics

- `GET /topics/` - List all topics
- `GET /topics/{id}` - Get specific topic
- `GET /topics/{id}/content` - Get topic content

### Quiz

- `GET /quiz/{topic_id}` - Get quiz questions
- `POST /quiz/submit` - Submit quiz answers
- `GET /quiz/progress/` - Get user progress

### Gemini AI

- `POST /gemini/query` - Ask AI questions
- `POST /gemini/generate-quiz` - Generate quiz questions
- `POST /gemini/explain-topic/{topic_id}` - Get topic explanation

## 🎨 Frontend Pages

- **/** - Home page
- **/login** - User login
- **/register** - User registration
- **/topics** - Browse learning topics
- **/learn/:topicId** - Learn specific topic
- **/chat** - Chat with AI tutor
- **/quiz/:topicId** - Take topic quiz
- **/progress** - View learning progress

## 🗃️ Database Schema

### Tables

- **users** - User accounts
- **topics** - Learning topics
- **content** - Topic content/explanations
- **quizzes** - Quiz questions
- **user_scores** - User quiz scores

## 🚦 Getting Started

1. **Register** a new account or **login**
2. **Browse topics** on the Topics page
3. **Learn** by reading AI-generated explanations
4. **Take quizzes** to test your knowledge
5. **Chat** with the AI tutor for custom questions
6. **Track progress** on the Progress page

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🌍 SDG Impact

This project supports **UN Sustainable Development Goal 4: Quality Education** by providing:

- Free access to AI/ML education
- Interactive learning experiences
- Personalized learning paths
- Progress tracking and assessment

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**

   - Database file will be created automatically
   - Ensure backend directory is writable

2. **Gemini API errors**

   - Verify GEMINI_API_KEY in .env
   - Check API quota limits
   - Ensure using correct model name (gemini-1.5-flash)

3. **Frontend build errors**
   - Ensure Node.js 18+ is installed
   - Clear node_modules and reinstall

### Support

For issues and questions, please create an issue in the GitHub repository.
