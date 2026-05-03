import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi, register as registerApi } from "../api/auth.api";
import { getFirstError } from "../utils/errorHandler";

const TOKEN_KEY = "token";
const USER_KEY  = "user";

export const useAuth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const getUser  = () => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); }
    catch { return null; }
  };
  const isAuthenticated = () => !!getToken();

  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await loginApi({ email, password });
      const { status, data, messages } = res.data;
      if (status !== "success") {
        setAuthError(getFirstError(messages));
        return false;
      }
      saveSession(data.token, data.user);
      navigate("/");
      return true;
    } catch {
      setAuthError("Network error — please try again");
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async ({ name, email, password }) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await registerApi({ name, email, password });
      const { status, data, messages } = res.data;
      if (status !== "success") {
        setAuthError(getFirstError(messages));
        return false;
      }
      saveSession(data.token, data.user);
      navigate("/");
      return true;
    } catch {
      setAuthError("Network error — please try again");
      return false;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    navigate("/login");
  }, [navigate]);

  return { login, register, logout, getToken, getUser, isAuthenticated, loading, authError };
};
