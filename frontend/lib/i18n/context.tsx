"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { translations, type Language, type TranslationKey } from "./translations"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  availableLanguages: { code: Language; name: string; nativeName: string }[]
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export const availableLanguages = [
  { code: "en" as Language, name: "English", nativeName: "English" },
  { code: "hi" as Language, name: "Hindi", nativeName: "हिन्दी" },
  { code: "ne" as Language, name: "Nepali", nativeName: "नेपाली" },
]

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en")

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("agrosmart-language") as Language
    if (savedLanguage && translations[savedLanguage]) {
      setLanguageState(savedLanguage)
    } else {
      // Try to detect browser language
      const browserLang = navigator.language.split("-")[0] as Language
      if (translations[browserLang]) {
        setLanguageState(browserLang)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("agrosmart-language", lang)
  }

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, availableLanguages }}>{children}</I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

export const useLanguage = useI18n
