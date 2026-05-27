import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type Lang = 'ko' | 'en'

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'ko',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'lang-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
