from app.models import SessionLocal, Topic, Content
from app.models import create_tables

def init_db():
    """Initialize database with sample data"""
    create_tables()
    
    db = SessionLocal()
    try:
        # Check if topics already exist
        existing_topics = db.query(Topic).count()
        if existing_topics > 0:
            print("Database already initialized with sample data")
            return
        
        # Create sample topics
        sample_topics = [
            {
                "title": "Machine Learning Fundamentals",
                "description": "Introduction to machine learning concepts, types of learning, and basic algorithms"
            },
            {
                "title": "Neural Networks",
                "description": "Understanding artificial neural networks, perceptrons, and deep learning basics"
            },
            {
                "title": "Decision Trees",
                "description": "Tree-based learning algorithms for classification and regression"
            },
            {
                "title": "Supervised Learning",
                "description": "Learning with labeled data, classification and regression techniques"
            },
            {
                "title": "Unsupervised Learning",
                "description": "Learning from unlabeled data, clustering and dimensionality reduction"
            },
            {
                "title": "Natural Language Processing",
                "description": "Processing and understanding human language with AI"
            },
            {
                "title": "Computer Vision",
                "description": "Teaching computers to interpret and understand visual information"
            },
            {
                "title": "Reinforcement Learning",
                "description": "Learning through interaction with environment and rewards"
            }
        ]
        
        for topic_data in sample_topics:
            topic = Topic(**topic_data)
            db.add(topic)
        
        db.commit()
        print("Database initialized with sample topics")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
