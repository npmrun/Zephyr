import { is } from "@electron-toolkit/utils"
import { join } from "node:path"
import { webContents } from "electron"

export function getFileUrl(app: string) {
  let winURL = ""
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    winURL = process.env["ELECTRON_RENDERER_URL"] + `/${app}#/`
  } else {
    winURL = join(__dirname, `../renderer/${app}#/`)
  }
  return slash(winURL)
}

export function getPreloadUrl(file) {
  return join(__dirname, `../preload/${file}.mjs`)
}

export function isPromise(value: () => any) {
  return value && Object.prototype.toString.call(value) === "[object Promise]"
}

export const broadcast = <T extends string>(event: T, ...args: any[]) => {
  webContents.getAllWebContents().forEach(browser => browser.send(event, ...args))
}

export function slash(path: string) {
  const isExtendedLengthPath = path.startsWith("\\\\?\\")
  if (isExtendedLengthPath) {
    return path
  }
  return path.replace(/\\/g, "/")
}
