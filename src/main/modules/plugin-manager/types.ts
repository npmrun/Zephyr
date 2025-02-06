import { BrowserWindow, WebContents } from "electron"

export interface IPluginContext {
    // 提供给插件使用的API
    commands: {
        register: (command: string, callback: (...args: any[]) => any) => void
    }
    tabs: {
        getCurrentTab: () => Electron.WebContents | null
        getAllTabs: () => Electron.WebContents[]
        createTab: (url: string) => void
        onCreated: (callback: (tab: Electron.WebContents) => void) => void
    }
    windows: {
        getCurrentWindow: () => BrowserWindow | null
        getAllWindows: () => BrowserWindow[]
    }
    // 其他API...
}

export interface IPluginAPI {
    activate(context: IPluginContext): Promise<void>
    deactivate?(): Promise<void>
} 