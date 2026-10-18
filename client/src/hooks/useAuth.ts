import { useCallback, useState } from "react";
import { login as loginRequest } from "../services/authService";

// TODO: remove this demo account once the backend + database are wired up for real testing.
const DEMO_USERNAME = "khoaadmin";
const DEMO_PASSWORD = "khoaadmin";
const DEMO_TOKEN = "demo-token-no-backend";

export function useAuth() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));

  const login = useCallback(async (username: string, password: string) => {
    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      localStorage.setItem("token", DEMO_TOKEN);
      setToken(DEMO_TOKEN);
      return { token: DEMO_TOKEN, username: DEMO_USERNAME };
    }

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
