import { LogLevel } from "logger/common"
import AppConfig from "./app_config.json"
import ExeConfig from "./exe_config.json"

// 定义主题类型
type ThemeType = "light" | "dark" | "auto"
// 定义语言类型
type LanguageType = "zh" | "en"

export type IConfig = typeof AppConfig &
  Pick<Partial<typeof AppConfig>, "common.theme"> & {
    language: LanguageType
    "common.theme": ThemeType
    "dev:debug": LogLevel
  }

export default {
  AppConfig,
  ExeConfig,
}
