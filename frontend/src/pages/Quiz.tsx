import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Topic, QuizQuestion, QuizSubmission } from "../types";
import { topicService, quizService } from "../services/topics";
import { geminiService } from "../services/gemini";

const Quiz: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) return;

      try {
        const [topicData, quizData] = await Promise.all([
          topicService.getTopic(parseInt(topicId)),
          quizService.getQuizQuestions(parseInt(topicId)),
        ]);

        setTopic(topicData);
        setQuestions(quizData);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch quiz data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  const generateQuiz = async () => {
    if (!topicId) return;

    setGenerating(true);
    setError("");

    try {
      await geminiService.generateQuiz(parseInt(topicId), 5);
      const quizData = await quizService.getQuizQuestions(parseInt(topicId));
      setQuestions(quizData);
      setCurrentQuestion(0);
      setAnswers({});
      setShowResults(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate quiz");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const submitQuiz = async () => {
    if (!topicId || questions.length === 0) return;

    try {
      const submissions: QuizSubmission[] = questions.map((q) => ({
        quiz_id: q.id,
        selected_option: answers[q.id] || 0,
      }));

      const result = await quizService.submitQuiz(
        parseInt(topicId),
        submissions
      );
      setScore(result.score);
      setShowResults(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit quiz");
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading quiz...</div>
      </div>
    );
  }

  if (error && !topic) {
    return (
      <div className="text-center text-red-600 min-h-64 flex items-center justify-center">
        <div>
          <p className="text-xl mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            🎉 Quiz Complete!
          </h1>
          <div className="text-6xl mb-4">
            {score / questions.length >= 0.8
              ? "🏆"
              : score / questions.length >= 0.6
              ? "👏"
              : "📚"}
          </div>
          <p className="text-2xl font-semibold text-gray-700 mb-2">
            Your Score: {score}/{questions.length}
          </p>
          <p className="text-lg text-gray-600 mb-6">
            {score / questions.length >= 0.8
              ? "Excellent work! You have a strong understanding of this topic."
              : score / questions.length >= 0.6
              ? "Good job! You have a solid grasp of the basics."
              : "Keep learning! Review the material and try again."}
          </p>
          <div className="space-x-4">
            <button
              onClick={resetQuiz}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate(`/learn/${topicId}`)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Review Material
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {topic && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🧪 {topic.title} Quiz
          </h1>
          <p className="text-gray-600">{topic.description}</p>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              No Quiz Available
            </h2>
            <p className="text-gray-600 mb-6">
              Generate a quiz for this topic using AI
            </p>
            <button
              onClick={generateQuiz}
              disabled={generating}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generating ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Generating Quiz...
                </>
              ) : (
                <>🤖 Generate AI Quiz</>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              Question {currentQuestion + 1} of {questions.length}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mx-4">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              {questions[currentQuestion]?.question}
            </h2>
            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option, index) => (
                <label
                  key={index}
                  className="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${questions[currentQuestion].id}`}
                    value={index}
                    checked={answers[questions[currentQuestion].id] === index}
                    onChange={() =>
                      handleAnswer(questions[currentQuestion].id, index)
                    }
                    className="mr-3"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestion === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <div className="flex space-x-4">
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={submitQuiz}
                  disabled={Object.keys(answers).length !== questions.length}
                  className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={nextQuestion}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}
    </div>
  );
};

export default Quiz;
