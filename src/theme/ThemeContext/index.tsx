import { createContext, useContext } from "react";

interface ThemeContextType {
    theme: any;  // Buraya uygun tema tipini belirtin, örneğin: `Record<string, any>`
    toggleTheme: (themeType: string) => void;
}

// Başlangıçta null değeriyle başlatıyoruz
const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export default ThemeContext;