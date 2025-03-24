import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"
import { electronAPI } from "@electron-toolkit/preload"
import { call, callLong, callSync } from "./call"
import { IPopupMenuOption } from "#/popup-menu"
document.addEventListener("DOMContentLoaded", () => {
    const initStyle = document.createElement("style")
    initStyle.textContent = `
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    font-weight: normal;
}

body {
    min-height: 100vh;
    // background-image: linear-gradient(to left bottom, #74C1EB, #385FAC);
    // background: #F8F8F8;
}
`
    document.head.appendChild(initStyle)
})

// Custom APIs for renderer
const api = {
    call,
    callLong,
    callSync,
    send(command: string, ...argu: any[]) {
        if (!command) return
        return ipcRenderer.send(command, ...argu)
    },
    sendSync(command: string, ...argu: any[]) {
        if (!command) return
        return ipcRenderer.sendSync(command, ...argu)
    },
    on(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        ipcRenderer.on(command, cb)
        return () => ipcRenderer.removeListener(command, cb)
    },
    once(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        ipcRenderer.once(command, cb)
        return () => ipcRenderer.removeListener(command, cb)
    },
    off(command: string, cb: (event: IpcRendererEvent, ...args: any[]) => void) {
        return ipcRenderer.removeListener(command, cb)
    },
    offAll(command: string) {
        return ipcRenderer.removeAllListeners(command)
    },
    popupMenu(options: IPopupMenuOption) {
        ipcRenderer.send("x_popup_menu", curWebContentName, options)
    },
}

let curWebContentName = ""
ipcRenderer.once("bind-window-manager", (_, name: string) => {
    curWebContentName = name
})

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI)
        contextBridge.exposeInMainWorld("api", api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore (define in dts)
    window.electron = electronAPI
    // @ts-ignore (define in dts)
    window.api = api
}
