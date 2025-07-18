import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { UserScore, Topic } from "../types";
import { quizService } from "../services/topics";
import { topicService } from "../services/topics";

const Progress: React.FC = () => {
  const [scores, setScores] = useState<UserScore[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [scoresData, topicsData] = await Promise.all([
          quizService.getUserProgress(),
          topicService.getTopics(),
        ]);

        setScores(scoresData);
        setTopics(topicsData);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch progress data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getTopicName = (topicId: number) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic?.title || "Unknown Topic";
  };

  const getScorePercentage = (score: number, total: number) => {
    return Math.round((score / total) * 100);
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressBg = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-xl">Loading progress...</div>
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

  // Group scores by topic and get the latest score for each topic
  const latestScores = scores.reduce((acc, score) => {
    const existing = acc.find((s) => s.topic_id === score.topic_id);
    if (!existing || new Date(score.timestamp) > new Date(existing.timestamp)) {
      acc = acc.filter((s) => s.topic_id !== score.topic_id);
      acc.push(score);
    }
    return acc;
  }, [] as UserScore[]);

  const averageScore =
    latestScores.length > 0
      ? latestScores.reduce(
          (sum, score) =>
            sum + getScorePercentage(score.score, score.total_questions),
          0
        ) / latestScores.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          📈 Your Learning Progress
        </h1>
        <p className="text-gray-600">
          Track your performance across different AI & ML topics
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {latestScores.length}
            </div>
            <div className="text-gray-600">Topics Attempted</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div
              className={`text-3xl font-bold mb-2 ${getScoreColor(
                averageScore
              )}`}
            >
              {Math.round(averageScore)}%
            </div>
            <div className="text-gray-600">Average Score</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {
                latestScores.filter(
                  (s) => getScorePercentage(s.score, s.total_questions) >= 80
                ).length
              }
            </div>
            <div className="text-gray-600">Mastered Topics</div>
          </div>
        </div>
      </div>

      {/* Topic Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Topic Performance
        </h2>

        {latestScores.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg mb-4">No quiz attempts yet</p>
            <Link
              to="/topics"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Learning
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {latestScores.map((score) => {
              const percentage = getScorePercentage(
                score.score,
                score.total_questions
              );

              return (
                <div
                  key={score.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {getTopicName(score.topic_id)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Last attempted:{" "}
                        {new Date(score.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xl font-bold ${getScoreColor(
                          percentage
                        )}`}
                      >
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {score.score}/{score.total_questions} correct
                      </div>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressBg(
                        percentage
                      )}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  <div className="flex space-x-3">
                    <Link
                      to={`/learn/${score.topic_id}`}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📚 Review Material
                    </Link>
                    <Link
                      to={`/quiz/${score.topic_id}`}
                      className="text-green-600 hover:text-green-800 text-sm"
                    >
                      🧪 Retake Quiz
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* All Quiz Attempts */}
      {scores.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            All Quiz Attempts
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Topic
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Score
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Percentage
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {scores
                  .sort(
                    (a, b) =>
                      new Date(b.timestamp).getTime() -
                      new Date(a.timestamp).getTime()
                  )
                  .map((score) => {
                    const percentage = getScorePercentage(
                      score.score,
                      score.total_questions
                    );

                    return (
                      <tr key={score.id} className="border-t border-gray-200">
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {getTopicName(score.topic_id)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-800">
                          {score.score}/{score.total_questions}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`font-medium ${getScoreColor(
                              percentage
                            )}`}
                          >
                            {percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(score.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
