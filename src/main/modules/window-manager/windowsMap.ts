import config from "config"
import { BrowserWindowConstructorOptions } from "electron"
import { getFileUrl, getPreloadUrl } from "main/utils"
import icon from "@res/icon.png?asset"

export type Param = Partial<IConfig> & Required<Pick<IConfig, "name">>

export interface IConfig {
  name?: string
  url?: string
  loadURLInSameWin?: boolean
  type?: "info"
  windowOpts?: BrowserWindowConstructorOptions
  overideWindowOpts?: boolean
  ignoreEmptyUrl?: boolean
  denyWindowOpen?: boolean
  confrimWindowClose?: boolean
  confrimWindowCloseText?: {
    title: string
    message: string
    buttons: string[]
    defaultId: number
    cancelId: number
  }
}

export const defaultConfig: IConfig = {
  denyWindowOpen: true,
}

export const defaultWindowConfig = {
  height: 600,
  useContentSize: true,
  width: 800,
  show: true,
  resizable: true,
  minWidth: 900,
  minHeight: 600,
  frame: true,
  transparent: false,
  alwaysOnTop: false,
  webPreferences: {},
}

export function getWindowsMap(): Record<string, IConfig> {
  return {
    main: {
      name: "main",
      url: getFileUrl("index.html"),
      confrimWindowClose: true,
      confrimWindowCloseText: {
        title: config.app_title,
        defaultId: 0,
        cancelId: 0,
        message: "确定要关闭吗？",
        buttons: ["没事", "直接退出"],
      },
      windowOpts: {
        show: false,
        titleBarStyle: "hidden",
        titleBarOverlay: true,
        icon: icon,
        ...(process.platform === "linux" ? { icon } : {}),
        webPreferences: {
          webviewTag: false,
          preload: getPreloadUrl("index"),
          nodeIntegration: true,
          contextIsolation: true,
        },
      },
    },
    _blank: {
      overideWindowOpts: false,
      confrimWindowClose: true,
      confrimWindowCloseText: {
        title: config.app_title,
        defaultId: 0,
        cancelId: 0,
        message: "确定要关闭吗？",
        buttons: ["没事", "直接退出"],
      },
      type: "info",
      windowOpts: {
        height: 600,
        useContentSize: true,
        width: 800,
        show: true,
        resizable: true,
        minWidth: 900,
        minHeight: 600,
        frame: true,
        transparent: false,
        alwaysOnTop: false,
        icon: icon,
        title: config.app_title,
        webPreferences: {
          devTools: false,
          sandbox: true,
          nodeIntegration: false,
          contextIsolation: true,
          webviewTag: false,
          preload: undefined,
        },
      },
    },
  }
}
