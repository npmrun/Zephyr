import { BrowserWindow, app, dialog } from "electron"
import { cloneDeep, merge } from "lodash"
import { defaultConfig, defaultWindowConfig, getWindowsMap, IConfig, Param } from "./windowsMap"
import { optimizer } from "@electron-toolkit/utils"
import BaseClass from "vc/base/base"
import _debug from "debug"

const debug = _debug("app:window-manager")

declare module "electron" {
    interface BrowserWindow {
        $$forceClose?: boolean
        $$lastChoice?: number
        $$opts?: Param
    }
}
export { WindowManager }
export default class WindowManager extends BaseClass {
    constructor() {
        super()
    }

    destroy() {
        // TODO
    }
    globalChioce: number = -1
    #showWin(info: Param) {
        if (this.#windows.length >= 6) {
            dialog.showErrorBox("错误", "窗口数量超出限制")
            return
        }
        if (!info.name) {
            dialog.showErrorBox("错误", "窗口未指定唯一key")
            return
        }
        const index = this.findIndex(info.name)
        if (index === -1) {
            this.#windows.push(this.#add(info))
        } else {
            if (this.#windows[index].isDestroyed()) {
                this.#windows[index] = this.#add(info)
            } else {
                if (info.url && info.loadURLInSameWin) {
                    this.#windows[index].loadURL(info.url)
                }
                this.#windows[index].show()
            }
        }
        this.showCurrentWindow()
    }

    showMainWindow() {
        this.#showWin(this.mainInfo)
    }

    showWindow(name: string, opts?: Partial<IConfig>) {
        let have = false
        for (const key in this.#urlMap) {
            const info = this.#urlMap[key]
            if (new RegExp(key).test(name)) {
                opts && merge(info, opts)
                info.name = name
                if (!info.ignoreEmptyUrl && !info.url) {
                    dialog.showErrorBox("错误", name + "窗口未提供url")
                    return
                }
                this.#showWin(info as Param)
                have = true
            }
        }
        if (!have) {
            dialog.showErrorBox("错误", name + "窗口未创建成功")
            return
        }
    }

    init() {
        /**
         * 当应用被激活时触发
         */
        app.on("activate", () => {
            this.showMainWindow()
        })
        // Default open or close DevTools by F12 in development
        // and ignore CommandOrControl + R in production.
        // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
        app.on("browser-window-created", (_, window) => {
            optimizer.watchWindowShortcuts(window)
        })
        /**
         * 应用程序开始关闭时回调，可以通过event.preventDefault()阻止，以下两点需要注意：
         * 1. 如果是autoUpdater.quitAndInstall()关闭的，那么会所有窗口关闭，并且在close事件之后执行
         * 2. 关机，重启，用户退出时不会触发
         */
        app.on("before-quit", (event: Electron.Event) => {
            const mainWin = this.get(this.mainInfo.name)
            if (!mainWin || (mainWin && mainWin?.$$forceClose)) {
                // app.exit()
            } else {
                event.preventDefault()
            }
        })

        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit()
            }
        })
    }

    #urlMap = getWindowsMap()

    getWndows() {
        return this.#windows
    }

    length() {
        return this.#windows.length
    }

    public get mainInfo() {
        return this.#urlMap["main"] as Param
    }

    #windows: BrowserWindow[] = []

    #defaultConfig: IConfig = defaultConfig

    #add(config: Param) {
        const curConfig = cloneDeep(this.#defaultConfig ?? {})
        for (const key in config) {
            if (Object.prototype.hasOwnProperty.call(config, key)) {
                const value = config[key]
                // if (Reflect.has(curConfig, key)) {
                curConfig[key] = value
                // }
            }
        }
        const privateConfig = merge(curConfig.overideWindowOpts ? {} : cloneDeep(defaultWindowConfig), curConfig.windowOpts ?? {})
        let parentWindow
        if (typeof privateConfig.parent === "string") {
            parentWindow = this.get(privateConfig.parent)
        }
        if (parentWindow) {
            privateConfig.parent = parentWindow
        }
        const browserWin = new BrowserWindow(privateConfig)
        browserWin.webContents.setWindowOpenHandler(() => {
            if (curConfig.denyWindowOpen) {
                return { action: "deny" }
            }
            return { action: "allow" }
        })
        // @ts-ignore 不需要解释为啥
        browserWin.webContents.$$senderName = curConfig.name
        browserWin.$$forceClose = false
        browserWin.$$lastChoice = -1
        browserWin.on("close", (event: any) => {
            if (this.globalChioce === 1) {
                this.#onClose(curConfig.name)
                return
            }
            if (!curConfig.confrimWindowClose) {
                this.#onClose(curConfig.name)
                return
            }
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const that = this
            function justQuit() {
                browserWin.$$lastChoice = 1
                // app.quit()
                // 不要用quit();试了会弹两次
                browserWin.$$forceClose = true
                if (curConfig.name === that.mainInfo.name) {
                    that.globalChioce = 1
                    app.quit() // exit()直接关闭客户端，不会执行quit();
                } else {
                    that.delete(curConfig.name)
                    that.showCurrentWindow()
                }
            }
            if (browserWin.$$forceClose) {
                that.delete(curConfig.name)
                app.quit()
            } else {
                let choice = -1
                if (browserWin && browserWin!.$$lastChoice !== undefined && browserWin.$$lastChoice >= 0) {
                    choice = browserWin.$$lastChoice
                } else {
                    choice = dialog.showMessageBoxSync(browserWin, {
                        type: "info",
                        title: curConfig.confrimWindowCloseText.title,
                        defaultId: curConfig.confrimWindowCloseText.defaultId,
                        cancelId: curConfig.confrimWindowCloseText.cancelId,
                        message: curConfig.confrimWindowCloseText.message,
                        buttons: curConfig.confrimWindowCloseText.buttons,
                    })
                }
                if (choice === 1) {
                    justQuit()
                } else {
                    event && event.preventDefault()
                }
            }
        })
        browserWin.$$opts = curConfig
        // 在此注册窗口
        browserWin.webContents.addListener("did-finish-load", () => {
            browserWin.webContents.executeJavaScript(`window._global=${JSON.stringify({ name: curConfig.name })};`)
            browserWin.webContents.send("bind-window-manager", curConfig.name)
        })
        // https://www.electronjs.org/zh/docs/latest/tutorial/security#12-%E5%88%9B%E5%BB%BAwebview%E5%89%8D%E7%A1%AE%E8%AE%A4%E5%85%B6%E9%80%89%E9%A1%B9
        // browserWin.webContents.on("will-attach-webview", (_event, webPreferences) => {
        //     if (webPreferences.preload !== path.resolve(app.getAppPath(), "webview.js")) {
        //         // 如果未使用，则删除预加载脚本或验证其位置是否合法
        //         delete webPreferences.preload
        //     }

        //     // 禁用 Node.js 集成
        //     webPreferences.nodeIntegration = false

        //     // 验证正在加载的 URL
        //     // if (!params.src.startsWith('https://example.com/')) {
        //     //   event.preventDefault()
        //     // }
        // })
        if (curConfig.type === "info") {
            // 隐藏菜单
            browserWin.setMenuBarVisibility(false)
        }
        if (curConfig.url) {
            browserWin.loadURL(curConfig.url)
            // logger.debug(`当前窗口网址：${curConfig.url}`)
        }
        if (curConfig.windowOpts?.show === false) {
            if (curConfig.url) {
                browserWin.once("ready-to-show", () => {
                    debug(`准备展示：`, curConfig.url)
                    browserWin?.show()
                })
            } else {
                browserWin?.show()
            }
        }
        return browserWin
    }

    showCurrentWindow() {
        debug(`current open window: ${this.#windows.map(v => v.$$opts!.name).join(",")}`)
    }

    #onClose(name: string) {
        for (let i = this.#windows.length - 1; i >= 0; i--) {
            const win = this.#windows[i]
            if (name === win.$$opts!.name) {
                win.destroy()
                this.#windows.splice(i, 1)
            }
        }
        this.showCurrentWindow()
    }

    get(name: string) {
        return this.#windows.find(v => {
            return v.$$opts!.name === name
        })
    }

    getFocusWindow() {
        const mainWindow = this.getMainWindow()
        if (mainWindow?.isFocused()) {
            return mainWindow
        }
        for (let i = 0; i < this.#windows.length; i++) {
            const win = this.#windows[i]
            if (win.isFocused()) {
                return win
            }
        }
        return
    }

    getMainWindow() {
        return this.#windows.find(v => {
            return v.$$opts!.name === this.mainInfo.name
        })
    }

    close(name: string | RegExp) {
        const indexList = this.findAllIndex(name)
        for (let i = indexList.length - 1; i >= 0; i--) {
            const index = indexList[i]
            const win = this.#windows[index]
            win.close()
        }
    }

    delete(name: string | RegExp) {
        const indexList = this.findAllIndex(name)
        for (let i = indexList.length - 1; i >= 0; i--) {
            const index = indexList[i]
            this.#windows.splice(index, 1)
        }
    }

    findIndex(name: string | RegExp) {
        const index = this.#windows.findIndex(v => {
            if (typeof name === "string") {
                return v.$$opts!.name === name
            } else {
                return name.test(v.$$opts!.name)
            }
        })
        return index
    }

    findAllIndex(name: string | RegExp) {
        const result: number[] = []
        for (let i = 0; i < this.#windows.length; i++) {
            const win = this.#windows[i]
            if (typeof name === "string" && win.$$opts!.name === name) {
                result.push(i)
            } else if (typeof name !== "string" && name.test(win.$$opts!.name)) {
                result.push(i)
            }
        }
        return result
    }

    // show(name: string | RegExp) {
    //     let indexList = this.findAllIndex(name)
    //     if (!!indexList.length) {
    //         for (let i = 0; i < indexList.length; i++) {
    //             const index = indexList[i];
    //             const win = this.#windows[index]
    //             if (win.isDestroyed()) {
    //                 this.#windows[index] = this.#add(win.$$opts)
    //             } else {
    //                 win.show()
    //             }
    //         }
    //     } else {
    //         console.warn("该窗口不存在")
    //     }
    // }

    getCurrentWindow(): BrowserWindow | null {
        return this.getMainWindow() || null
    }

    getAllWindows(): BrowserWindow[] {
        return this.#windows
    }
}
