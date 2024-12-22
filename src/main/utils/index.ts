import { is } from "@electron-toolkit/utils"
import { join } from "node:path"
import { webContents } from "electron"

export function getFileUrl(app: string, route: string = "") {
    let winURL = ""
    if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
        winURL = process.env["ELECTRON_RENDERER_URL"] + `/${app}#/${route}`
    } else {
        winURL = join(__dirname, `../renderer/${app}#/${route}`)
    }
    return winURL
}

export function isPromise(value: () => any) {
    return value && Object.prototype.toString.call(value) === "[object Promise]"
}

export const broadcast = (event: string, ...args: any[]) => {
    webContents.getAllWebContents().forEach(browser => browser.send(event, ...args))
}
