type FireFN = (...argu: any[]) => void

type Api<T extends Record<string | symbol, FireFN>> = {
  call: <S extends keyof T>(command: S, ...args: Parameters<T[S]>) => ReturnType<T[S]>
  callLong: <S extends keyof T>(command: S, ...args: Parameters<T[S]>) => ReturnType<T[S]>
  callSync: <S extends keyof T>(command: S, ...args: Parameters<T[S]>) => ReturnType<T[S]>
  send: <S extends keyof T>(command: S, ...argu: Parameters<T[S]>) => ReturnType<T[S]>
  sendSync: <S extends keyof T>(command: S, ...argu: Parameters<T[S]>) => ReturnType<T[S]>
  on: <S extends keyof T>(command: S, cb: (event: IpcRendererEvent, ...args: Parameters<T[S]>) => void) => () => void
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
