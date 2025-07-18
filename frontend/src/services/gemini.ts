import api from "./api";
import { GeminiQuery, GeminiResponse, Quiz } from "../types";

export const geminiService = {
  async queryGemini(query: GeminiQuery): Promise<GeminiResponse> {
    const response = await api.post("/gemini/query", query);
    return response.data;
  },

  async generateQuiz(
    topicId: number,
    numQuestions: number = 5
  ): Promise<Quiz[]> {
    const response = await api.post("/gemini/generate-quiz", {
      topic_id: topicId,
      num_questions: numQuestions,
    });
    return response.data;
  },

  async explainTopic(topicId: number): Promise<GeminiResponse> {
    const response = await api.post(`/gemini/explain-topic/${topicId}`);
    return response.data;
  },
};
