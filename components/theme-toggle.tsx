'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const nextTheme = theme === 'light' ? 'dark' : 'light'
  return <button className="theme-toggle" type="button" onClick={() => setTheme(nextTheme)} aria-label={`Switch to ${nextTheme} theme`} title={`Switch to ${nextTheme} theme`}><span className="theme-toggle-icon">{theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}</span><span>{theme === 'light' ? 'Black theme' : 'White theme'}</span></button>
}
