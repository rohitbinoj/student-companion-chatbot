import api from "./api";
import {
  Topic,
  Content,
  QuizQuestion,
  UserScore,
  QuizSubmission,
} from "../types";

export const topicService = {
  async getTopics(): Promise<Topic[]> {
    const response = await api.get("/topics/");
    return response.data;
  },

  async getTopic(id: number): Promise<Topic> {
    const response = await api.get(`/topics/${id}`);
    return response.data;
  },

  async getTopicContent(id: number): Promise<Content[]> {
    const response = await api.get(`/topics/${id}/content`);
    return response.data;
  },

  async createContent(topicId: number, summaryText: string): Promise<Content> {
    const response = await api.post(`/topics/${topicId}/content`, {
      summary_text: summaryText,
    });
    return response.data;
  },
};

export const quizService = {
  async getQuizQuestions(topicId: number): Promise<QuizQuestion[]> {
    const response = await api.get(`/quiz/${topicId}`);
    return response.data;
  },

  async submitQuiz(
    topicId: number,
    submissions: QuizSubmission[]
  ): Promise<UserScore> {
    const response = await api.post("/quiz/submit", {
      topic_id: topicId,
      submissions,
    });
    return response.data;
  },

  async getUserScores(topicId: number): Promise<UserScore[]> {
    const response = await api.get(`/quiz/scores/${topicId}`);
    return response.data;
  },

  async getUserProgress(): Promise<UserScore[]> {
    const response = await api.get("/quiz/progress/");
    return response.data;
  },
};
