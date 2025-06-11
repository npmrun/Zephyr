type FireFN = (...argu: any[]) => void

type Api<T extends Record<string | symbol, FireFN>> = {
  call: (command: string, ...args: any[]) => any
  callLong: (command: string, ...args: any[]) => any
  callSync: (command: string, ...args: any[]) => any
  send: (command: string, ...argu: any[]) => any
  sendSync: (command: string, ...argu: any[]) => any
  on: <S extends keyof T>(command: S, cb: (event: IpcRendererEventIpcRendererEvent, ...args: Parameters<T[S]>) => void) => () => void
  once: <S extends keyof T>(command: S, cb: (event: IpcRendererEvent, ...args: Parameters<T[S]>) => void) => () => void
  off: <S extends keyof T>(command: S, cb: (event: IpcRendererEvent, ...args: Parameters<T[S]>) => void) => void
  offAll: <S extends keyof T>(command: S) => void
  popupMenu: (options: IPopupMenuOption) => void
}

declare const electron: typeof import("@electron-toolkit/preload").electronAPI
declare const api: Api
declare const getApi: <T>() => Api<T>

interface Window {
  electron: typeof import("@electron-toolkit/preload").electronAPI
  api: Api
  getApi: getApi
}
