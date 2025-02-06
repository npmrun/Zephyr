import type { WebContents, BrowserWindow } from 'electron'

export interface IPluginContext {
    commands: {
        register: (command: string, callback: (...args: any[]) => any) => void
    }
    tabs: {
        getCurrentTab: () => WebContents | null
        getAllTabs: () => WebContents[]
        createTab: (url: string) => void
        onCreated: (callback: (tab: WebContents) => void) => void
    }
    windows: {
        getCurrentWindow: () => BrowserWindow | null
        getAllWindows: () => BrowserWindow[]
    }
}

export interface IPluginAPI {
    activate(context: IPluginContext): Promise<void>
    deactivate?(): Promise<void>
} 