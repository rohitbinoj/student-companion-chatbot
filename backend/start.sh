#!/bin/bash

# Backend startup script for AI Learning Companion

echo "🚀 Starting AI Learning Companion Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python -m venv venv
fi

# Activate virtual environment
echo "⚡ Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create it with your configuration."
    echo "📄 Example .env content:"
    cat << EOF

DATABASE_URL=postgresql://username:password@localhost:5432/student_companion
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=your-gemini-api-key-here

EOF
    exit 1
fi

# Initialize database
echo "🗄️  Initializing database..."
cd app
python init_db.py
cd ..

# Start the server
echo "🌐 Starting FastAPI server..."
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
