import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { storage } from "../services/storage";

const DEMO_USER = {
  email: "johndoe@tripmate.app",
  password: "Password123!",
  name: "John",
  token: "tripmate-demo-jwt-token",
};

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userEmail: string | null;
  userName: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    storage.getToken().then((token) => {
      if (token) {
        setIsAuthenticated(true);
        setUserEmail(DEMO_USER.email);
        setUserName(DEMO_USER.name);
      }
      setIsLoading(false);
    });
  }, []);

  const login = async (email: string, password: string) => {
    if (
      email.trim().toLocaleLowerCase() !== DEMO_USER.email ||
      password !== DEMO_USER.password
    ) {
      throw new Error("Invalid email or password");
    }
    await storage.saveToken(DEMO_USER.token);
    setIsAuthenticated(true);
    setUserEmail(DEMO_USER.email);
    setUserName(DEMO_USER.name);
    return true;
  };
  const logout = async () => {
    await storage.deleteToken();
    setUserEmail(null);
    setIsAuthenticated(false);
    setUserName(null);
  };
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, userEmail, login, logout, userName }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("UseAuth must be called inside AuthProvider");
  }
  return context;
}
