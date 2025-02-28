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
    locale: string = "en"

    constructor() {
        try {
            this.locale = app.getLocale()
        } catch (e) {
            console.log(e)
        }
    }

    isCN(): boolean {
        return this.locale.startsWith("zh")
    }

    t(key: TranslationKey): string {
        return this.isCN() ? get(zh, key) : get(en, key)
    }
}

const Locales = new Locale()
export default Locales
export { Locales }
