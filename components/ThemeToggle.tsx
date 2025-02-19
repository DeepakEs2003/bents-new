"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="text-gray-700 dark:text-gray-300 hover:text-[rgba(23,155,215,255)] transition-transform hover:scale-110"
    >
      {theme === "dark" ? (
        <Sun size={24} className="w-7 h-7 sm:w-6 sm:h-6" />
      ) : (
        <Moon size={24} className="w-7 h-7 sm:w-6 sm:h-6" />
      )}
    </button>
  );
}