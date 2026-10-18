import { useCallback, useState } from "react";
import { login as loginRequest } from "../services/authService";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const login = useCallback(async (username: string, password: string) => {
    const result = await loginRequest(username, password);
    localStorage.setItem("token", result.token);
    setToken(result.token);
    return result;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
  }, []);

  return { token, isAuthenticated: Boolean(token), login, logout };
}
