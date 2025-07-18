import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-6">
          🤖 AI Learning Companion
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your personal AI tutor for Machine Learning and Artificial
          Intelligence
        </p>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            🎯 What You'll Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                🧠 Core ML Concepts
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• Supervised & Unsupervised Learning</li>
                <li>• Neural Networks & Deep Learning</li>
                <li>• Decision Trees & Random Forests</li>
                <li>• Natural Language Processing</li>
              </ul>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-blue-600 mb-2">
                🚀 Interactive Features
              </h3>
              <ul className="text-gray-600 space-y-1">
                <li>• AI-powered explanations</li>
                <li>• Interactive quizzes</li>
                <li>• Progress tracking</li>
                <li>• Chat with AI tutor</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {isAuthenticated ? (
            <Link
              to="/topics"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Learning →
            </Link>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="inline-block bg-gray-200 text-gray-800 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            🌍 Supporting SDG 4: Quality Education
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
