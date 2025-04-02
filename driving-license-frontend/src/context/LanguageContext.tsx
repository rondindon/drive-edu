import React, { createContext, useState, useEffect, ReactNode } from "react";

interface LanguageContextType {
  language: "en" | "sk";
  toggleLanguage: () => void;
  setLanguage: (lang: "en" | "sk") => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<"en" | "sk">("en");

  // Optionally, check localStorage for a saved language preference
  useEffect(() => {
    const storedLanguage = localStorage.getItem("language") as "en" | "sk" | null;
    if (storedLanguage) {
      setLanguageState(storedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const newLanguage = prev === "en" ? "sk" : "en";
      localStorage.setItem("language", newLanguage);
      return newLanguage;
    });
  };

  const setLanguage = (lang: "en" | "sk") => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};