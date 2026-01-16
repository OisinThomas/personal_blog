'use client'

import { useTheme } from '@/lib/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-lg bg-surface-1 hover:bg-surface-2 border border-card-border hover:border-primary/20 transition-all focus-ring"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon size={18} className="text-secondary-600 hover:text-primary transition-colors" />
      ) : (
        <Sun size={18} className="text-secondary-400 hover:text-primary transition-colors" />
      )}
    </button>
  )
}
