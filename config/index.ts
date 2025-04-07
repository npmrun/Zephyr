import { LogLevel } from "logger/common"
// 定义主题类型
type ThemeType = "light" | "dark" | "auto"
// 定义语言类型
type LanguageType = "zh" | "en"
// 定义编辑器logo类型
type LogoType = "logo" | "bg"

// 配置接口定义
export interface IDefaultConfig {
  language: LanguageType
  "common.theme": ThemeType
  "debug": LogLevel,
  "desktop:wallpaper": string
  "update.repo"?: string
  "update.owner"?: string
  "update.allowDowngrade": boolean
  "update.allowPrerelease": boolean
  "editor.bg": string
  "editor.logoType": LogoType
  "editor.fontFamily": string
  storagePath: string
}

interface IConfig {
  app_title: string
  default_config: IDefaultConfig
}

// 默认配置导出
export default {
  app_title: "zephyr", // 和风
  default_config: {
    storagePath: "$storagePath$",
    language: "zh",
    debug: LogLevel.INFO,
    "common.theme": "auto",
    "desktop:wallpaper": "",
    "editor.bg": "",
    "editor.logoType": "logo",
    "editor.fontFamily": "Cascadia Mono, Consolas, 'Courier New', monospace",
    "update.repo": "wood-desktop",
    "update.owner": "npmrun",
    "update.allowDowngrade": false,
    "update.allowPrerelease": false,
  },
} as const satisfies IConfig
