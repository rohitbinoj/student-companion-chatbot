export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

export interface Content {
  id: number;
  topic_id: number;
  summary_text: string;
  created_at: string;
}

export interface Quiz {
  id: number;
  topic_id: number;
  question: string;
  options: string[];
  correct_option: number;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface QuizSubmission {
  quiz_id: number;
  selected_option: number;
}

export interface UserScore {
  id: number;
  user_id: number;
  topic_id: number;
  score: number;
  total_questions: number;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface GeminiQuery {
  prompt: string;
  topic_id?: number;
}

export interface GeminiResponse {
  response: string;
  topic_id?: number;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}
