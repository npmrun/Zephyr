import { app, dialog, nativeTheme, TitleBarOverlayOptions } from "electron"
import { inject } from "inversify"
import Tabs from "main/modules/tabs"
import WindowManager from "main/modules/window-manager"

export default class PlatFormCommand {
  constructor(
    @inject(WindowManager) private _WindowManager: WindowManager,
    @inject(Tabs) private _Tabs: Tabs,
  ) {}

  setTheme(theme: typeof nativeTheme.themeSource) {
    nativeTheme.themeSource = theme
  }

  setTitlBar(options: TitleBarOverlayOptions) {
    const mainWindow = this._WindowManager.getMainWindow()
    if (mainWindow) {
      mainWindow.setTitleBarOverlay(options)
    }
  }

  showAbout() {
    this._WindowManager.showWindow("about")
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
