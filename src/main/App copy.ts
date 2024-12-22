import { inject, injectable } from "inversify"
// import Setting from "./modules/setting"
// import DB from "./modules/db"
import Api from "./modules/api"
import WindowManager from "./modules/window-manager"
import { app, nativeTheme, protocol, WebContentsView } from "electron"
import { electronApp } from "@electron-toolkit/utils"
import Tabs from "./modules/tabs/Tabs"
import { getFileUrl } from "./utils"
import BaseClass from "./base/base"

protocol.registerSchemesAsPrivileged([
    // {
    //     scheme: "http",
    //     privileges: { standard: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true },
    // },
    // {
    //     scheme: "https",
    //     privileges: { standard: true, bypassCSP: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true, stream: true },
    // },
    // { scheme: "mailto", privileges: { standard: true } },
    {
        scheme: "api",
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
        },
    },
])

@injectable()
class App extends BaseClass {
    destroy() {
        // destroyAll()
        // 这里是应用正常退出
    }
    // private _setting: Setting
    // private _db: DB
    private _Api: Api
    private _windowManager: WindowManager
    private _tabs: Tabs

    constructor(
        // @inject(Setting) setting: Setting,
        // @inject(DB) db: DB,
        @inject(Api) Api: Api,
        @inject(WindowManager) windowManager: WindowManager,
        @inject(Tabs) tabs: Tabs,
    ) {
        super()
        // this._setting = setting
        // this._db = db
        this._Api = Api
        this._windowManager = windowManager
        this._tabs = tabs
    }

    async init() {
        this._windowManager.init()
        app.whenReady().then(() => {
            electronApp.setAppUserModelId("top.xieyaxin")
            this.create()
            this._Api.init()
        })
        app.on("window-all-closed", () => {
            if (process.platform !== "darwin") {
                app.quit()
            }
        })
        app.on("will-quit", () => {
            this.destroy()
        })
    }

    create() {
        this._windowManager.showMainWindow()
        const mainWindow = this._windowManager.getMainWindow()
        if (mainWindow) {
            nativeTheme.themeSource = "light"
            mainWindow.setTitleBarOverlay({
                height: 29, // the smallest size of the title bar on windows accounting for the border on windows 11
                color: "#F8F8F8",
                symbolColor: "#000000",
            })
            this._windowManager.showWindow("main-top")
            const mainTopWindow = this._windowManager.get("main-top")
            setTimeout(() => {
                // console.log(mainWindow.getParentWindow());
                setTimeout(() => {
                    mainWindow.contentView.children.length = 0
                    const view = new WebContentsView()
                    view.addChildView(mainTopWindow!.contentView)
                    view.webContents.loadURL(getFileUrl("about.html"))
                    // mainTopWindow!.contentView.setBounds({ x: 0, y: 0, width: 100, height: 30 })
                    // view.setBounds({ x: 0, y: 0, width: 100, height: 30 })
                    mainWindow.contentView.addChildView(view)
                    // mainWindow.contentView.children.sort()
                    console.log(mainWindow.contentView.children)
                }, 5000)
                // mainWindow.webContents = mainTopWindow!.webContents
                mainWindow.reload()
                console.log(mainWindow.webContents.getURL())

                // mainTopWindow?.destroy()
                // mainWindow.contentView.addChildView(mainWindow.contentView)
                console.log(`child count: `, mainWindow.contentView.children.length)
            }, 2000)
            // if (mainTopWindow) {
            //     mainTopWindow.setParentWindow(mainWindow)
            //     mainTopWindow.setIgnoreMouseEvents(true, { forward: false })
            //     const listenMove = () => {
            //         if (mainWindow && mainTopWindow) {
            //             const pos = mainWindow.getPosition()
            //             mainTopWindow.setPosition(pos[0], pos[1])
            //         }
            //     }
            //     mainWindow?.on("move", listenMove)
            //     const listenResize = () => {
            //         if (mainWindow && mainTopWindow) {
            //             const size = mainWindow.getSize()
            //             console.log(size)
            //             mainTopWindow.setSize(size[0], size[1])
            //             const pos = mainWindow.getPosition()
            //             mainTopWindow.setPosition(pos[0], pos[1])
            //         }
            //     }
            //     listenResize()
            //     mainWindow?.on("resize", listenResize)
            // }
        }
        // 考虑双browserwindow模式
        /**
         * 因为browserwindow可以设置穿透，考虑将tab放在底层window上，其他组件放在上层window上。
         */
        // const webContentsView = new WebContentsView({
        //     webPreferences: {
        //         preload: join(__dirname, "../preload/index.mjs"),
        //         transparent: true,
        //         nodeIntegration: true,
        //         spellcheck: false,
        //         contextIsolation: true,
        //     },
        // })
        // // mainWindow!.contentView = webContentsView
        // // setTimeout(() => {
        // mainWindow!.contentView.addChildView(webContentsView)
        // // mainWindow?.setIgnoreMouseEvents(true, { forward: true })
        // // }, 2000);
        // webContentsView.webContents.loadURL(getFileUrl("index.html"))
        // const listenResize = () => {
        //     const size = mainWindow!.getSize()
        //     webContentsView.setBounds({ x: 0, y: 0, width: size[0], height: size[1] })
        // }
        // listenResize()
        // mainWindow!.addListener("resize", listenResize)

        this._tabs.add("https://baidu.com", true)
        this._tabs.add("https://zhihu.com")
        return mainWindow
    }
}

export default App
export { App }
