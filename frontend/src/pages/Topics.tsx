import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Topic } from "../types";
import { topicService } from "../services/topics";

const Topics: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await topicService.getTopics();
        setTopics(data);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch topics");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading topics...</div>
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🧠 AI & Machine Learning Topics
        </h1>
        <p className="text-gray-600">
          Explore comprehensive AI and ML topics powered by Gemini AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              {topic.title}
            </h3>
            <p className="text-gray-600 mb-4 text-sm">{topic.description}</p>
            <div className="flex space-x-3">
              <Link
                to={`/learn/${topic.id}`}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded text-center hover:bg-blue-700 transition-colors"
              >
                📚 Learn
              </Link>
              <Link
                to={`/quiz/${topic.id}`}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded text-center hover:bg-green-700 transition-colors"
              >
                🧪 Quiz
              </Link>
            </div>
          </div>
        ))}
      </div>

      {topics.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">
            No topics available. Please check back later.
          </p>
        </div>
      )}
    </div>
  );
};

export default Topics;
