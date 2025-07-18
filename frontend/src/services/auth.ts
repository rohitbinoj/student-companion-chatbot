import api from "./api";
import { LoginCredentials, RegisterData, AuthResponse, User } from "../types";

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData: RegisterData): Promise<User> {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
  },

  getToken(): string | null {
    return localStorage.getItem("token");
  },

  setToken(token: string) {
    localStorage.setItem("token", token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
