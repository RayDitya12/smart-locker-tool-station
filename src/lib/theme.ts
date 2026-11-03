const KEY = 'slt-theme'

export type ThemeMode = 'light' | 'dark'

function preferred(): ThemeMode {
  const saved = localStorage.getItem(KEY)
  if (saved === 'light' || saved === 'dark') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function apply(mode: ThemeMode) {
  const root = document.documentElement
  root.classList.toggle('dark', mode === 'dark')
  root.style.colorScheme = mode
}

export function initTheme(): void {
  apply(preferred())
}

export function currentTheme(): ThemeMode {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function toggleTheme(): ThemeMode {
  const mode: ThemeMode = currentTheme() === 'dark' ? 'light' : 'dark'
  localStorage.setItem(KEY, mode)
  apply(mode)
  return mode
}
