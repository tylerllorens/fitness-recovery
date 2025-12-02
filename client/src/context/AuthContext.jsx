import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { loginRequest, logoutRequest, fetchCurrentUser } from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // will hold profile later
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("accessToken");
        if (!token) {
          if (isMounted) setLoading(false);
          return;
        }

        const user = await fetchCurrentUser();

        if (!isMounted) return;
        setUser(user);
      } catch (e) {
        if (!isMounted) return;
        setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    init();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const loginData = await loginRequest({ email, password });

      console.log("Login data received:", loginData); // backend testing

      const accessToken = loginData?.data?.accessToken;
      const loggedInUser = loginData?.data?.user;

      if (!accessToken) {
        throw new Error("No access token returned from login");
      }

      localStorage.setItem("accessToken", accessToken);

      if (loggedInUser) {
        setUser(loggedInUser);
      } else {
        const me = await fetchCurrentUser();
        setUser(me);
      }

      return { success: true };
    } catch (e) {
      localStorage.removeItem("accessToken");
      setUser(null);
      setError(e.message || "Login failed");
      return { success: false, error: e.message || "Login failed" };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
    } finally {
      localStorage.removeItem("accessToken");
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
