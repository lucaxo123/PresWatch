import { useEffect, useState } from 'react'
import { useThemeStore } from '../stores/themeStore'

const read = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

const resolve = () => ({
  accent: `rgb(${read('--brand') || '159 31 58'})`,
  border: `rgb(${read('--border') || '231 229 228'})`,
  textMuted: `rgb(${read('--text-muted') || '120 113 108'})`,
  textSecondary: `rgb(${read('--text-secondary') || '68 64 60'})`,
  surfaceRaised: `rgb(${read('--surface-raised') || '255 255 255'})`,
  surfaceMuted: `rgb(${read('--surface-muted') || '245 245 244'})`,
})

export const useThemeColors = () => {
  const mode = useThemeStore((s) => s.mode)
  const [colors, setColors] = useState(() =>
    typeof window === 'undefined'
      ? {
          accent: 'rgb(159 31 58)',
          border: 'rgb(231 229 228)',
          textMuted: 'rgb(120 113 108)',
          textSecondary: 'rgb(68 64 60)',
          surfaceRaised: 'rgb(255 255 255)',
          surfaceMuted: 'rgb(245 245 244)',
        }
      : resolve()
  )

  useEffect(() => {
    const update = () => setColors(resolve())
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', update)
    return () => {
      observer.disconnect()
      mq.removeEventListener('change', update)
    }
  }, [mode])

  return colors
}
