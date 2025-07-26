type FireFN = (...argu: any[]) => void

type Api<M extends Record<string, (...argu: any[]) => void>, T extends Record<string, FireFN>, N extends string> = {
  call: <S extends keyof M>(command: `${N}${N extends string ? "." : ""}${S}`, ...args: Parameters<M[S]>) => any
  callLong: <S extends keyof M>(command: `${N}${N extends string ? "." : ""}${S}`, ...args: Parameters<M[S]>) => any
  callSync: <S extends keyof M>(command: `${N}${N extends string ? "." : ""}${S}`, ...args: Parameters<M[S]>) => any
  send: <S extends keyof M>(command: `${N}${N extends string ? "." : ""}${S}`, ...argu: Parameters<M[S]>) => any
  sendSync: <S extends keyof M>(command: `${N}${N extends string ? "." : ""}${S}`, ...argu: Parameters<M[S]>) => any
  on: <S extends keyof T>(
    command: `${N}${N extends string ? "." : ""}${S}`,
    cb: (event: IpcRendererEventIpcRendererEvent, ...args: Parameters<T[S]>) => void,
  ) => () => void
  once: <S extends keyof T>(
    command: `${N}${N extends string ? "." : ""}${S}`,
    cb: (event: IpcRendererEvent, ...args: Parameters<T[S]>) => void,
  ) => () => void
  off: <S extends keyof T>(
    command: `${N}${N extends string ? "." : ""}${S}`,
    cb: (event: IpcRendererEvent, ...args: Parameters<T[S]>) => void,
  ) => void
  offAll: <S extends keyof T>(command: `${N}${N extends string ? "." : ""}${S}`) => void
  popupMenu: (options: IPopupMenuOption) => void
}

declare const electron: typeof import("@electron-toolkit/preload").electronAPI
declare const api: Api
declare const getApi: <M, T, N>() => Api<M, T, N>

interface Window {
  electron: typeof import("@electron-toolkit/preload").electronAPI
  api: Api
  getApi: getApi
}
