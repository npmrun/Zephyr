import { is } from "@electron-toolkit/utils"
import { webContents } from "electron"
import { join } from "node:path"
import { slash } from "utils"

export const broadcast = <T extends Record<string, (...argu: any[]) => void>>(event: keyof T, ...args: Parameters<T[keyof T]>) => {
  webContents.getAllWebContents().forEach(browser => browser.send(event as any, ...args))
}

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
