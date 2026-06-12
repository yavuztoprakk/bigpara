import React, { useState, useMemo, useEffect, ReactNode } from "react";
import ThemeContext from "../ThemeContext";
import { themes } from "../themes";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark";


interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState(themes.light);

  // Uygulama başlatıldığında temayı yükleme
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("IS_DARK_MODE_ON");
        switch (savedTheme) {
          case "0":
            setTheme(themes.dark);
            break;
          default:
            setTheme(themes.light);
        }
      } catch (error) {
        console.error("Tema yüklenirken hata oluştu:", error);
      }
    };
    loadTheme();
  }, []);

  const toggleTheme = async (themeType: ThemeType) => {
    try {
      let selectedTheme;
      if (themeType === "light") {
        selectedTheme = themes.light;
        await AsyncStorage.setItem("IS_DARK_MODE_ON", "1");
      } else {
        selectedTheme = themes.dark;
        await AsyncStorage.setItem("IS_DARK_MODE_ON", "0");
      }

      setTheme(selectedTheme);
    } catch (error) {
      console.error("Tema değiştirilirken hata oluştu:", error);
    }
  };

  const value = useMemo(() => ({ theme, toggleTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export default ThemeProvider;
