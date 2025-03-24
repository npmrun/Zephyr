
type Api = {
    call: (command: string, ...args: any[]) => Promise<any>
    callLong: (command: string, ...args: any[]) => Promise<any>
    callSync: (command: string, ...args: any[]) => any
    send: (command: string, ...argu: any[]) => any
    sendSync: (command: string, ...argu: any[]) => any
    on: <T extends string>(command: T, cb: (event: IpcRendererEvent, ...args: any[]) => void) => () => void
    once: (command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) => () => void
    off: (command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) => void
    offAll: (command: string) => void
    popupMenu: (options: IPopupMenuOption) => void
}

declare const electron: typeof import("@electron-toolkit/preload").electronAPI
declare const api: Api

interface Window {
    electron: typeof import("@electron-toolkit/preload").electronAPI
    api: Api
}
