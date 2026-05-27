import { useLangStore } from '../store/useLangStore'
import ko from '../i18n/ko.json'
import en from '../i18n/en.json'

type TranslationKey = keyof typeof ko

const dict = { ko, en } as const

/**
 * 번역 훅
 * - t('key') 로 현재 언어에 맞는 문자열 반환
 * - TypeScript 자동완성 지원 (key 목록은 ko.json 기준)
 */
export function useT() {
  const { lang } = useLangStore()
  const t = (key: TranslationKey): string => dict[lang][key] ?? dict['ko'][key] ?? key
  return { t, lang }
}
