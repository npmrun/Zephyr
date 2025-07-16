import { app } from "electron"
import { get } from "lodash-es"

import zh from "./languages/zh.json"
import en from "./languages/en.json"

type FlattenObject<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & (string | number)]: FlattenObject<T[K], Prefix extends "" ? `${K}` : `${Prefix}.${K}`>
    }[keyof T & (string | number)]
  : Prefix

type FlattenKeys<T> = FlattenObject<T>

type TranslationKey = FlattenKeys<typeof zh>

class Locale {
  locale: string = "zh"

  constructor() {
    try {
      this.locale = app.getLocale()
    } catch (e) {
      console.error(e)
    }
  }

  isCN(): boolean {
    return this.locale.startsWith("zh")
  }

  t(key: TranslationKey, replacements?: Record<string, string>): string {
    let text: string = this.isCN() ? get(zh, key) : get(en, key)
    if (!text) {
      text = get(zh, key)
      if (!text) {
        return key
      }
    }
    if (replacements) {
      // 替换所有形如 {key} 的占位符
      Object.entries(replacements).forEach(([key, value]) => {
        text = text.replace(new RegExp(`{${key}}`, "g"), value)
      })
    }
    return text
  }
}

const Locales = new Locale()
export default Locales
export { Locales }
