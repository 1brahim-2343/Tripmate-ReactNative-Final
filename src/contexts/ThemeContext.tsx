import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { AppTheme, DarkTheme, LightTheme } from "../theme/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ASYNC_STORAGE_KEYS } from "../constants/storageKeys";

type ThemeContextValue = {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ASYNC_STORAGE_KEYS.THEME).then((savedTheme) => {
      if (savedTheme === "dark") setIsDark(true);
    });
  }, []);

  const toggleTheme = () => {
    const newThemeIsDark = !isDark;
    setIsDark(newThemeIsDark);
    AsyncStorage.setItem(
      ASYNC_STORAGE_KEYS.THEME,
      newThemeIsDark ? "dark" : "light",
    );
    return newThemeIsDark;
  };
  return (
    <ThemeContext.Provider
      value={{ theme: isDark ? DarkTheme : LightTheme, isDark, toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
};
