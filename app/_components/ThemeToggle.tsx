'use client'

import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>
    );
};