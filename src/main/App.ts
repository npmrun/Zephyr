import { inject, injectable } from "inversify"
// import Setting from "./modules/setting"
// import DB from "./modules/db"
import Api from "./modules/api"
import WindowManager from "./modules/window-manager"
import { app, nativeTheme, protocol } from "electron"
import { electronApp } from "@electron-toolkit/utils"
import Command from "./modules/commands"
import BaseClass from "./base/base"
import IOC from "./_ioc"
import DB from "./modules/db"
import Zephyr from "./modules/zephyr"
import Updater from "./modules/updater"

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
  {
    scheme: "zephyr",
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
    this._IOC.destroy()
    // 这里是应用正常退出, 可以检测应用是不是非正常退出，比如应用启动时记录一个启动时间并删除上一次结束时间和开始时间，结束时记录一个结束时间，
    // 如果存在结束时间或者不存在开始时间则为正常启动
  }

  constructor(
    @inject(IOC) private _IOC: IOC,
    @inject(Api) private _Api: Api,
    @inject(Command) private _Command: Command,
    @inject(DB) private _DB: DB,
    @inject(WindowManager) private _WindowManager: WindowManager,
    @inject(Zephyr) private _Zephyr: Zephyr,
    @inject(Updater) private _Updater: Updater,
  ) {
    super()
  }

  async init() {
    this._Updater.init()
    this._DB.init()
    this._Command.init()
    this._WindowManager.init()
    app.whenReady().then(() => {
      this._Api.init()
      this._Zephyr.init()
      electronApp.setAppUserModelId("top.xieyaxin")
      this._WindowManager.showMainWindow()
      this._Command.invoke("PlatFormCommand.setTheme", "light")
      this._Command.invoke("PlatFormCommand.setTitlBar", {
        height: 29,
        color: "#F8F8F8",
        symbolColor: "#000000",
      })
    })
    app.on("will-quit", () => {
      this.destroy()
    })
  }
}

export default App
export { App }
