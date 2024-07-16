'use client'

import { useTheme } from "@/src/Theme/ThemeProvider";
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            {theme === 'light' ? <FaMoon /> : <FaSun />}
        </button>
    );
};