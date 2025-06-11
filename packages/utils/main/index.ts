import { webContents } from "electron"

export const broadcast = <T extends Record<string, (...argu: any[]) => void>>(event: keyof T, ...args: Parameters<T[keyof T]>) => {
  webContents.getAllWebContents().forEach(browser => browser.send(event as any, ...args))
}
