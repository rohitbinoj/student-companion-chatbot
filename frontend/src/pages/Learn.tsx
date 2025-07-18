import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Topic, Content } from "../types";
import { topicService } from "../services/topics";
import { geminiService } from "../services/gemini";

const Learn: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [content, setContent] = useState<Content[]>([]);
  const [aiExplanation, setAiExplanation] = useState("");
  const [loading, setLoading] = useState(true);
  const [generatingExplanation, setGeneratingExplanation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!topicId) return;

      try {
        const [topicData, contentData] = await Promise.all([
          topicService.getTopic(parseInt(topicId)),
          topicService.getTopicContent(parseInt(topicId)),
        ]);

        setTopic(topicData);
        setContent(contentData);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [topicId]);

  const generateExplanation = async () => {
    if (!topicId || !topic) return;

    setGeneratingExplanation(true);
    setError("");

    try {
      const response = await geminiService.explainTopic(parseInt(topicId));
      setAiExplanation(response.response);

      // Refresh content to include the new explanation
      const updatedContent = await topicService.getTopicContent(
        parseInt(topicId)
      );
      setContent(updatedContent);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to generate explanation");
    } finally {
      setGeneratingExplanation(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading content...</div>
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

  return (
    <div className="max-w-4xl mx-auto">
      {topic && (
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                📚 {topic.title}
              </h1>
              <p className="text-gray-600">{topic.description}</p>
            </div>
            <Link
              to={`/quiz/${topicId}`}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              🧪 Take Quiz
            </Link>
          </div>

          <div className="mb-6">
            <button
              onClick={generateExplanation}
              disabled={generatingExplanation}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {generatingExplanation ? (
                <>
                  <span className="animate-spin mr-2">🔄</span>
                  Generating AI Explanation...
                </>
              ) : (
                <>🤖 Generate AI Explanation</>
              )}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {aiExplanation && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🤖 AI Generated Explanation
              </h3>
              <div className="text-gray-700 whitespace-pre-wrap">
                {aiExplanation}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              📖 Learning Materials
            </h2>

            {content.length > 0 ? (
              <div className="space-y-4">
                {content.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">
                      Content #{index + 1}
                    </h3>
                    <div className="text-gray-700 whitespace-pre-wrap">
                      {item.summary_text}
                    </div>
                    <div className="text-sm text-gray-500 mt-4">
                      Created: {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">
                  No learning materials available yet.
                </p>
                <p className="text-gray-500 text-sm">
                  Click "Generate AI Explanation" to get started!
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Learn;
