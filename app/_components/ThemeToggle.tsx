
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
      <button
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      >
        {theme === "light" ? <FaMoon /> : <FaSun />}
      </button>
    );
};