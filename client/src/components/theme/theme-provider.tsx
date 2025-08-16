import React, { createContext, useContext } from "react";

// Theme configuration matching the landing page design
export const theme = {
  colors: {
    // Primary brand colors
    primary: {
      lime: "#84cc16", // lime-400
      limeHover: "#65a30d", // lime-500
      limeDark: "#4d7c0f", // lime-600
    },

    // Background colors
    background: {
      primary: "#0b0f13", // Dark primary background
      secondary: "#0e1317", // Slightly lighter dark
      card: "rgba(255, 255, 255, 0.03)", // Semi-transparent white
      cardHover: "rgba(255, 255, 255, 0.06)",
      accent: "rgba(255, 255, 255, 0.04)", // For feature cards
    },

    // Border colors
    border: {
      primary: "rgba(255, 255, 255, 0.1)", // white/10
      accent: "rgba(255, 255, 255, 0.05)", // white/5
      lime: "#84cc16",
    },

    // Text colors
    text: {
      primary: "#ffffff", // white
      secondary: "#d1d5db", // gray-300
      muted: "#9ca3af", // gray-400
      accent: "#84cc16", // lime-400
    },

    // Status colors
    status: {
      success: "#10b981", // emerald-500
      warning: "#f59e0b", // amber-500
      error: "#ef4444", // red-500
      info: "#3b82f6", // blue-500
    },
  },

  // Common component styles
  components: {
    card: "bg-white/[0.03] border border-white/10 backdrop-blur-md",
    cardHover: "hover:bg-white/[0.06] transition-all duration-200",
    button: {
      primary:
        "bg-gradient-to-r from-lime-400 to-lime-500 text-black hover:from-lime-300 hover:to-lime-400",
      secondary:
        "bg-transparent text-lime-400 border border-white/10 hover:border-lime-400 hover:bg-lime-400/10",
      outline:
        "border border-white/10 text-gray-300 hover:border-lime-400 hover:text-lime-400",
      ghost: "text-gray-300 hover:text-lime-400 hover:bg-white/[0.04]",
    },
    input:
      "bg-white/[0.02] border-white/10 text-gray-100 placeholder:text-gray-500 focus:border-lime-400",
    gradient: "bg-[linear-gradient(180deg,#0b0f13,#0e1317)]",
  },

  // Layout configuration
  layout: {
    maxWidth: "max-w-7xl",
    containerPadding: "px-4 sm:px-6 lg:px-8",
    sectionSpacing: "py-12",
  },
} as const;

// Theme context
const ThemeContext = createContext(theme);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Theme provider component
interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// Utility function for conditional classes
export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};
