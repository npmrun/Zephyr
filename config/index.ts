interface IConfig {
    app_title: string
    default_config: {
        language: "zh" | "en"
        "common.theme": "light" | "dark" | "auto"
        "desktop:wallpaper": string
        "update.repo"?: string
        "update.owner"?: string
        "update.allowDowngrade": boolean
        "update.allowPrerelease": boolean
        "editor.bg": string
        "editor.logoType": "logo" | "bg"
        "editor.fontFamily": string
        storagePath: string
    }
}
export default {
    app_title: "zephyr", // 和风
    default_config: {
        storagePath: "$storagePath$",
        language: "zh",
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
} as IConfig
