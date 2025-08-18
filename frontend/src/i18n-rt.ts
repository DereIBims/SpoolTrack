declare global {
  interface Window {
    __APP_CONFIG__?: { LANG?: string }
  }
}

let dict: Record<string, string> = {}
let currentLang = 'de'

export async function initI18n() {
  const lang = window.__APP_CONFIG__?.LANG || 'de'
  currentLang = lang
  console.log(currentLang)
  const res = await fetch(`/locales/${lang}.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Locales not found for ${lang}`)
  dict = await res.json()
}

export function t(key: string, fallback?: string) {
  return dict[key] ?? (fallback ?? key)
}

export function getLang() {
  return currentLang
}
