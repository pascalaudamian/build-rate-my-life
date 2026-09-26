'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = document.cookie.match(/(?:^|; )rml-theme=(light|dark)/)?.[1] as Theme | undefined
    const preferred = stored ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    setThemeState(preferred)
    document.documentElement.dataset.theme = preferred
  }, [])

  function setTheme(nextTheme: Theme) {
    setThemeState(nextTheme)
    document.documentElement.dataset.theme = nextTheme
    document.cookie = `rml-theme=${nextTheme}; path=/; max-age=31536000; samesite=lax`
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
