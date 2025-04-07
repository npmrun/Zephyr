import { app, dialog, nativeTheme, TitleBarOverlayOptions } from "electron"
import { inject } from "inversify"
import errorHandler from "logger/main-error"
import Tabs from "main/modules/tabs"
import WindowManager from "main/modules/window-manager"
import { getFileUrl } from "main/utils"
import icon from "@res/icon.png?asset"
import setting from "setting/main"
import { LogLevel } from "logger/common"

export default class PlatFormCommand {
  constructor(
    @inject(WindowManager) private _WindowManager: WindowManager,
    @inject(Tabs) private _Tabs: Tabs,
  ) {}

  setTheme(theme: typeof nativeTheme.themeSource) {
    nativeTheme.themeSource = theme
  }

  logSetLevel(level: LogLevel) {
    return setting.set("debug", level)
  }

  logGetLevel() {
    return setting.values("debug")
  }

  setTitlBar(options: TitleBarOverlayOptions) {
    const mainWindow = this._WindowManager.getMainWindow()
    if (mainWindow) {
      mainWindow.setTitleBarOverlay(options)
    }
  }

  showAbout() {
    this._WindowManager.createWindow("about", {
      url: getFileUrl("about.html"),
      overideWindowOpts: true,
      confrimWindowClose: false,
      type: "info",
      windowOpts: {
        width: 600,
        height: 400,
        minimizable: false,
        darkTheme: true,
        modal: true,
        show: false,
        resizable: false,
        icon: icon,
        webPreferences: {
          devTools: false,
          sandbox: false,
          nodeIntegration: false,
          contextIsolation: true,
        },
      },
    })
  }

  toggleDevTools() {
    const focusedWindow = this._WindowManager.getFocusWindow()
    if (focusedWindow) {
      // @ts-ignore ...
      focusedWindow.toggleDevTools()
    }
  }
  fullscreen() {
    const focusedWindow = this._WindowManager.getFocusWindow()
    if (focusedWindow) {
      const isFullScreen = focusedWindow!.isFullScreen()
      focusedWindow!.setFullScreen(!isFullScreen)
    }
  }

  crash() {
    errorHandler.captureError(new Error("手动触发的崩溃"))
    process.crash()
  }

  isFullscreen() {
    const focusedWindow = this._WindowManager.getFocusWindow()
    if (focusedWindow) {
      return focusedWindow!.isFullScreen()
    }
    return false
  }

  relunch() {
    app.relaunch()
    app.exit()
  }

  reload() {
    const focusedWindow = this._WindowManager.getFocusWindow()
    // 重载之后, 刷新并关闭所有的次要窗体
    if (this._WindowManager.length() > 1 && focusedWindow && focusedWindow.$$opts!.name === this._WindowManager.mainInfo.name) {
      const choice = dialog.showMessageBoxSync(focusedWindow, {
        type: "question",
        buttons: ["取消", "是的，继续", "不，算了"],
        title: "警告",
        defaultId: 2,
        cancelId: 0,
        message: "警告",
        detail: "重载主窗口将关闭所有子窗口，是否继续",
      })
      if (choice == 1) {
        this._WindowManager.getWndows().forEach(win => {
          if (win.$$opts!.name !== this._WindowManager.mainInfo.name) {
            win.close()
          }
        })
      } else {
        return
      }
    }
    this._Tabs.closeAll()
    focusedWindow!.reload()
  }
}
